'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, Typography, Stack } from '@mui/material';
import { c } from './theme';
import { Nav, Page, Panel, Heading, Label, Footer, Tag, Dot, MAX_W } from './ui/primitives';
import Topology from './ui/Topology';

/* The documented walkthrough of a single write-then-read, from the
   project README. Real timings from the engine, not illustration. */
const TRACE = [
    { t: '0 ms', title: 'Client writes', body: 'A client agent puts a new value for one key onto the queue.' },
    { t: '5 ms', title: 'Origin accepts', body: 'The database records the write and issues invalidations.' },
    { t: '10 ms', title: 'Nodes invalidate', body: 'Every cache node holding that key drops its copy.' },
    { t: '15 ms', title: 'Client reads', body: 'A read for the same key reaches the load balancer.' },
    { t: '20 ms', title: 'Cache miss', body: 'The routed node no longer holds the key and asks the origin.' },
    { t: '30 ms', title: 'Client answered', body: 'The value returns and the node caches it for next time.' },
];

const AGENTS = [
    ['load_balancer', 'Routes each request to a node by key hash, keeping affinity stable.'],
    ['service_node', 'Holds an LRU cache, answers reads, honours invalidation and TTL.'],
    ['client', 'Generates the read and write traffic that drives the model.'],
    ['database', 'The source of truth. Serves misses and invalidates on write.'],
    ['network', 'Applies latency and loss to every message between agents.'],
    ['chaos_monkey', 'Kills or degrades nodes at random to test what the cluster does next.'],
    ['observer', 'Samples hits, misses and latency, and streams them to this interface.'],
];

const SPECS = [
    ['Event queue', 'heapq', 'O(log n) scheduling, ties broken by event id.'],
    ['Cache', 'OrderedDict', 'O(1) LRU get, set and eviction per node.'],
    ['Transport', 'WebSocket', 'Telemetry sampled every 20 ms of model time.'],
];

export default function HomePage() {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: c.paper }}>
            <Nav current="Home">
                <Link href="/dashboard">
                    <Button variant="contained" size="small">Open dashboard</Button>
                </Link>
            </Nav>

            {/* ---------- hero ---------- */}
            <Page sx={{ pt: { xs: 7, md: 11 }, pb: { xs: 7, md: 10 } }}>
                <Box sx={{
                    display: 'grid', gap: { xs: 5, md: 7 },
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0,5fr) minmax(0,7fr)' },
                    alignItems: 'center',
                }}>
                    <Box className="enter">
                        <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.4rem' } }}>
                            Simulate a distributed cache, agent by agent.
                        </Typography>
                        <Typography sx={{ mt: 3, fontSize: 16.5, lineHeight: 1.7, color: c.ink2, maxWidth: '46ch' }}>
                            CacheNet models cache nodes, clients, a load balancer and an origin database as
                            independent agents on a discrete-event clock. Run it and watch the hit ratio
                            move — including the moment a node dies and the keyspace re-warms without it.
                        </Typography>
                        <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
                            <Link href="/dashboard"><Button variant="contained" size="large">Run a simulation</Button></Link>
                            <Link href="/docs"><Button variant="outlined" size="large">Read the docs</Button></Link>
                        </Stack>
                        <Stack direction="row" spacing={2.5} sx={{ mt: 4.5, flexWrap: 'wrap', rowGap: 1.5 }}>
                            {['Python engine', 'FastAPI', 'WebSocket telemetry', 'Next.js'].map((s) => (
                                <Typography key={s} className="mono" sx={{ fontSize: 11.5, color: c.ink3, letterSpacing: '.02em' }}>
                                    {s}
                                </Typography>
                            ))}
                        </Stack>
                    </Box>

                    <Panel
                        title="Model topology"
                        action={<Tag tone="hit"><Dot tone="hit" pulse />Running</Tag>}
                        bodySx={{ p: { xs: 1.5, md: 2.5 } }}
                    >
                        <Topology count={4} running height={360} />
                    </Panel>
                </Box>
            </Page>

            {/* ---------- one request, traced ---------- */}
            <Box sx={{ borderTop: `1px solid ${c.line}`, bgcolor: c.surface }}>
                <Page sx={{ py: { xs: 7, md: 10 } }}>
                    <Heading
                        title="One write, one read, six events"
                        lead="Nothing in the model is scheduled by hand. This is the sequence the engine produces for a single key when a write lands just before a read."
                    />
                    <Box sx={{
                        mt: 5, display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(6,1fr)' },
                        borderTop: `1px solid ${c.line}`,
                    }}>
                        {TRACE.map((s, i) => (
                            <Box key={s.t} sx={{
                                pt: 2.5, pb: 3, pr: 2.5,
                                borderRight: { lg: i === TRACE.length - 1 ? 0 : `1px solid ${c.lineSoft}` },
                                borderBottom: { xs: i === TRACE.length - 1 ? 0 : `1px solid ${c.lineSoft}`, lg: 0 },
                                position: 'relative',
                                '&::before': {
                                    content: '""', position: 'absolute', top: -1, left: 0, width: 28, height: 2,
                                    bgcolor: i === 4 ? c.miss : c.accent,
                                },
                            }}>
                                <Typography className="mono num" sx={{ fontSize: 12, color: i === 4 ? c.miss : c.accent, fontWeight: 500 }}>
                                    {s.t}
                                </Typography>
                                <Typography sx={{ mt: 1.25, fontSize: 14.5, fontWeight: 600, color: c.ink }}>{s.title}</Typography>
                                <Typography sx={{ mt: .75, fontSize: 13, lineHeight: 1.6, color: c.ink2, maxWidth: '30ch' }}>
                                    {s.body}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Page>
            </Box>

            {/* ---------- the agents ---------- */}
            <Page sx={{ py: { xs: 7, md: 10 } }}>
                <Box sx={{
                    display: 'grid', gap: { xs: 4, md: 7 },
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0,4fr) minmax(0,8fr)' },
                }}>
                    <Box>
                        <Heading
                            title="Seven agents, one clock"
                            lead="Each agent only knows its own state and the messages it receives. Everything you see on the dashboard — thundering herds, cascading misses, recovery — comes out of those local rules."
                        />
                    </Box>
                    <Box sx={{ border: `1px solid ${c.line}`, borderRadius: '8px', bgcolor: c.surface, px: 2.5 }}>
                        {AGENTS.map(([name, role]) => (
                            <Box key={name} sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' },
                                gap: { xs: .5, sm: 3 }, py: 2,
                                borderBottom: `1px solid ${c.lineSoft}`,
                                '&:last-of-type': { borderBottom: 0 },
                            }}>
                                <Typography className="mono" sx={{ fontSize: 12.5, color: c.ink, fontWeight: 500 }}>{name}</Typography>
                                <Typography sx={{ fontSize: 13.5, color: c.ink2, lineHeight: 1.6 }}>{role}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Page>

            {/* ---------- implementation ---------- */}
            <Box sx={{ borderTop: `1px solid ${c.line}`, bgcolor: c.surface }}>
                <Page sx={{ py: { xs: 7, md: 9 } }}>
                    <Box sx={{
                        display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' },
                        border: `1px solid ${c.line}`, borderRadius: '8px',
                    }}>
                        {SPECS.map(([k, v, note], i) => (
                            <Box key={k} sx={{
                                p: 3,
                                borderRight: { md: i === 2 ? 0 : `1px solid ${c.lineSoft}` },
                                borderBottom: { xs: i === 2 ? 0 : `1px solid ${c.lineSoft}`, md: 0 },
                            }}>
                                <Label>{k}</Label>
                                <Typography className="mono" sx={{ mt: 1, fontSize: 15, fontWeight: 500, color: c.ink }}>{v}</Typography>
                                <Typography sx={{ mt: 1, fontSize: 13, color: c.ink2, lineHeight: 1.6 }}>{note}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Page>
            </Box>

            {/* ---------- close ---------- */}
            <Page sx={{ py: { xs: 7, md: 10 } }}>
                <Box sx={{
                    border: `1px solid ${c.line}`, borderRadius: '8px', bgcolor: c.surface,
                    p: { xs: 3, md: 5 }, display: 'flex', flexWrap: 'wrap', gap: 3,
                    alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <Box>
                        <Typography variant="h4" component="h2">Set the parameters and run it</Typography>
                        <Typography sx={{ mt: 1, fontSize: 14.5, color: c.ink2, maxWidth: '52ch' }}>
                            Choose node count and cache size, arm the Chaos Monkey, and watch the telemetry
                            arrive over the socket while the model runs.
                        </Typography>
                    </Box>
                    <Link href="/dashboard"><Button variant="contained" size="large">Open dashboard</Button></Link>
                </Box>
            </Page>

            <Footer />
        </Box>
    );
}
