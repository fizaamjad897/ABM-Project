'use client';

import React from 'react';
import Link from 'next/link';
import {
    Container, Grid, Paper, Typography, Box, Button, Slider, FormControlLabel, Switch,
    Divider, Chip, LinearProgress, TextField, IconButton, Alert, AlertTitle, Stack,
    Tooltip as MuiTooltip, Card, CardContent
} from '@mui/material';
import {
    PlayArrow, Stop, Psychology, Speed, Storage, Send, CloudQueue, Lan, Terminal,
    Info, Assessment, Cached, TrendingUp, Warning, CheckCircle, Error as ErrorIcon,
    Home, Analytics, Settings, BugReport, Timer, NetworkCheck, Refresh,
    MenuBook, ChevronRight, Message, School, Hub, Science, Dns, Settings as SettingsIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// =============================================
// "LAB NOTEBOOK" DASHBOARD
// =============================================

export default function Dashboard() {
    const [isRunning, setIsRunning] = React.useState(false);
    const [metrics, setMetrics] = React.useState<any[]>([]);
    const [fullMetrics, setFullMetrics] = React.useState<any>({});
    const [agentStates, setAgentStates] = React.useState<Record<string, boolean>>({});
    const [agentStats, setAgentStats] = React.useState<Record<string, any>>({});
    const [logs, setLogs] = React.useState<any[]>([]);
    const [chat, setChat] = React.useState<{ role: string, content: string }[]>([]);
    const [input, setInput] = React.useState('');
    const [config, setConfig] = React.useState({ nodes: 4, cacheSize: 150, chaos: true, duration: 1000 });
    const [error, setError] = React.useState<string | null>(null);
    const [wsConnected, setWsConnected] = React.useState(false);
    const [simProgress, setSimProgress] = React.useState(0);
    const [simTime, setSimTime] = React.useState(0);
    const [isTyping, setIsTyping] = React.useState(false);

    const ws = React.useRef<WebSocket | null>(null);
    const chatEndRef = React.useRef<HTMLDivElement | null>(null);
    const logIdCounter = React.useRef(0);
    const metricsRef = React.useRef<any[]>([]); // Ref to avoid stale closures in WS handler
    const configRef = React.useRef(config); // Ref to avoid stale closures in WS handler

    // Auto-scroll chat to bottom
    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat, isTyping]);

    // WebSocket connection
    React.useEffect(() => {
        const connect = () => {
            try {
                ws.current = new WebSocket('ws://localhost:8000/ws/simulation');
                ws.current.onopen = () => setWsConnected(true);
                ws.current.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'SIM_UPDATE') {
                        const hits = data.metrics.hits || 0;
                        const misses = data.metrics.misses || 0;
                        const ratio = (hits + misses) > 0 ? (hits / (hits + misses)) * 100 : 0;
                        const point = { time: Math.round(data.time), hitRatio: ratio };
                        metricsRef.current = [...metricsRef.current.slice(-100), point];
                        setMetrics([...metricsRef.current]);
                        setFullMetrics(data.metrics);
                        setAgentStates(data.agent_states);
                        setAgentStats(data.agent_stats || {});
                        setSimProgress(data.progress);
                        setSimTime(data.time);
                        if (data.progress >= 100) setIsRunning(false);
                    } else if (data.type === 'LOG') {
                        // Handle LOG messages from backend with log_type and msg fields
                        setLogs(prev => [...prev.slice(-100), {
                            id: `log-${logIdCounter.current++}-${Date.now()}`,
                            time: data.time,
                            type: data.log_type || 'INFO',
                            msg: data.msg || ''
                        }]);
                    } else if (data.type === 'SIM_FINISHED') {
                        setIsRunning(false);
                        const results = {
                            id: `sim-${Date.now()}`,
                            metrics: data.final_metrics,
                            timeline: metricsRef.current,
                            agent_states: data.agent_states || {},
                            config: configRef.current,
                            timestamp: new Date().toISOString()
                        };

                        // Persist to history
                        const rawHistory = localStorage.getItem('cachenet_modeling_history');
                        let history = [];
                        try {
                            history = rawHistory ? JSON.parse(rawHistory) : [];
                            if (!Array.isArray(history)) history = [];
                        } catch (e) { history = []; }

                        history.unshift(results); // Newest first
                        localStorage.setItem('cachenet_modeling_history', JSON.stringify(history.slice(0, 50))); // Keep last 50
                        localStorage.setItem('cachenet_last_experiment', JSON.stringify(results)); // Legacy support
                    }
                };
                ws.current.onclose = () => setWsConnected(false);
            } catch (e) { setWsConnected(false); }
        };
        connect();
        return () => ws.current?.close();
    }, []);

    const startSim = () => {
        if (!wsConnected) return setError("Simulation engine offline");
        setError(null);
        setLogs([]);
        setMetrics([]);
        metricsRef.current = []; // Reset ref
        setChat([{ role: 'assistant', content: 'Environment ready. Analyzing emergent properties.' }]);
        ws.current?.send(JSON.stringify({ type: 'START_SIM', config }));
        setIsRunning(true);
    };

    const stopSim = () => {
        ws.current?.send(JSON.stringify({ type: 'STOP_SIM' }));
        setIsRunning(false);
    };

    const handleChat = async () => {
        if (!input.trim()) return;
        const userQuery = input;
        setChat(prev => [...prev, { role: 'user', content: userQuery }]);
        setInput('');
        setIsTyping(true);
        try {
            const res = await fetch('http://localhost:8000/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userQuery, metrics: { ...fullMetrics, agent_stats: agentStats } })
            });
            const data = await res.json();
            setChat(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (e) {
            setChat(prev => [...prev, { role: 'assistant', content: "Error communicating with Gemini Analyst." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const hitRatio = (fullMetrics.hits + fullMetrics.misses) > 0 ? ((fullMetrics.hits / (fullMetrics.hits + fullMetrics.misses)) * 100).toFixed(1) : '0.0';

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: '#f8fafc' }}>
            {/* Header / Lab Nav */}
            <Box sx={{
                bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)',
                borderBottom: '1px solid #e2e8f0', py: 1.5, px: 4,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <Stack direction="row" spacing={3} alignItems="center">
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: '#2563eb', color: 'white', display: 'flex', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                                <SettingsIcon fontSize="small" />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a', letterSpacing: '-0.5px' }}>CACHENET</Typography>
                        </Stack>
                    </Link>
                    <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
                    <Stack direction="row" spacing={1}>
                        <NavButton icon={<Home fontSize="small" />} label="Home" href="/" />
                        <NavButton icon={<Assessment fontSize="small" />} label="Analytics" href="/analytics" />
                        <NavButton icon={<MenuBook fontSize="small" />} label="Docs" href="/docs" />
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                        icon={wsConnected ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <ErrorIcon sx={{ fontSize: '14px !important' }} />}
                        label={wsConnected ? "System Online" : "System Offline"}
                        size="small"
                        sx={{
                            bgcolor: wsConnected ? '#f0fdf4' : '#fef2f2',
                            color: wsConnected ? '#166534' : '#991b1b',
                            fontWeight: 600,
                            border: `1px solid ${wsConnected ? '#bbf7d0' : '#fecaca'}`,
                            fontSize: '11px'
                        }}
                    />
                    <Button
                        onClick={isRunning ? stopSim : startSim}
                        variant="contained"
                        size="small"
                        startIcon={isRunning ? <Stop /> : <PlayArrow />}
                        sx={{
                            bgcolor: isRunning ? '#ef4444' : '#2563eb',
                            '&:hover': { bgcolor: isRunning ? '#dc2626' : '#1e40af' },
                            fontWeight: 600, borderRadius: '8px', px: 3, boxShadow: 'none',
                            textTransform: 'none'
                        }}
                    >
                        {isRunning ? "Stop Execution" : "Execute Model"}
                    </Button>
                </Stack>
            </Box>

            <Container maxWidth="xl" sx={{ pt: 4, pb: 8 }}>
                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 3 }}><LabStat label="HIT RATIO" value={`${hitRatio}%`} icon={<TrendingUp />} color="#2563eb" /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><LabStat label="TOTAL READS" value={fullMetrics.hits + fullMetrics.misses || 0} icon={<Hub />} color="#10b981" /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><LabStat label="CACHE MISSES" value={fullMetrics.misses || 0} icon={<Warning />} color="#eab308" /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><LabStat label="SIM TIME" value={`${simTime.toFixed(1)}s`} icon={<Timer />} color="#8b5cf6" /></Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* LEFT: Lab Parameters */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Stack spacing={3}>
                            <LabFolder title="Parameters" icon={<Settings />}>
                                <Stack spacing={3} sx={{ mt: 1 }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: 0.5 }}>MODEL NODES</Typography>
                                            <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600 }}>{config.nodes}</Typography>
                                        </Box>
                                        <Slider
                                            value={config.nodes}
                                            min={1} max={10}
                                            size="small"
                                            onChange={(_, v) => {
                                                const newCfg = { ...config, nodes: v as number };
                                                setConfig(newCfg);
                                                configRef.current = newCfg;
                                            }}
                                            disabled={isRunning}
                                            sx={{ color: '#2563eb', py: 1 }}
                                        />
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: 0.5 }}>CACHE STORAGE</Typography>
                                            <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600 }}>{config.cacheSize}MB</Typography>
                                        </Box>
                                        <Slider
                                            value={config.cacheSize}
                                            min={50} max={500}
                                            size="small"
                                            onChange={(_, v) => {
                                                const newCfg = { ...config, cacheSize: v as number };
                                                setConfig(newCfg);
                                                configRef.current = newCfg;
                                            }}
                                            disabled={isRunning}
                                            sx={{ color: '#2563eb', py: 1 }}
                                        />
                                    </Box>

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    <FormControlLabel
                                        control={<Switch checked={config.chaos} size="small" onChange={e => {
                                            const newCfg = { ...config, chaos: e.target.checked };
                                            setConfig(newCfg);
                                            configRef.current = newCfg;
                                        }} color="primary" />}
                                        label={<Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>Chaos Injection</Typography>}
                                    />

                                    {isRunning && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 1.5, display: 'block' }}>CYCLE PROGRESS</Typography>
                                            <LinearProgress variant="determinate" value={simProgress} sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb', borderRadius: 3 } }} />
                                        </Box>
                                    )}
                                </Stack>
                            </LabFolder>

                            <LabFolder title="Execution Logs" icon={<Terminal />} noPadding>
                                <Box sx={{
                                    p: 0, height: 420, overflowY: 'auto',
                                    fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
                                    bgcolor: '#0f172a', color: '#e2e8f0',
                                    '&::-webkit-scrollbar': { width: '4px' },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: '#334155', borderRadius: '4px' }
                                }}>
                                    {logs.map((log) => (
                                        <Box key={log.id} sx={{
                                            px: 2, py: 0.8,
                                            borderLeft: `3px solid ${log.type?.includes('HIT') ? '#10b981' : (log.type?.includes('MISS') ? '#ef4444' : '#334155')}`,
                                            bgcolor: 'rgba(255,255,255,0.02)',
                                            mb: '1px'
                                        }}>
                                            <Box component="span" sx={{ color: '#64748b', mr: 1.5, fontSize: '10px' }}>[{(log.time || 0).toFixed(1)}s]</Box>
                                            <Box component="span" sx={{ color: log.type?.includes('HIT') ? '#10b981' : (log.type?.includes('MISS') ? '#60a5fa' : '#94a3b8'), fontWeight: 600, mr: 1 }}>{log.type}</Box>
                                            <Box component="span" sx={{ opacity: 0.9 }}>{log.msg || ''}</Box>
                                        </Box>
                                    ))}
                                    {logs.length === 0 && <Box sx={{ color: '#475569', textAlign: 'center', mt: 20 }}>NO ACTIVE DATA STREAMS</Box>}
                                </Box>
                            </LabFolder>
                        </Stack>
                    </Grid>

                    {/* CENTER: Results Visualizer */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={3}>
                            <LabFolder title="Telemetry Plot" icon={<Assessment />}>
                                <Box sx={{ height: 300, width: '100%', mt: 2 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={metrics}>
                                            <defs>
                                                <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="time" hide />
                                            <YAxis unit="%" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                                            <Area type="monotone" dataKey="hitRatio" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRatio)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            </LabFolder>

                            <LabFolder title="System Topology" icon={<Lan />}>
                                <Box sx={{
                                    height: Math.max(520, config.nodes * 90 + 60),
                                    bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', mt: 1,
                                    position: 'relative', overflow: 'visible', // Changed from hidden to visible
                                    transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}>
                                    <Box className="bg-grid-blue" sx={{ position: 'absolute', inset: 0, opacity: 0.1, borderRadius: '16px' }} />

                                    {/* SVG Connection Layer */}
                                    {Array.from({ length: config.nodes }).map((_, i) => {
                                        const panelHeight = Math.max(520, config.nodes * 90 + 60);
                                        const yOffset = ((panelHeight - 100) / (config.nodes + 1)) * (i + 1) + 50;
                                        return (
                                            <React.Fragment key={`edges-${i}`}>
                                                <TopologyEdge
                                                    start={[100, panelHeight / 2]}
                                                    end={[300, yOffset]}
                                                    active={isRunning}
                                                    duration={1.5 + Math.random()}
                                                />
                                                <TopologyEdge
                                                    start={[400, yOffset]}
                                                    end={[600, panelHeight / 2]}
                                                    active={isRunning && logs[0]?.type === 'CACHE_MISS' && logs[0]?.msg?.includes(`node_${i}`)}
                                                    color="#fef3c7"
                                                    pulseColor="#f59e0b"
                                                    duration={1.2}
                                                />
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* Component Layer - Absolute Positioning for Perfect Alignment */}
                                    <Box sx={{ position: 'relative', zIndex: 1, height: '100%', width: '100%' }}>
                                        {/* Load Balancer */}
                                        <Box sx={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)' }}>
                                            <NodeBox label="LOAD BALANCER" icon={<Lan />} color="#2563eb" active />
                                        </Box>

                                        {/* Cache Nodes */}
                                        {Array.from({ length: config.nodes }).map((_, i) => {
                                            const panelHeight = Math.max(520, config.nodes * 90 + 60);
                                            const yOffset = ((panelHeight - 100) / (config.nodes + 1)) * (i + 1) + 50;
                                            return (
                                                <Box key={`node-${i}`} sx={{
                                                    position: 'absolute',
                                                    left: '50%',
                                                    top: yOffset,
                                                    transform: 'translate(-50%, -50%)',
                                                    textAlign: 'center',
                                                    width: 120, // Give enough space for the label
                                                    display: 'flex',
                                                    justifyContent: 'center'
                                                }}>
                                                    <NodeBox
                                                        label={`CACHE-0${i}`}
                                                        icon={<Hub />}
                                                        color="#10b981"
                                                        active={agentStates[`node_${i}`]}
                                                        variant={config.nodes > 6 ? "small" : "default"}
                                                        status={logs[0]?.type?.includes('HIT') && logs[0]?.msg?.includes(`node_${i}`) ? 'hit' : (logs[0]?.type?.includes('MISS') && logs[0]?.msg?.includes(`node_${i}`) ? 'miss' : 'idle')}
                                                    />
                                                </Box>
                                            );
                                        })}

                                        {/* Database Overlay */}
                                        <Box sx={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }}>
                                            <NodeBox
                                                label="DATABASE"
                                                icon={<Dns />}
                                                color="#f59e0b"
                                                active
                                                status={logs[0]?.type === 'CACHE_MISS' ? 'miss' : 'idle'}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </LabFolder>
                        </Stack>
                    </Grid>

                    {/* RIGHT: Lab Assistant */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper className="paper-card" sx={{ height: 780, display: 'flex', flexDirection: 'column', p: 0 }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Psychology sx={{ color: '#2563eb', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', letterSpacing: 0.2 }}>SYSTEM ANALYST</Typography>
                            </Box>

                            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {chat.map((msg, i) => (
                                    <Box key={i} sx={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '92%',
                                        p: 2,
                                        borderRadius: '12px',
                                        borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
                                        borderTopLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
                                        bgcolor: msg.role === 'user' ? '#2563eb' : '#ffffff',
                                        color: msg.role === 'user' ? 'white' : '#334155',
                                        border: '1px solid #f1f5f9',
                                        boxShadow: msg.role === 'user' ? '0 4px 6px -1px rgba(37,99,235,0.2)' : '0 2px 4px -1px rgba(0,0,0,0.03)',
                                    }}>
                                        {msg.role === 'assistant' ? (
                                            <Box sx={{
                                                fontSize: '13px',
                                                lineHeight: 1.6,
                                                '& p': { mb: 1.5, '&:last-child': { mb: 0 } },
                                                '& ul, & ol': { pl: 2, mb: 1.5 },
                                                '& li': { mb: 0.5 },
                                                '& code': { bgcolor: '#f1f5f9', p: 0.5, borderRadius: '4px', fontFormat: 'monospace', fontSize: '11px' },
                                                '& strong': { fontWeight: 600 }
                                            }}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>{msg.content}</Typography>
                                        )}
                                    </Box>
                                ))}
                                {isTyping && (
                                    <Box sx={{ alignSelf: 'flex-start', bgcolor: '#f8fafc', p: 2, borderRadius: '16px', borderTopLeftRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', gap: 0.5 }}>
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                                    </Box>
                                )}
                                <div ref={chatEndRef} />
                            </Box>

                            <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                                <TextField
                                    fullWidth placeholder="Ask about system modeling..." size="small"
                                    value={input} onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton onClick={handleChat} disabled={!wsConnected} size="small" sx={{ color: '#2563eb' }}>
                                                <Send fontSize="small" />
                                            </IconButton>
                                        ),
                                        sx: { borderRadius: '8px', bgcolor: 'white', fontSize: '13px', border: '1px solid #e2e8f0' }
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

// =============================================
// LABORATORY COMPONENTS
// =============================================

function NavButton({ icon, label, href }: { icon?: any, label: string, href: string }) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <Button
                startIcon={icon}
                size="small"
                sx={{
                    color: '#64748b',
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 1.5,
                    fontSize: '13px',
                    '&:hover': { color: '#2563eb', bgcolor: 'transparent' }
                }}
            >
                {label}
            </Button>
        </Link>
    );
}

function LabStat({ label, value, icon, color }: any) {
    return (
        <Paper
            className="paper-card"
            sx={{
                p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                borderRadius: '16px'
            }}
        >
            <Box sx={{
                p: 1.2,
                borderRadius: '12px',
                bgcolor: `${color}08`,
                color: color,
                display: 'flex',
                boxShadow: `inset 0 0 0 1px ${color}15`
            }}>
                {React.cloneElement(icon, { sx: { fontSize: 20 } })}
            </Box>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>{value}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, letterSpacing: 0.5, mt: 0.5, display: 'block' }}>{label}</Typography>
            </Box>
        </Paper>
    );
}

function LabFolder({ children, title, icon, noPadding = false }: any) {
    return (
        <Paper
            className="paper-card"
            sx={{
                overflow: 'hidden',
                borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)',
                border: '1px solid #f1f5f9'
            }}
        >
            <Box sx={{
                p: 2,
                borderBottom: '1px solid #f1f5f9',
                bgcolor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
            }}>
                <Box sx={{ color: '#2563eb', display: 'flex', scale: '0.9' }}>{icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', letterSpacing: 0.2 }}>{title}</Typography>
            </Box>
            <Box sx={{ p: noPadding ? 0 : 3 }}>{children}</Box>
        </Paper>
    );
}

function NodeBox({ label, icon, color, active, variant = 'default', status = 'idle' }: any) {
    const isHit = status === 'hit';
    const isMiss = status === 'miss';

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
                scale: isHit || isMiss ? 1.05 : 1,
                opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                    width: variant === 'small' ? 52 : 72,
                    height: variant === 'small' ? 52 : 72,
                    borderRadius: '20px',
                    bgcolor: '#ffffff',
                    border: `1.5px solid ${status !== 'idle' ? (isHit ? '#10b981' : '#60a5fa') : (active ? `${color}40` : '#e2e8f0')}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: status !== 'idle' ? (isHit ? '#10b981' : '#2563eb') : (active ? color : '#94a3b8'),
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: active ? `0 10px 15px -3px ${color}10` : 'none',
                }}>
                    <Box sx={{ zIndex: 1, display: 'flex', opacity: active ? 1 : 0.4 }}>
                        {React.cloneElement(icon, { sx: { fontSize: variant === 'small' ? 20 : 28 } })}
                    </Box>
                </Box>
                <Typography
                    variant="caption"
                    noWrap
                    sx={{
                        fontSize: variant === 'small' ? '9px' : '10px',
                        color: '#475569',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none'
                    }}
                >
                    {label}
                </Typography>
            </Box>
        </motion.div>
    );
}

function TopologyEdge({ start = [0, 0], end = [100, 100], color = '#e2e8f0', active = false, pulseColor = '#2563eb', duration = 2 }: any) {
    const midX = (start[0] + end[0]) / 2;
    // Use a slightly smoother curve
    const path = `M ${start[0]} ${start[1]} C ${midX} ${start[1]}, ${midX} ${end[1]}, ${end[0]} ${end[1]}`;

    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            <motion.path
                d={path}
                fill="none"
                stroke={active ? pulseColor : color}
                strokeWidth={active ? 2.5 : 1.5}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: active ? 0.7 : 0.2 }}
                transition={{ duration: 1.5 }}
            />
            {active && (
                <motion.circle
                    r="5"
                    fill={pulseColor}
                    initial={{ offsetDistance: "0%", opacity: 0 }}
                    animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: duration, ease: "easeInOut" }}
                    style={{ offsetPath: `path("${path}")` }}
                />
            )}
        </svg>
    );
}
