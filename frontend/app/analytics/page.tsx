'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area, Legend,
} from 'recharts';

import { c, series } from '../theme';
import { Nav, Panel, Label, Metric, MetricStrip, Heading, Tag, MAX_W, Footer } from '../ui/primitives';

const tip = {
    borderRadius: 4, border: `1px solid ${c.line}`, boxShadow: 'none',
    fontSize: 12, padding: '6px 9px',
};

export default function AnalyticsPage() {
    const [history, setHistory] = React.useState<any[]>([]);
    const [compare, setCompare] = React.useState<string[]>([]);
    const [primaryId, setPrimaryId] = React.useState<string | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem('cachenet_modeling_history');
            const parsed = saved ? JSON.parse(saved) : [];
            if (Array.isArray(parsed) && parsed.length) {
                setHistory(parsed);
                setPrimaryId(parsed[0].id);
                setCompare([parsed[0].id]);
            }
        } catch { /* no readable history */ }
    }, []);

    const remove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = history.filter((h) => h.id !== id);
        setHistory(next);
        localStorage.setItem('cachenet_modeling_history', JSON.stringify(next));
        if (primaryId === id) setPrimaryId(next[0]?.id ?? null);
        setCompare((p) => p.filter((x) => x !== id));
    };

    const toggle = (id: string) =>
        setCompare((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    if (!mounted) return null;

    if (!history.length) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: c.paper }}>
                <Nav current="Analytics" />
                <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: { xs: 10, md: 16 }, textAlign: 'center' }}>
                    <Typography variant="h3" component="h1">No runs recorded yet</Typography>
                    <Typography sx={{ mt: 1.5, fontSize: 15, color: c.ink2 }}>
                        Analytics reads the runs this browser has completed. Finish one on the dashboard
                        and its telemetry, node distribution and timeline will appear here.
                    </Typography>
                    <Link href="/dashboard"><Button variant="contained" size="large" sx={{ mt: 4 }}>Open dashboard</Button></Link>
                </Box>
            </Box>
        );
    }

    const primary = history.find((h) => h.id === primaryId) ?? history[0];
    const { metrics, timestamp, config } = primary;

    const hits = metrics?.hits || 0;
    const misses = metrics?.misses || 0;
    const total = hits + misses;
    const ratio = total ? (hits / total) * 100 : 0;

    const perNode = Object.keys(metrics?.agent_stats || {}).map((id) => ({
        name: id.replace('node_', 'n'),
        hits: metrics.agent_stats[id].hits || 0,
        misses: metrics.agent_stats[id].misses || 0,
    }));

    const split = [
        { name: 'Hits', value: hits, color: c.accent },
        { name: 'Misses', value: misses, color: c.origin },
    ];

    const capability = [
        { metric: 'Hit ratio', value: Math.round(ratio) },
        { metric: 'Latency', value: Math.max(20, 100 - (metrics?.avg_latency || 0)) },
        { metric: 'Throughput', value: Math.min(100, (metrics?.requests || 0) / 2) },
        { metric: 'Coverage', value: Math.min(100, ((metrics?.unique_keys || 0) / 3)) },
        { metric: 'Scale', value: Math.min(100, (config?.nodes || 1) * 20) },
    ];

    const maxLen = Math.max(0, ...compare.map((id) => history.find((h) => h.id === id)?.timeline?.length || 0));
    const timeline: any[] = [];
    for (let i = 0; i < maxLen; i++) {
        const row: any = { i };
        compare.forEach((id, idx) => {
            const h = history.find((s) => s.id === id);
            if (h?.timeline?.[i]) row[`r${idx}`] = h.timeline[i].hitRatio;
        });
        timeline.push(row);
    }
    const seriesName = (id: string) => {
        const h = history.find((s) => s.id === id);
        return h ? `${h.config?.nodes ?? '?'} nodes · ${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: c.paper }}>
            <Nav current="Analytics" />

            <Box sx={{ maxWidth: MAX_W, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 5 } }}>
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '260px minmax(0,1fr)' }, alignItems: 'start' }}>

                    {/* ---------- runs ---------- */}
                    <Panel
                        title="Runs"
                        action={<Typography className="num" sx={{ fontSize: 11.5, color: c.ink3 }}>{history.length}</Typography>}
                        flush
                        sx={{ position: { lg: 'sticky' }, top: { lg: 72 } }}
                    >
                        <Box sx={{ maxHeight: { lg: '68vh' }, overflowY: 'auto' }}>
                            {history.map((s) => {
                                const active = primaryId === s.id;
                                const inCompare = compare.includes(s.id);
                                const t = (s.metrics?.hits || 0) + (s.metrics?.misses || 0);
                                const r = t ? ((s.metrics.hits / t) * 100).toFixed(1) : '0.0';
                                return (
                                    <Box
                                        key={s.id}
                                        onClick={() => setPrimaryId(s.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter') setPrimaryId(s.id); }}
                                        sx={{
                                            px: 2, py: 1.5, cursor: 'pointer', position: 'relative',
                                            borderBottom: `1px solid ${c.lineSoft}`,
                                            bgcolor: active ? c.accentWash : 'transparent',
                                            boxShadow: active ? `inset 2px 0 0 ${c.accent}` : 'none',
                                            transition: 'background-color .14s var(--ease)',
                                            '&:hover': { bgcolor: active ? c.accentWash : c.sunken },
                                            '&:hover .rm': { opacity: 1 },
                                        }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography className="num" sx={{ fontSize: 14, fontWeight: 600, color: c.ink }}>{r}%</Typography>
                                            <IconButton
                                                className="rm" size="small" aria-label="Delete run"
                                                onClick={(e) => remove(s.id, e)}
                                                sx={{ opacity: 0, transition: 'opacity .14s', p: .25, color: c.ink3 }}
                                            >
                                                <Close sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </Stack>
                                        <Typography sx={{ fontSize: 12, color: c.ink2, mt: .25 }}>
                                            {s.config?.nodes} nodes · {t.toLocaleString()} reads
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                            <Box
                                                component="button"
                                                onClick={(e) => { e.stopPropagation(); toggle(s.id); }}
                                                sx={{
                                                    font: 'inherit', fontSize: 11, cursor: 'pointer', px: .75, py: .125,
                                                    borderRadius: '4px', border: `1px solid ${inCompare ? c.accent : c.line}`,
                                                    bgcolor: inCompare ? c.accent : 'transparent',
                                                    color: inCompare ? '#fff' : c.ink3,
                                                }}
                                            >
                                                {inCompare ? 'comparing' : 'compare'}
                                            </Box>
                                            <Typography className="mono" sx={{ fontSize: 10.5, color: c.ink3 }}>
                                                {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Panel>

                    {/* ---------- report ---------- */}
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                            <Heading title="Run report" />
                            <Typography className="mono" sx={{ fontSize: 12, color: c.ink3 }}>
                                {new Date(timestamp).toLocaleString()}
                            </Typography>
                        </Stack>

                        <MetricStrip>
                            <Metric label="Hit ratio" value={`${ratio.toFixed(1)}%`} />
                            <Metric label="Requests" value={(metrics?.requests ?? total).toLocaleString()} />
                            <Metric label="Unique keys" value={(metrics?.unique_keys || 0).toLocaleString()} />
                            <Metric label="Nodes" value={config?.nodes ?? 0} />
                        </MetricStrip>

                        <Box sx={{ mt: 2.5, display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' } }}>
                            <Panel title="Reads per node" bodySx={{ p: 1.5, pl: 0 }}>
                                <Box sx={{ height: 268 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={perNode} margin={{ top: 8, right: 12, bottom: 4, left: 8 }} barGap={2}>
                                            <CartesianGrid stroke={c.lineSoft} vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: c.ink3, fontSize: 11 }} />
                                            <YAxis width={34} axisLine={false} tickLine={false} tick={{ fill: c.ink3, fontSize: 11 }} />
                                            <Tooltip cursor={{ fill: c.sunken }} contentStyle={tip} />
                                            <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                                            <Bar dataKey="hits" name="Hits" fill={c.accent} radius={[2, 2, 0, 0]} maxBarSize={34} />
                                            <Bar dataKey="misses" name="Misses" fill={c.lineStrong} radius={[2, 2, 0, 0]} maxBarSize={34} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Panel>

                            <Panel title="Read outcomes">
                                <Box sx={{ height: 176 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={split} cx="50%" cy="50%" innerRadius={52} outerRadius={74} paddingAngle={2} dataKey="value" stroke="none">
                                                {split.map((s) => <Cell key={s.name} fill={s.color} />)}
                                            </Pie>
                                            <Tooltip contentStyle={tip} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Box sx={{ mt: 1 }}>
                                    {split.map((s) => (
                                        <Box key={s.name} className="row" sx={{ py: 1 }}>
                                            <Stack direction="row" spacing={1.25} alignItems="center">
                                                <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: s.color }} />
                                                <Typography sx={{ fontSize: 13, color: c.ink2 }}>{s.name}</Typography>
                                            </Stack>
                                            <Typography className="num" sx={{ fontSize: 13, fontWeight: 500 }}>
                                                {total ? ((s.value / total) * 100).toFixed(1) : '0.0'}%
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Panel>
                        </Box>

                        <Panel
                            title={compare.length > 1 ? 'Hit ratio, runs compared' : 'Hit ratio over model time'}
                            action={<Typography className="mono" sx={{ fontSize: 11, color: c.ink3 }}>sample every 20 ms</Typography>}
                            bodySx={{ p: 1.5, pl: 0 }}
                            sx={{ mt: 2.5 }}
                        >
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={timeline} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                                        <defs>
                                            {compare.map((id, idx) => (
                                                <linearGradient key={id} id={`g${idx}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={series[idx % series.length]} stopOpacity={0.14} />
                                                    <stop offset="100%" stopColor={series[idx % series.length]} stopOpacity={0} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid stroke={c.lineSoft} vertical={false} />
                                        <XAxis dataKey="i" hide />
                                        <YAxis domain={[0, 100]} width={38} unit="%" axisLine={false} tickLine={false} tick={{ fill: c.ink3, fontSize: 11 }} />
                                        <Tooltip contentStyle={tip} labelFormatter={(l) => `t = ${Number(l) * 20} ms`} formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                                        {compare.length > 1 && <Legend iconType="plainline" iconSize={14} wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />}
                                        {compare.map((id, idx) => (
                                            <Area
                                                key={id} type="monotone" dataKey={`r${idx}`} name={seriesName(id)}
                                                stroke={series[idx % series.length]} strokeWidth={1.75}
                                                fill={`url(#g${idx})`} dot={false} isAnimationActive={false}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Panel>

                        <Box sx={{ mt: 2.5, display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' } }}>
                            <Panel title="Capability profile">
                                <Box sx={{ height: 258 }}>
                                    <ResponsiveContainer>
                                        <RadarChart data={capability} outerRadius="72%">
                                            <PolarGrid stroke={c.lineSoft} />
                                            <PolarAngleAxis dataKey="metric" tick={{ fill: c.ink2, fontSize: 11 }} />
                                            <Radar dataKey="value" stroke={c.accent} strokeWidth={1.5} fill={c.accent} fillOpacity={0.12} isAnimationActive={false} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Panel>

                            <Panel title="Run configuration">
                                <Box className="row"><Typography sx={{ fontSize: 13.5, color: c.ink2 }}>Nodes</Typography><Typography className="num" sx={{ fontSize: 13 }}>{config?.nodes}</Typography></Box>
                                <Box className="row"><Typography sx={{ fontSize: 13.5, color: c.ink2 }}>Cache per node</Typography><Typography className="num" sx={{ fontSize: 13 }}>{config?.cacheSize} MB</Typography></Box>
                                <Box className="row"><Typography sx={{ fontSize: 13.5, color: c.ink2 }}>Chaos Monkey</Typography><Tag tone={config?.chaos ? 'origin' : 'neutral'}>{config?.chaos ? 'armed' : 'off'}</Tag></Box>
                                <Box className="row"><Typography sx={{ fontSize: 13.5, color: c.ink2 }}>Nodes surviving</Typography>
                                    <Typography className="num" sx={{ fontSize: 13 }}>
                                        {Object.values(primary.agent_states || {}).filter((v) => v !== false).length || config?.nodes} / {config?.nodes}
                                    </Typography>
                                </Box>
                                <Box className="row"><Typography sx={{ fontSize: 13.5, color: c.ink2 }}>Samples recorded</Typography><Typography className="num" sx={{ fontSize: 13 }}>{primary.timeline?.length || 0}</Typography></Box>
                            </Panel>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Footer />
        </Box>
    );
}
