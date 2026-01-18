'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Grid, Stack, Button, Chip, Divider } from '@mui/material';
import {
    MenuBook,
    Architecture,
    Psychology,
    Storage,
    Lan,
    Security,
    Timeline,
    ArrowForward,
    Dns,
    Hub,
    Lightbulb,
    School,
    CheckCircle,
    Code,
    Settings
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function DocsPage() {
    const [activeSection, setActiveSection] = React.useState('Overview');

    const sections = [
        { title: 'Overview', icon: <MenuBook fontSize="small" /> },
        { title: 'Modeling Logic', icon: <Psychology fontSize="small" /> },
        { title: 'Cache Strategy', icon: <Settings fontSize="small" /> },
        { title: 'Fault Tolerance', icon: <Security fontSize="small" /> },
        { title: 'Telemetry Specs', icon: <Timeline fontSize="small" /> },
        { title: 'AI Integration', icon: <Code fontSize="small" /> }
    ];

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
                            <Box sx={{ p: 0.8, borderRadius: '6px', bgcolor: '#2563eb', color: 'white', display: 'flex' }}>
                                <Settings fontSize="small" />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', letterSpacing: '-0.5px' }}>CACHENET</Typography>
                        </Stack>
                    </Link>
                </Stack>
                <Stack direction="row" spacing={3} alignItems="center">
                    <NavAnchor label="Dashboard" href="/dashboard" />
                    <NavAnchor label="Analytics" href="/analytics" />
                    <Typography sx={{ color: '#2563eb', fontWeight: 600, fontSize: '0.875rem' }}>DOCUMENTATION</Typography>
                </Stack>
            </Box>

            <Container maxWidth="lg" sx={{ py: 8 }}>
                {/* Handbook Header */}
                <Box sx={{ mb: 8, textAlign: 'center' }}>
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                        <Chip
                            icon={<MenuBook fontSize="small" />}
                            label="Technical Documentation"
                            sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 600, px: 1, border: '1px solid #dbeafe' }}
                        />
                    </Stack>
                    <Typography variant="h2" sx={{ fontWeight: 600, color: '#0f172a', letterSpacing: '-1.5px' }}>
                        System Modeling <Box component="span" sx={{ color: '#2563eb' }}>Architectures</Box>
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400, mt: 1, maxWidth: 650, mx: 'auto', lineHeight: 1.6 }}>
                        A professional guide to distributed caching systems, node architectures, and consistent data modeling.
                    </Typography>
                </Box>

                <Grid container spacing={6}>
                    {/* Index / Sidebar */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 100, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <Typography variant="overline" sx={{ color: '#2563eb', fontWeight: 600, letterSpacing: 2 }}>INDEX</Typography>
                            <Stack sx={{ mt: 2 }} spacing={0.5}>
                                {sections.map((item, i) => (
                                    <Box
                                        key={i}
                                        onClick={() => setActiveSection(item.title)}
                                        sx={{
                                            py: 1.2, px: 2, borderRadius: '12px', cursor: 'pointer',
                                            fontWeight: activeSection === item.title ? 600 : 500,
                                            color: activeSection === item.title ? '#2563eb' : '#64748b',
                                            bgcolor: activeSection === item.title ? '#eff6ff' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: activeSection === item.title ? '#eff6ff' : '#f8fafc', color: '#0f172a' }
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box sx={{ color: activeSection === item.title ? '#2563eb' : '#94a3b8', display: 'flex' }}>{item.icon}</Box>
                                            <Typography variant="body2" fontWeight="inherit">{item.title}</Typography>
                                        </Stack>
                                        {activeSection === item.title && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563eb' }} />}
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Main Content Areas */}
                    <Grid size={{ xs: 12, md: 9 }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeSection === 'Overview' && (
                                    <Stack spacing={8}>
                                        <Box>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#f5f3ff', color: '#8b5cf6', display: 'flex' }}>
                                                    <Architecture />
                                                </Box>
                                                <Typography variant="h4" sx={{ fontWeight: 600 }}>1.0 Model Fundamentals</Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 4, fontWeight: 400 }}>
                                                System modeling in the CacheNet environment focuses on the interaction between
                                                autonomous distributed service nodes. By modeling thousands of concurrent requests, architects can observe
                                                how cache hit ratios fluctuate based on node density and network state.
                                            </Typography>
                                            <Paper sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', borderLeft: '4px solid #2563eb', display: 'flex', gap: 2.5, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                                <Lightbulb sx={{ color: '#eab308' }} />
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>Predictive Modeling</Typography>
                                                    <Typography variant="body2" color="#64748b" sx={{ lineHeight: 1.6, fontWeight: 400 }}>
                                                        The overall system performance is predicted through the aggregate
                                                        actions of independent service units following deterministic LRU rules.
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Box>

                                        <Divider sx={{ borderColor: '#f1f5f9' }} />

                                        <Box>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                                                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#f0fdf4', color: '#10b981', display: 'flex' }}>
                                                    <Psychology />
                                                </Box>
                                                <Typography variant="h4" sx={{ fontWeight: 600 }}>2.0 System Actors</Typography>
                                            </Stack>
                                            <Grid container spacing={3}>
                                                {[
                                                    { name: 'Load Balancer', icon: <Lan />, desc: 'Primary router using consistent hashing to maintain affinity.', color: '#2563eb' },
                                                    { name: 'Worker Node', icon: <Dns />, desc: 'Service units handling local cache storage and TTL logic.', color: '#10b981' },
                                                    { name: 'Request Client', icon: <Psychology />, desc: 'Simulated clients generating key-indexed traffic.', color: '#8b5cf6' },
                                                    { name: 'Database Origins', icon: <Storage />, desc: 'The source of truth for all system data modeled.', color: '#f59e0b' }
                                                ].map((actor, i) => (
                                                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                                                        <Paper sx={{ p: 3, height: '100%', borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: 'white' }}>
                                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                                                <Box sx={{ color: actor.color, display: 'flex' }}>{actor.icon}</Box>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{actor.name}</Typography>
                                                            </Stack>
                                                            <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7, fontWeight: 400 }}>
                                                                {actor.desc}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    </Stack>
                                )}

                                {activeSection === 'Modeling Logic' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#eff6ff', color: '#2563eb', display: 'flex' }}>
                                                    <Psychology />
                                                </Box>
                                                <Typography variant="h4" sx={{ fontWeight: 600 }}>Modeling Core Logic</Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 4 }}>
                                                The CacheNet engine operates as a deterministic modeling system. Each service node follows a strict set of behavioral protocols to ensure eventual consistency across the cluster.
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', height: '100%' }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#0f172a' }}>Request Handling</Typography>
                                                    <Stack spacing={2}>
                                                        {[
                                                            'Listen for incoming key-indexed requests from the Load Balancer.',
                                                            'Verify local L1/L2 memory availability before lookup.',
                                                            'Execute a binary search on the local LRU hash-map.',
                                                            'On miss, propagate request to the primary Data Hub.'
                                                        ].map((text, i) => (
                                                            <Stack key={i} direction="row" spacing={1.5}>
                                                                <CheckCircle sx={{ color: '#10b981', fontSize: 18, mt: 0.3 }} />
                                                                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.5 }}>{text}</Typography>
                                                            </Stack>
                                                        ))}
                                                    </Stack>
                                                </Paper>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', height: '100%' }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#0f172a' }}>Eviction Protocols</Typography>
                                                    <Stack spacing={2}>
                                                        {[
                                                            'Monitor heap memory saturation in real-time.',
                                                            'Sort entries by Timestamp of Last Access.',
                                                            'Flush least recently used artifacts to free up sectors.',
                                                            'Notify central observer of eviction for hit-ratio recalculation.'
                                                        ].map((text, i) => (
                                                            <Stack key={i} direction="row" spacing={1.5}>
                                                                <CheckCircle sx={{ color: '#2563eb', fontSize: 18, mt: 0.3 }} />
                                                                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.5 }}>{text}</Typography>
                                                            </Stack>
                                                        ))}
                                                    </Stack>
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ p: 4, borderRadius: '20px', bgcolor: '#0f172a', color: '#94a3b8', border: '1px solid #1e293b' }}>
                                            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 600, mb: 1, display: 'block' }}>SUDO CODE: SYSTEM_MODEL_PUMP</Typography>
                                            <Typography component="pre" sx={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', overflowX: 'auto' }}>
                                                {`while (node.isActive) {
  const request = await inbox.pull();
  if (cache.has(request.key)) {
    emit("CACHE_HIT", request.id);
    return sendResponse(cache.get(request.key));
  } else {
    emit("CACHE_MISS", request.id);
    const data = await database.fetch(request.key);
    cache.set(request.key, data); // Triggers evacuation if full
    return sendResponse(data);
  }
}`}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                )}

                                {activeSection === 'Cache Strategy' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#fef3c7', color: '#d97706', display: 'flex' }}>
                                                    <Settings />
                                                </Box>
                                                <Typography variant="h4" sx={{ fontWeight: 600 }}>Cache Orchestration</Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 4 }}>
                                                CacheNet employs a tiered storage model to minimize I/O overhead. The primary strategy integrates consistent hashing with granular memory evacuation.
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={4}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Consistent Hashing</Typography>
                                                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>
                                                    By placing nodes on a virtual hash ring, we ensure that adding/removing a service node only affects a fraction of the key-space (K/N), maintaining system stability during scaling events.
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Evacuation Policies</Typography>
                                                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>
                                                    The engine strictly enforces a Least-Recently-Used (LRU) policy. When memory limits are reached, the system flushes stale datasets based on frequency-weighted heatmaps.
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Stack>
                                )}

                                {activeSection === 'Fault Tolerance' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#fee2e2', color: '#ef4444', display: 'flex' }}>
                                                    <Security />
                                                </Box>
                                                <Typography variant="h4" sx={{ fontWeight: 600 }}>Fault Tolerance Framework</Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 4 }}>
                                                Distributed systems must anticipate failure. CacheNet models resilience through automatic state detection and healthy node recovery.
                                            </Typography>
                                        </Box>

                                        <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Failure Detection Mechanisms</Typography>
                                            <Grid container spacing={3}>
                                                {[
                                                    { title: 'Heartbeat Monitoring', desc: 'Real-time connectivity checks between the Load Balancer and worker nodes.' },
                                                    { title: 'Chaos Injection', desc: 'Simulated node drops to verify hash-ring redistribution logic.' },
                                                    { title: 'Graceful Fallback', desc: 'Automatic routing to database origins during partial cluster outages.' }
                                                ].map((item, i) => (
                                                    <Grid size={{ xs: 12 }} key={i}>
                                                        <Stack direction="row" spacing={2}>
                                                            <Box sx={{ p: 0.5, borderRadius: '50%', bgcolor: '#2563eb', color: 'white', height: 20, width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.3 }}>
                                                                <CheckCircle sx={{ fontSize: 14 }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                                                                <Typography variant="body2" sx={{ color: '#64748b' }}>{item.desc}</Typography>
                                                            </Box>
                                                        </Stack>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Paper>
                                    </Stack>
                                )}

                                {activeSection === 'Telemetry Specs' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#e0f2fe', color: '#0ea5e9', display: 'flex' }}>
                                                    <Timeline />
                                                </Box>
                                                <Typography variant="h4" sx={{ fontWeight: 600 }}>Telemetry & Data Flows</Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 4 }}>
                                                Every event in the modeling engine generates a telemetry packet. These packets are aggregated to provide system-wide insights into latency distributions and cache efficiency.
                                            </Typography>
                                        </Box>

                                        <Stack spacing={3}>
                                            <Box sx={{ p: 3, bgcolor: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block', mb: 1 }}>METRIC SCHEMA (JSON)</Typography>
                                                <Box component="pre" sx={{ fontSize: '12px', color: '#334155', overflowX: 'auto', fontFamily: 'monospace' }}>
                                                    {`{
  "timestamp": 1726543200,
  "node_id": "worker-04",
  "metrics": {
    "hit_ratio": 0.82,
    "latency_ms": 4.5,
    "eviction_count": 12
  }
}`}
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                The data stream is transmitted via high-speed WebSockets to the Analytics engine for real-time visualization.
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                )}

                                {activeSection === 'AI Integration' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#f5f3ff', color: '#8b5cf6', display: 'flex' }}>
                                                    <Psychology />
                                                </Box>
                                                <Typography variant="h4" sx={{ fontWeight: 600 }}>Gemini Modeling Analyst</Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 4 }}>
                                                CacheNet integrates with Google's Gemini models to provide intelligent layer analysis. The analyst identifies emergent bottlenecks that traditional heuristics might miss.
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={3}>
                                            {[
                                                { title: 'Anomaly Detection', desc: 'Identifies unexpected drops in hit-ratios or sudden spikes in eviction rates.' },
                                                { title: 'Topology Optimization', desc: 'Suggests node redistribution strategies based on traffic heatmaps.' },
                                                { title: 'Predictive Scaling', desc: 'Forecasts resource requirements under simulated high-load scenarios.' }
                                            ].map((feature, i) => (
                                                <Grid size={{ xs: 12 }} key={i}>
                                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', bgcolor: '#ffffff', '&:hover': { bgcolor: '#f8fafc' } }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a' }}>{feature.title}</Typography>
                                                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>{feature.desc}</Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Stack>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Dashboard Link CTA */}
                        {activeSection === 'Overview' && (
                            <Box sx={{
                                mt: 8, p: 6, borderRadius: '24px', textAlign: 'center',
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                color: 'white', position: 'relative', overflow: 'hidden'
                            }}>
                                <Box className="bg-grid-blue" sx={{ position: 'absolute', inset: 0, opacity: 0.1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, position: 'relative' }}>Initialize Modeling</Typography>
                                <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4, position: 'relative', maxWidth: 450, mx: 'auto', fontWeight: 400 }}>
                                    Test these architectures in our professional dashboard with real-time feedback and telemetry.
                                </Typography>
                                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForward />}
                                        sx={{
                                            bgcolor: '#2563eb', color: 'white', borderRadius: '12px',
                                            px: 6, py: 1.5, fontWeight: 600, textTransform: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(37,99,235,0.2)',
                                            '&:hover': { bgcolor: '#1d4ed8' },
                                            position: 'relative'
                                        }}
                                    >
                                        Open Dashboard
                                    </Button>
                                </Link>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

function NavAnchor({ label, href }: { label: string, href: string }) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, '&:hover': { color: '#2563eb' } }}>
                {label}
            </Typography>
        </Link>
    );
}
