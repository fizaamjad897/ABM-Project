'use client';

import * as React from 'react';
import {
    Box, Button, Typography, Stack, Slider, Switch, TextField,
    IconButton, LinearProgress, Tooltip as MuiTooltip,
} from '@mui/material';
import { PlayArrow, Stop, ArrowUpward } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { c } from '../theme';
import { Nav, Panel, Label, Metric, MetricStrip, Tag, Dot, MAX_W } from '../ui/primitives';
import Topology, { type NodeState } from '../ui/Topology';

type LogEntry = { id: string; time: number; type: string; msg: string };

/* Colour in the log means what it means everywhere else. */
const LOG_TONE = (t: string) =>
    t.includes('HIT') ? c.hit
        : t.includes('MISS') || t.includes('DB') || t.includes('EVICT') ? c.origin
            : t.includes('CHAOS') || t.includes('KILL') || t.includes('DOWN') ? c.miss
                : t.includes('WRITE') || t.includes('INVALIDATE') || t.includes('REHASH') ? c.route
                    : c.ink3;

export default function Dashboard() {
    const [isRunning, setIsRunning] = React.useState(false);
    const [metrics, setMetrics] = React.useState<any[]>([]);
    const [fullMetrics, setFullMetrics] = React.useState<any>({});
    const [agentStates, setAgentStates] = React.useState<Record<string, boolean>>({});
    const [agentStats, setAgentStats] = React.useState<Record<string, any>>({});
    const [logs, setLogs] = React.useState<LogEntry[]>([]);
    const [chat, setChat] = React.useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = React.useState('');
    const [config, setConfig] = React.useState({ nodes: 4, cacheSize: 150, chaos: true, duration: 1000 });
    const [error, setError] = React.useState<string | null>(null);
    const [wsConnected, setWsConnected] = React.useState(false);
    const [simProgress, setSimProgress] = React.useState(0);
    const [simTime, setSimTime] = React.useState(0);
    const [isTyping, setIsTyping] = React.useState(false);

    const ws = React.useRef<WebSocket | null>(null);
    const chatBoxRef = React.useRef<HTMLDivElement | null>(null);
    const logBoxRef = React.useRef<HTMLDivElement | null>(null);
    const logIdCounter = React.useRef(0);
    const metricsRef = React.useRef<any[]>([]);
    const configRef = React.useRef(config);

    const pin = (el: HTMLDivElement | null) => { if (el) el.scrollTop = el.scrollHeight; };
    React.useEffect(() => { pin(chatBoxRef.current); }, [chat, isTyping]);
    React.useEffect(() => { pin(logBoxRef.current); }, [logs]);

    /* ---------- telemetry socket ---------- */
    React.useEffect(() => {
        try {
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
            ws.current = new WebSocket(`${wsUrl}/ws/simulation`);
            ws.current.onopen = () => setWsConnected(true);
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'SIM_UPDATE') {
                    const hits = data.metrics.hits || 0;
                    const misses = data.metrics.misses || 0;
                    const ratio = (hits + misses) > 0 ? (hits / (hits + misses)) * 100 : 0;
                    metricsRef.current = [...metricsRef.current.slice(-100), { time: Math.round(data.time), hitRatio: ratio }];
                    setMetrics([...metricsRef.current]);
                    setFullMetrics(data.metrics);
                    setAgentStates(data.agent_states);
                    setAgentStats(data.agent_stats || {});
                    setSimProgress(data.progress);
                    setSimTime(data.time);
                    if (data.progress >= 100) setIsRunning(false);
                } else if (data.type === 'LOG') {
                    setLogs((prev) => [...prev.slice(-120), {
                        id: `log-${logIdCounter.current++}`,
                        time: data.time,
                        type: data.log_type || 'INFO',
                        msg: data.msg || '',
                    }]);
                } else if (data.type === 'SIM_FINISHED') {
                    setIsRunning(false);
                    const results = {
                        id: `sim-${Date.now()}`,
                        metrics: data.final_metrics,
                        timeline: metricsRef.current,
                        agent_states: data.agent_states || {},
                        config: configRef.current,
                        timestamp: new Date().toISOString(),
                    };
                    let history: any[] = [];
                    try {
                        const raw = localStorage.getItem('cachenet_modeling_history');
                        history = raw ? JSON.parse(raw) : [];
                        if (!Array.isArray(history)) history = [];
                    } catch { history = []; }
                    history.unshift(results);
                    localStorage.setItem('cachenet_modeling_history', JSON.stringify(history.slice(0, 50)));
                    localStorage.setItem('cachenet_last_experiment', JSON.stringify(results));
                }
            };
            ws.current.onclose = () => setWsConnected(false);
            ws.current.onerror = () => setWsConnected(false);
        } catch { setWsConnected(false); }
        return () => ws.current?.close();
    }, []);

    const startSim = () => {
        if (!wsConnected) { setError('The simulation engine is not reachable. Start the backend on port 8000 and reload.'); return; }
        setError(null);
        setLogs([]); setMetrics([]); metricsRef.current = [];
        setChat([{ role: 'assistant', content: 'Model armed. Ask me anything about the run once telemetry starts arriving.' }]);
        ws.current?.send(JSON.stringify({ type: 'START_SIM', config }));
        setIsRunning(true);
    };

    const stopSim = () => {
        ws.current?.send(JSON.stringify({ type: 'STOP_SIM' }));
        setIsRunning(false);
    };

    const patch = (p: Partial<typeof config>) => {
        const next = { ...config, ...p };
        setConfig(next);
        configRef.current = next;
    };

    const handleChat = async () => {
        if (!input.trim()) return;
        const userQuery = input;
        setChat((p) => [...p, { role: 'user', content: userQuery }]);
        setInput('');
        setIsTyping(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/ai/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userQuery, metrics: { ...fullMetrics, agent_stats: agentStats } }),
            });
            const data = await res.json();
            setChat((p) => [...p, { role: 'assistant', content: data.response }]);
        } catch {
            setChat((p) => [...p, { role: 'assistant', content: 'The analyst is unreachable. Check that the backend is running and that a GROQ_API_KEY is set.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    /* ---------- derived ---------- */
    const totalReads = (fullMetrics.hits || 0) + (fullMetrics.misses || 0);
    const hitRatio = totalReads > 0 ? ((fullMetrics.hits / totalReads) * 100).toFixed(1) : '0.0';
    const latest = logs[logs.length - 1];

    const nodeStates = React.useMemo(() => {
        const s: Record<string, NodeState> = {};
        for (let i = 0; i < config.nodes; i++) {
            const key = `node_${i}`;
            if (agentStates[key] === false) { s[key] = 'dead'; continue; }
            if (latest?.msg?.includes(key)) {
                if (latest.type.includes('HIT')) s[key] = 'hit';
                else if (latest.type.includes('MISS')) s[key] = 'miss';
            }
        }
        if (latest?.type?.includes('MISS')) s.database = 'miss';
        return s;
    }, [agentStates, latest, config.nodes]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: c.paper, display: 'flex', flexDirection: 'column' }}>
            <Nav current="Dashboard">
                <Tag tone={wsConnected ? 'hit' : 'miss'}>
                    <Dot tone={wsConnected ? 'hit' : 'miss'} pulse={wsConnected} />
                    {wsConnected ? 'Engine connected' : 'Engine offline'}
                </Tag>
                <Button
                    variant="contained"
                    size="small"
                    onClick={isRunning ? stopSim : startSim}
                    startIcon={isRunning ? <Stop sx={{ fontSize: 16 }} /> : <PlayArrow sx={{ fontSize: 16 }} />}
                    sx={isRunning ? { bgcolor: c.miss, color: c.paper, '&:hover': { bgcolor: '#ff7276' } } : undefined}
                >
                    {isRunning ? 'Stop' : 'Run model'}
                </Button>
            </Nav>

            <Box sx={{ maxWidth: MAX_W, width: '100%', mx: 'auto', px: { xs: 2, md: 4 }, py: 3, flex: 1 }}>
                {error && (
                    <Box sx={{
                        mb: 2.5, px: 2, py: 1.5, border: `1px solid ${c.missLine}`, bgcolor: c.missWash,
                        borderRadius: '8px', display: 'flex', gap: 1.5, alignItems: 'center',
                    }}>
                        <Dot tone="miss" />
                        <Typography sx={{ fontSize: 13.5, color: c.miss }}>{error}</Typography>
                    </Box>
                )}

                <MetricStrip>
                    <Metric label="Hit ratio" value={`${hitRatio}%`} hint={totalReads ? `${fullMetrics.hits} of ${totalReads} reads` : 'No reads yet'} />
                    <Metric label="Total reads" value={totalReads.toLocaleString()} hint={`${config.nodes} nodes routing`} />
                    <Metric label="Cache misses" value={(fullMetrics.misses || 0).toLocaleString()} hint="Served from origin" />
                    <Metric label="Clock" value={`${simTime.toFixed(1)}s`} hint={isRunning ? `${simProgress.toFixed(0)}% of cycle` : 'Idle'} />
                </MetricStrip>

                {isRunning && (
                    <LinearProgress variant="determinate" value={simProgress} sx={{ mt: 1.5, borderRadius: 2 }} />
                )}

                <Box sx={{
                    mt: 3, display: 'grid', gap: 2.5, alignItems: 'start',
                    gridTemplateColumns: { xs: '1fr', lg: '256px minmax(0,1fr)', xl: '256px minmax(0,1fr) 340px' },
                }}>
                    {/* ---------- rail: parameters + agents ---------- */}
                    <Stack spacing={2.5}>
                        <Panel title="Parameters">
                            <Box sx={{ mb: 2.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                                    <Label>Nodes</Label>
                                    <Typography className="num" sx={{ fontSize: 13, fontWeight: 500 }}>{config.nodes}</Typography>
                                </Stack>
                                <Slider
                                    value={config.nodes} min={1} max={10} size="small" disabled={isRunning}
                                    onChange={(_, v) => patch({ nodes: v as number })}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                                    <Label>Cache per node</Label>
                                    <Typography className="num" sx={{ fontSize: 13, fontWeight: 500 }}>{config.cacheSize} MB</Typography>
                                </Stack>
                                <Slider
                                    value={config.cacheSize} min={50} max={500} step={10} size="small" disabled={isRunning}
                                    onChange={(_, v) => patch({ cacheSize: v as number })}
                                />
                            </Box>
                            <Box sx={{ pt: 2, borderTop: `1px solid ${c.lineSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: 13.5, color: c.ink }}>Chaos Monkey</Typography>
                                    <Typography sx={{ fontSize: 12, color: c.ink3, mt: .25 }}>Kills nodes mid-run</Typography>
                                </Box>
                                <Switch checked={config.chaos} disabled={isRunning} onChange={(e) => patch({ chaos: e.target.checked })} />
                            </Box>
                        </Panel>

                        <Panel title="Agents">
                            <Box>
                                <Row k="load_balancer" v={<Dot tone="hit" />} />
                                {Array.from({ length: config.nodes }).map((_, i) => {
                                    const st = agentStats[`node_${i}`];
                                    const dead = agentStates[`node_${i}`] === false;
                                    return (
                                        <Row
                                            key={i}
                                            k={`node_${i}`}
                                            dim={dead}
                                            v={dead
                                                ? <Typography sx={{ fontSize: 11.5, color: c.miss, fontWeight: 500 }}>down</Typography>
                                                : <Typography className="mono num" sx={{ fontSize: 11.5, color: c.ink3 }}>
                                                    {st ? `${st.hits ?? 0}/${st.misses ?? 0}` : '—'}
                                                </Typography>}
                                        />
                                    );
                                })}
                                <Row k="database" v={<Dot tone="origin" />} />
                                <Row k="observer" v={<Dot tone={isRunning ? 'hit' : 'neutral'} pulse={isRunning} />} />
                            </Box>
                        </Panel>
                    </Stack>

                    {/* ---------- centre: plot + topology ---------- */}
                    <Stack spacing={2.5} sx={{ minWidth: 0 }}>
                        <Panel
                            title="Hit ratio over model time"
                            action={
                                <Tag tone={isRunning ? 'hit' : 'neutral'}>
                                    {isRunning ? <><Dot tone="hit" pulse />Streaming</> : 'Idle'}
                                </Tag>
                            }
                            bodySx={{ p: 1.5, pl: 0 }}
                        >
                            <Box sx={{ height: 232 }}>
                                {metrics.length === 0 ? (
                                    <Empty text="Run the model to plot telemetry." />
                                ) : (
                                    <ResponsiveContainer>
                                        <AreaChart data={metrics} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                                            <defs>
                                                <linearGradient id="fillRatio" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={c.hit} stopOpacity={0.22} />
                                                    <stop offset="100%" stopColor={c.hit} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke={c.lineSoft} vertical={false} />
                                            <XAxis dataKey="time" hide />
                                            <YAxis
                                                domain={[0, 100]} width={38} unit="%"
                                                tick={{ fill: c.ink3, fontSize: 11 }}
                                                axisLine={false} tickLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ stroke: c.lineStrong, strokeWidth: 1 }}
                                                contentStyle={{
                                                    background: c.sunken, borderRadius: 4, border: `1px solid ${c.line}`,
                                                    boxShadow: 'none', fontSize: 12, padding: '6px 9px', color: c.ink,
                                                }}
                                                itemStyle={{ color: c.ink }}
                                                labelStyle={{ color: c.ink3 }}
                                                labelFormatter={(v) => `t = ${v}`}
                                                formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Hit ratio']}
                                            />
                                            <Area
                                                type="monotone" dataKey="hitRatio" stroke={c.hit} strokeWidth={1.75}
                                                fill="url(#fillRatio)" isAnimationActive={false} dot={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </Box>
                        </Panel>

                        <Panel
                            title="Topology"
                            action={<Typography className="mono" sx={{ fontSize: 11, color: c.ink3 }}>
                                {config.nodes} nodes · {config.cacheSize} MB
                            </Typography>}
                            bodySx={{ p: 2 }}
                        >
                            <Topology count={config.nodes} states={nodeStates} running={isRunning} height={Math.max(300, config.nodes * 64 + 60)} />
                        </Panel>
                    </Stack>

                    {/* ---------- analyst ---------- */}
                    <Panel
                        title="Analyst"
                        action={<Typography className="mono" sx={{ fontSize: 11, color: c.ink3 }}>llama-3.3-70b</Typography>}
                        flush
                        sx={{ height: { xl: 620 }, minHeight: 420, gridColumn: { lg: '1 / -1', xl: 'auto' } }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box ref={chatBoxRef} sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {chat.length === 0 && (
                                    <Empty text="Run the model, then ask why the numbers moved." />
                                )}
                                {chat.map((m, i) => (
                                    <Box key={i} sx={{
                                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '92%', px: 1.75, py: 1.25, borderRadius: '8px',
                                        fontSize: 13.5, lineHeight: 1.6,
                                        bgcolor: m.role === 'user' ? c.ink : c.sunken,
                                        color: m.role === 'user' ? c.paper : c.ink,
                                        border: `1px solid ${m.role === 'user' ? c.ink : c.line}`,
                                        '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                                        '& ul, & ol': { pl: 2.5, mb: 1 },
                                        '& code': {
                                            fontFamily: 'var(--font-mono), monospace', fontSize: 11.5,
                                            bgcolor: c.paper, border: `1px solid ${c.line}`,
                                            px: .5, borderRadius: '3px',
                                        },
                                        '& strong': { fontWeight: 600 },
                                    }}>
                                        {m.role === 'assistant'
                                            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                            : m.content}
                                    </Box>
                                ))}
                                {isTyping && (
                                    <Stack direction="row" spacing={.75} sx={{
                                        alignSelf: 'flex-start', px: 1.75, py: 1.5, borderRadius: '8px',
                                        bgcolor: c.sunken, border: `1px solid ${c.line}`,
                                    }}>
                                        {[0, 1, 2].map((i) => (
                                            <Box key={i} className="pulse" sx={{
                                                width: 5, height: 5, borderRadius: '50%', bgcolor: c.ink3,
                                                animationDelay: `${i * 0.22}s`,
                                            }} />
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                            <Box sx={{ flex: 'none', p: 1.5, borderTop: `1px solid ${c.line}` }}>
                                <TextField
                                    fullWidth size="small" placeholder="Ask about this run…"
                                    value={input} onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <MuiTooltip title="Send">
                                                    <span>
                                                        <IconButton size="small" onClick={handleChat} disabled={!input.trim()}
                                                            sx={{ color: c.ink, mr: -.5 }}>
                                                            <ArrowUpward sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </span>
                                                </MuiTooltip>
                                            ),
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Panel>
                </Box>

                {/* ---------- console ---------- */}
                <Panel
                    title="Event log"
                    action={<Typography className="mono num" sx={{ fontSize: 11, color: c.ink3 }}>
                        {logs.length} events
                    </Typography>}
                    flush
                    sx={{ mt: 2.5 }}
                >
                    <Box ref={logBoxRef} className="on-dark" sx={{
                        height: 210, overflowY: 'auto', bgcolor: c.inverse,
                        fontFamily: 'var(--font-mono), monospace', fontSize: 12, py: .5,
                    }}>
                        {logs.length === 0 ? (
                            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                                <Typography className="mono" sx={{ fontSize: 12, color: c.inkInverse2, opacity: .55 }}>
                                    awaiting events
                                </Typography>
                            </Box>
                        ) : logs.map((log) => (
                            <Box key={log.id} sx={{
                                display: 'flex', gap: 1.5, px: 2, py: .4,
                                borderLeft: `2px solid ${LOG_TONE(log.type)}`,
                            }}>
                                <Box component="span" className="num" sx={{ color: c.ink3, width: 52, flex: 'none' }}>
                                    {(log.time || 0).toFixed(1)}s
                                </Box>
                                <Box component="span" sx={{ color: LOG_TONE(log.type), width: 108, flex: 'none', fontWeight: 500 }}>
                                    {log.type}
                                </Box>
                                <Box component="span" sx={{ color: c.inkInverse, opacity: .82 }}>{log.msg}</Box>
                            </Box>
                        ))}
                    </Box>
                </Panel>
            </Box>
        </Box>
    );
}

/* ---------- local bits ---------- */

function Row({ k, v, dim }: { k: string; v: React.ReactNode; dim?: boolean }) {
    return (
        <Box className="row" sx={{ py: 1, opacity: dim ? .55 : 1 }}>
            <Typography className="mono" sx={{ fontSize: 12, color: c.ink2 }}>{k}</Typography>
            {v}
        </Box>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', px: 3 }}>
            <Typography sx={{ fontSize: 13, color: c.ink3, textAlign: 'center' }}>{text}</Typography>
        </Box>
    );
}
