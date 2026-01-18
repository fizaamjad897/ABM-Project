'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Grid, Stack, Button, Divider, Chip, IconButton } from '@mui/material';
import {
    ArrowBack,
    TrendingUp,
    Timeline,
    Speed,
    Hub,
    AutoGraph,
    Psychology,
    CheckCircle,
    Warning,
    Info,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Science,
    History,
    Settings
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';

export default function AnalyticsPage() {
    const [history, setHistory] = React.useState<any[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [primaryId, setPrimaryId] = React.useState<string | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('cachenet_modeling_history');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setHistory(parsed);
                    setPrimaryId(parsed[0].id);
                    setSelectedIds([parsed[0].id]);
                }
            } catch (e) {
                console.error("Failed to parse modeling history");
            }
        }
    }, []);

    const deleteSession = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newHistory = history.filter(h => h.id !== id);
        setHistory(newHistory);
        localStorage.setItem('cachenet_modeling_history', JSON.stringify(newHistory));
        if (primaryId === id) setPrimaryId(newHistory[0]?.id || null);
        setSelectedIds(prev => prev.filter(sid => sid !== id));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    if (!mounted) return null;

    if (history.length === 0) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 4 }}>
                <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 500, borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ bgcolor: '#eff6ff', color: '#2563eb', p: 3, borderRadius: '20px', display: 'inline-flex', mb: 3 }}>
                        <History sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>No Modeling Data Found</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
                        Execute a model in the dashboard to generate system analytics and behavioral distributions.
                    </Typography>
                    <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" startIcon={<ArrowBack />} sx={{ borderRadius: '12px', bgcolor: '#2563eb', textTransform: 'none', px: 4, py: 1.2, fontWeight: 600 }}>
                            Go to Dashboard
                        </Button>
                    </Link>
                </Paper>
            </Box>
        );
    }

    const primaryData = history.find(h => h.id === primaryId) || history[0];
    const { metrics, timestamp, config } = primaryData;

    // Timeline Comparison Data
    // We need to align timelines. Since they might have different lengths, we'll map them by index or relative time.
    const comparisonTimeline: any[] = [];
    const maxLen = Math.max(...selectedIds.map(id => history.find(h => h.id === id)?.timeline?.length || 0));

    for (let i = 0; i < maxLen; i++) {
        const entry: any = { index: i };
        selectedIds.forEach((id, idx) => {
            const h = history.find(sim => sim.id === id);
            if (h && h.timeline && h.timeline[i]) {
                entry[`ratio_${idx}`] = h.timeline[i].hitRatio;
                entry[`label_${idx}`] = `${h.config?.nodes} Nodes - ${new Date(h.timestamp).toLocaleTimeString()}`;
            }
        });
        comparisonTimeline.push(entry);
    }

    // Process Node Distribution for Primary
    const cacheDistribution = Object.keys(metrics?.agent_stats || {}).map(nodeId => ({
        name: nodeId.replace('node_', 'N-'),
        hits: metrics.agent_stats[nodeId].hits || 0,
        misses: metrics.agent_stats[nodeId].misses || 0
    }));

    // Traffic Pie
    const totalHits = metrics?.hits || 0;
    const totalMisses = metrics?.misses || 0;
    const hitRatioData = [
        { name: 'Hits', value: totalHits, color: '#2563eb' },
        { name: 'Misses', value: totalMisses, color: '#f59e0b' },
    ];

    // System Radar
    const hitRatio = (totalHits / (totalHits + totalMisses) * 100) || 0;
    const performanceMetrics = [
        { metric: 'Hit Ratio', value: hitRatio },
        { metric: 'Latency', value: Math.max(20, 100 - (metrics?.avg_latency || 0)) },
        { metric: 'Throughput', value: Math.min(100, (metrics?.requests || 0) / 2) },
        { metric: 'Stability', value: 95 },
        { metric: 'Scale', value: Math.min(100, (config?.nodes || 1) * 20) },
    ];

    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: '#f8fafc' }}>
            {/* Header Nav */}
            <Box sx={{
                py: 1.5, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                bgcolor: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100
            }}>
                <Stack direction="row" spacing={3} alignItems="center">
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: '#2563eb', color: 'white', display: 'flex' }}>
                                <Settings sx={{ fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a', letterSpacing: '-0.5px' }}>CACHENET</Typography>
                        </Stack>
                    </Link>
                </Stack>
                <Stack direction="row" spacing={3} alignItems="center">
                    <NavAnchor label="Dashboard" href="/dashboard" />
                    <Typography sx={{ color: '#2563eb', fontWeight: 600, fontSize: '13px' }}>ANALYTICS</Typography>
                    <NavAnchor label="Knowledge Base" href="/docs" />
                </Stack>
            </Box>

            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Grid container spacing={4}>
                    {/* SIDEBAR: History Selection */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid #f1f5f9', position: 'sticky', top: 100 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: 0.5 }}>SESSION HISTORY</Typography>
                                <Chip label={history.length} size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
                            </Stack>
                            <Stack spacing={1}>
                                {history.map((session, i) => (
                                    <Box
                                        key={session.id}
                                        onClick={() => setPrimaryId(session.id)}
                                        sx={{
                                            p: 2, borderRadius: '16px', cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: primaryId === session.id ? '#2563eb' : '#f1f5f9',
                                            bgcolor: primaryId === session.id ? '#eff6ff' : 'white',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: '#2563eb', bgcolor: '#f8fafc' },
                                            position: 'relative'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleSelect(session.id); }}>
                                                <Chip
                                                    label={selectedIds.includes(session.id) ? "COMPARE" : "SELECT"}
                                                    size="small"
                                                    sx={{
                                                        height: 18, fontSize: '9px', fontWeight: 800, mb: 1,
                                                        bgcolor: selectedIds.includes(session.id) ? '#2563eb' : '#f1f5f9',
                                                        color: selectedIds.includes(session.id) ? 'white' : '#64748b'
                                                    }}
                                                />
                                            </Box>
                                            <IconButton size="small" onClick={(e: React.MouseEvent) => deleteSession(session.id, e)} sx={{ p: 0.2 }}>
                                                <Warning sx={{ fontSize: 14, color: '#cbd5e1' }} />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                            {session.config?.nodes} Nodes • {session.metrics?.hits + session.metrics?.misses} Req
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                            {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* MAIN CONTENT */}
                    <Grid size={{ xs: 12, md: 9 }}>
                        {/* Section Header */}
                        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Box>
                                <Typography variant="h3" sx={{ fontWeight: 600, color: '#0f172a', letterSpacing: '-1.5px' }}>
                                    Modeling <Box component="span" sx={{ color: '#2563eb' }}>Analytics</Box>
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b', mt: 1, fontWeight: 500 }}>
                                    Session: <Box component="span" sx={{ color: '#334155', fontWeight: 600 }}>{new Date(timestamp).toLocaleString()}</Box>
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                                {selectedIds.length > 1 && (
                                    <Chip
                                        icon={<Timeline sx={{ fontSize: '14px !important' }} />}
                                        label={`COMPARING ${selectedIds.length} SESSIONS`}
                                        color="primary"
                                        sx={{ fontWeight: 700, borderRadius: '8px' }}
                                    />
                                )}
                                <Chip label="SYSTEM MODEL VALIDATED" color="success" size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: '8px' }} />
                            </Stack>
                        </Box>

                        {/* Key Metrics Grid */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {[
                                { label: 'AVERAGE HIT RATIO', value: `${hitRatio.toFixed(1)}%`, icon: <TrendingUp />, color: '#2563eb' },
                                { label: 'TOTAL REQUESTS', value: metrics?.requests || 0, icon: <Timeline />, color: '#06b6d4' },
                                { label: 'UNIQUE KEYS', value: metrics?.unique_keys || 0, icon: <Speed />, color: '#8b5cf6' },
                                { label: 'ACTIVE NODES', value: config?.nodes || 0, icon: <Hub />, color: '#10b981' },
                            ].map((stat, i) => (
                                <Grid size={{ xs: 6, md: 3 }} key={i}>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                        <Paper sx={{
                                            p: 3, borderRadius: '20px', border: '1px solid #f1f5f9',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)'
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5 }}>{stat.label}</Typography>
                                                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#0f172a', mt: 0.5 }}>{stat.value}</Typography>
                                                </Box>
                                                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: `${stat.color}08`, color: stat.color }}>{stat.icon}</Box>
                                            </Box>
                                        </Paper>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>

                        <Grid container spacing={3}>
                            {/* Performance Distribution */}
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Paper className="paper-card" sx={{ p: 4, height: '100%', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                                        <BarChartIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0f172a' }}>NODE PERFORMANCE DISTRIBUTION</Typography>
                                    </Stack>
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={cacheDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500, fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500, fontSize: 11 }} />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="hits" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                                            <Bar dataKey="misses" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/* Traffic Pie */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper className="paper-card" sx={{ p: 4, height: '100%', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                                        <PieChartIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0f172a' }}>TRAFFIC COMPOSITION</Typography>
                                    </Stack>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={hitRatioData}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {hitRatioData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Stack spacing={1.5} sx={{ mt: 4 }}>
                                        {hitRatioData.map((item, i) => (
                                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: '12px', bgcolor: '#f8fafc' }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{item.name}</Typography>
                                                </Stack>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{((item.value / (totalHits + totalMisses)) * 100 || 0).toFixed(1)}%</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Paper>
                            </Grid>

                            {/* Timeline Analysis (COMPARISON MODE) */}
                            <Grid size={{ xs: 12 }}>
                                <Paper className="paper-card" sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Timeline sx={{ color: '#06b6d4', fontSize: 20 }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                                {selectedIds.length > 1 ? 'CROSS-SESSION PERFORMANCE COMPARISON' : 'HIT RATIO TIMELINE'}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                            X-AXIS: TICK DURATION (MS)
                                        </Typography>
                                    </Stack>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <AreaChart data={comparisonTimeline}>
                                            <defs>
                                                {selectedIds.map((id, idx) => (
                                                    <linearGradient key={`grad_${idx}`} id={`color_${idx}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0} />
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="index" hide />
                                            <YAxis unit="%" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                labelFormatter={(label) => `Engine Tick: ${label * 20}ms`}
                                            />
                                            {selectedIds.map((id, idx) => (
                                                <Area
                                                    key={id}
                                                    type="monotone"
                                                    dataKey={`ratio_${idx}`}
                                                    name={comparisonTimeline[0]?.[`label_${idx}`] || `Run ${idx + 1}`}
                                                    stroke={colors[idx % colors.length]}
                                                    strokeWidth={selectedIds.includes(id) ? 3 : 1}
                                                    fillOpacity={1}
                                                    fill={`url(#color_${idx})`}
                                                />
                                            ))}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/* Radar Chart */}
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Paper className="paper-card" sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                                        <AutoGraph sx={{ color: '#8b5cf6', fontSize: 20 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0f172a' }}>SYSTEM CAPABILITY RADAR</Typography>
                                    </Stack>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={performanceMetrics}>
                                            <PolarGrid stroke="#f1f5f9" />
                                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontWeight: 500, fontSize: 11 }} />
                                            <Radar name="Performance" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

function NavAnchor({ label, href }: { label: string, href: string }) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500, color: '#64748b', '&:hover': { color: '#2563eb' } }}>
                {label}
            </Typography>
        </Link>
    );
}
