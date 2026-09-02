'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Button, Typography, Stack } from '@mui/material';
import { c } from '../theme';
import { Nav, Panel, Label, Footer, Tag, MAX_W } from '../ui/primitives';

const SECTIONS = [
    { id: 'overview', title: 'Overview' },
    { id: 'engine', title: 'Event engine' },
    { id: 'cache', title: 'Cache behaviour' },
    { id: 'faults', title: 'Fault injection' },
    { id: 'telemetry', title: 'Telemetry' },
    { id: 'analyst', title: 'Analyst' },
    { id: 'running', title: 'Running it' },
];

export default function DocsPage() {
    const [active, setActive] = React.useState('overview');

    React.useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
                if (visible) setActive(visible.target.id);
            },
            { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
        );
        SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) obs.observe(el);
        });
        return () => obs.disconnect();
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: c.paper }}>
            <Nav current="Docs" />

            <Box sx={{ maxWidth: MAX_W, mx: 'auto', px: { xs: 2.5, md: 4 }, py: { xs: 5, md: 7 } }}>
                <Box sx={{ maxWidth: '68ch', mb: { xs: 5, md: 7 } }}>
                    <Typography variant="h2" component="h1">How the model works</Typography>
                    <Typography sx={{ mt: 2, fontSize: 16.5, lineHeight: 1.7, color: c.ink2 }}>
                        A reference for the CacheNet simulator: the event engine, what each agent does,
                        the telemetry contract the dashboard reads, and how to run the whole thing locally.
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gap: { xs: 4, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '190px minmax(0,1fr)' }, alignItems: 'start' }}>
                    {/* ---------- index ---------- */}
                    <Box component="nav" sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
                        <Label sx={{ mb: 1.5 }}>Contents</Label>
                        {SECTIONS.map((s) => (
                            <Box
                                key={s.id}
                                component="a"
                                href={`#${s.id}`}
                                sx={{
                                    display: 'block', py: .85, pl: 1.5, fontSize: 13.5,
                                    borderLeft: `1px solid ${active === s.id ? c.accent : c.line}`,
                                    color: active === s.id ? c.ink : c.ink2,
                                    fontWeight: active === s.id ? 500 : 400,
                                    transition: 'color .14s var(--ease), border-color .14s var(--ease)',
                                    '&:hover': { color: c.ink },
                                }}
                            >
                                {s.title}
                            </Box>
                        ))}
                    </Box>

                    {/* ---------- body ---------- */}
                    <Box sx={{ minWidth: 0, '& section': { scrollMarginTop: '80px' } }}>

                        <Section id="overview" title="Overview">
                            <P>
                                CacheNet is an agent-based model of a distributed cache sitting in front of a
                                database. Nothing in it is scripted: clients, cache nodes, a load balancer, a
                                network and an origin database each follow their own rules, exchange messages,
                                and the behaviour you watch on the dashboard is what falls out of that.
                            </P>
                            <P>
                                Every agent runs on one shared clock. There is no wall-clock time and no
                                threading — the engine advances to the timestamp of the next scheduled event,
                                which makes a run deterministic and repeatable for a given configuration.
                            </P>
                            <Table
                                head={['Agent', 'Responsibility']}
                                rows={[
                                    ['load_balancer', 'Routes each request to a node by key hash so a key keeps landing on the same node.'],
                                    ['service_node', 'Holds an LRU cache, answers reads, applies TTL and honours invalidation messages.'],
                                    ['client', 'Generates the read and write traffic that drives the model.'],
                                    ['database', 'Source of truth. Serves misses and issues invalidations on every write.'],
                                    ['network', 'Adds latency and possible loss to every message that crosses it.'],
                                    ['chaos_monkey', 'Terminates or degrades nodes mid-run so recovery can be observed.'],
                                    ['observer', 'Samples hits, misses and latency and pushes them to the interface.'],
                                ]}
                            />
                        </Section>

                        <Section id="engine" title="Event engine">
                            <P>
                                The engine is a discrete-event simulator. Events sit in a priority queue keyed
                                by their scheduled time; the loop pops the earliest, moves the clock to it, and
                                lets the receiving agent react — which usually schedules further events.
                            </P>
                            <Table
                                head={['Property', 'Value']}
                                rows={[
                                    ['Queue', 'Python heapq, O(log n) push and pop'],
                                    ['Ordering', 'By event time, ties broken by monotonic event id'],
                                    ['Clock', 'Model time in milliseconds, advanced event to event'],
                                    ['Concurrency', 'None — one event is handled at a time, by design'],
                                ]}
                            />
                            <P>
                                A single write followed by a read produces the sequence below. It is the
                                worked example the engine ships with, and the reason a read can miss even
                                though the key was cached moments earlier.
                            </P>
                            <Code caption="Trace: write then read, one key">{`t=0    client   WRITE  key=test_key
t=5    database recv WRITE → invalidate all nodes holding key
t=10   node_*   INVALIDATE key=test_key
t=15   client   READ   key=test_key
t=20   node_1   CACHE_MISS → fetch from database
t=30   client   RESPONSE key=test_key value=v1`}</Code>
                        </Section>

                        <Section id="cache" title="Cache behaviour">
                            <P>
                                Each node keeps its own cache backed by an ordered map, giving O(1) lookup,
                                insertion and eviction. Reads move a key to the most-recently-used end;
                                when the node is at capacity the least-recently-used key is dropped.
                            </P>
                            <Table
                                head={['Mechanism', 'Behaviour']}
                                rows={[
                                    ['Lookup', 'Hash lookup on the local map — no scan, no coordination with other nodes.'],
                                    ['Eviction', 'Least recently used, triggered when the node hits its configured size.'],
                                    ['TTL', 'Entries carry an expiry; an expired entry is treated as a miss.'],
                                    ['Invalidation', 'The database pushes invalidations on write, so nodes never serve a value it has superseded.'],
                                ]}
                            />
                            <Callout>
                                Consistency here is invalidation-based, not write-through. Between the write
                                landing and the invalidation arriving, a node can still answer with the old
                                value — that window is real, and it is visible in the log.
                            </Callout>
                        </Section>

                        <Section id="faults" title="Fault injection">
                            <P>
                                With the Chaos Monkey armed, the model kills a node partway through a run.
                                The interesting part is not the failure — it is what the remaining nodes do
                                next, and how long the cluster takes to get its hit ratio back.
                            </P>
                            <Table
                                head={['Stage', 'What happens']}
                                rows={[
                                    ['Termination', 'A node stops accepting traffic and its cached keys are gone.'],
                                    ['Re-hash', 'The balancer redistributes that node’s share of the keyspace across survivors.'],
                                    ['Cold period', 'Re-routed keys are not cached on their new node, so every one of them misses.'],
                                    ['Re-warm', 'Misses fill the survivors, and the hit ratio climbs back toward its previous level.'],
                                ]}
                            />
                            <P>
                                The recovery is caused by re-warming, not by repair. That distinction is the
                                single most useful thing the model teaches.
                            </P>
                        </Section>

                        <Section id="telemetry" title="Telemetry">
                            <P>
                                The backend holds one WebSocket open at <Mono>/ws/simulation</Mono>. The client
                                sends commands over it and receives three kinds of message back.
                            </P>
                            <Table
                                head={['Message', 'Carries']}
                                rows={[
                                    ['SIM_UPDATE', 'Aggregate metrics, per-agent stats, alive flags, model time and progress.'],
                                    ['LOG', 'One event line: model time, log type and a human-readable message.'],
                                    ['SIM_FINISHED', 'Final metrics and agent state; the dashboard stores this as a run.'],
                                ]}
                            />
                            <Code caption="SIM_UPDATE payload">{`{
  "type": "SIM_UPDATE",
  "time": 61.4,
  "progress": 62.0,
  "metrics": { "hits": 1121, "misses": 163, "unique_keys": 240 },
  "agent_states": { "node_0": true, "node_2": false },
  "agent_stats": { "node_0": { "hits": 142, "misses": 18 } }
}`}</Code>
                            <P>
                                Commands travel the other way as <Mono>{'{ type: "START_SIM", config }'}</Mono> and
                                <Mono>{' { type: "STOP_SIM" }'}</Mono>, where <Mono>config</Mono> carries node count,
                                cache size, duration and the chaos flag.
                            </P>
                        </Section>

                        <Section id="analyst" title="Analyst">
                            <P>
                                The dashboard can hand the current metrics envelope to a language model and ask
                                it to explain the run. The request is a plain POST; the model sees exactly the
                                numbers on your screen and nothing else.
                            </P>
                            <Table
                                head={['Detail', 'Value']}
                                rows={[
                                    ['Endpoint', 'POST /ai/analyze'],
                                    ['Body', '{ "query": string, "metrics": object }'],
                                    ['Provider', 'Groq, via LangChain'],
                                    ['Model', 'llama-3.3-70b-versatile (GROQ_MODEL)'],
                                    ['Key', 'GROQ_API_KEY in the backend environment'],
                                ]}
                            />
                            <Callout>
                                Without a key the endpoint still answers, but the analyst panel will tell you it
                                could not reach a model rather than inventing an explanation.
                            </Callout>
                        </Section>

                        <Section id="running" title="Running it">
                            <P>Two processes: the Python engine and this interface.</P>
                            <Code caption="Backend — port 8000">{`cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python src/main.py`}</Code>
                            <Code caption="Frontend — port 3000">{`cd frontend
npm install
npm run dev`}</Code>
                            <P>
                                The dashboard reads <Mono>NEXT_PUBLIC_WS_URL</Mono> and <Mono>NEXT_PUBLIC_API_URL</Mono>,
                                falling back to localhost:8000. If the badge in the header reads
                                “Engine offline”, the backend is not up or those variables point somewhere else.
                            </P>
                            <Box sx={{
                                mt: 5, p: 3, border: `1px solid ${c.line}`, borderRadius: '8px', bgcolor: c.surface,
                                display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <Typography sx={{ fontSize: 14.5, color: c.ink2 }}>
                                    Everything above is easier to follow with a run in front of you.
                                </Typography>
                                <Link href="/dashboard"><Button variant="contained">Open dashboard</Button></Link>
                            </Box>
                        </Section>
                    </Box>
                </Box>
            </Box>

            <Footer />
        </Box>
    );
}

/* ---------- reading primitives ---------- */

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <Box component="section" id={id} sx={{ mb: 8, pt: 1 }}>
            <Typography variant="h3" component="h2" sx={{ pb: 2, mb: 3, borderBottom: `1px solid ${c.line}` }}>
                {title}
            </Typography>
            {children}
        </Box>
    );
}

function P({ children }: { children: React.ReactNode }) {
    return (
        <Typography sx={{ fontSize: 15.5, lineHeight: 1.75, color: c.ink2, maxWidth: '68ch', mb: 2.5 }}>
            {children}
        </Typography>
    );
}

function Mono({ children }: { children: React.ReactNode }) {
    return (
        <Box component="code" sx={{
            fontFamily: 'var(--font-mono), monospace', fontSize: 13, color: c.accentInk,
            bgcolor: c.accentWash, border: `1px solid ${c.accentLine}`, borderRadius: '3px', px: .5, py: .125,
        }}>
            {children}
        </Box>
    );
}

function Table({ head, rows }: { head: [string, string]; rows: string[][] }) {
    return (
        <Box sx={{ my: 3.5, border: `1px solid ${c.line}`, borderRadius: '8px', overflow: 'hidden' }}>
            <Box sx={{
                display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '210px 1fr' }, gap: { sm: 3 },
                px: 2.5, py: 1.25, bgcolor: c.sunken, borderBottom: `1px solid ${c.line}`,
            }}>
                {head.map((h) => <Label key={h}>{h}</Label>)}
            </Box>
            {rows.map(([k, v]) => (
                <Box key={k} sx={{
                    display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '210px 1fr' }, gap: { xs: .5, sm: 3 },
                    px: 2.5, py: 1.75, borderBottom: `1px solid ${c.lineSoft}`, '&:last-of-type': { borderBottom: 0 },
                }}>
                    <Typography className="mono" sx={{ fontSize: 12.5, color: c.ink, fontWeight: 500 }}>{k}</Typography>
                    <Typography sx={{ fontSize: 13.5, lineHeight: 1.65, color: c.ink2 }}>{v}</Typography>
                </Box>
            ))}
        </Box>
    );
}

function Code({ children, caption }: { children: string; caption?: string }) {
    return (
        <Box className="on-dark" sx={{ my: 3.5, border: `1px solid ${c.line}`, borderRadius: '8px', overflow: 'hidden' }}>
            {caption && (
                <Box sx={{ px: 2, py: 1, bgcolor: c.sunken, borderBottom: `1px solid ${c.line}` }}>
                    <Label>{caption}</Label>
                </Box>
            )}
            <Box component="pre" sx={{
                m: 0, p: 2.5, bgcolor: c.inverse, color: c.inkInverse, overflowX: 'auto',
                fontFamily: 'var(--font-mono), monospace', fontSize: 12.5, lineHeight: 1.75,
            }}>
                {children}
            </Box>
        </Box>
    );
}

function Callout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{
            my: 3.5, px: 2.5, py: 2, bgcolor: c.surface,
            border: `1px solid ${c.line}`, borderLeft: `1px solid ${c.accent}`, borderRadius: '8px',
        }}>
            <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: c.ink2, maxWidth: '64ch' }}>{children}</Typography>
        </Box>
    );
}
