'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { c } from '../theme';

export type NodeState = 'idle' | 'hit' | 'miss' | 'dead';

/* ============================================================
   The model, drawn. One component, used by the landing page and
   the dashboard, so the diagram can never drift between them.
   Pure SVG on a fixed viewBox: it scales without measurement.
   ============================================================ */

const VW = 720;
const BOX_W = 74;
const BOX_H = 64;

/* Glyphs share one stroke weight and one grid — drawn, not borrowed. */
function Glyph({ kind, color }: { kind: 'lb' | 'node' | 'db'; color: string }) {
    const common = { stroke: color, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round' as const };
    if (kind === 'lb') {
        return (
            <g {...common}>
                <path d="M2 9 h4" />
                <path d="M6 9 C 9 9, 9 3, 12 3" />
                <path d="M6 9 h6" />
                <path d="M6 9 C 9 9, 9 15, 12 15" />
                <circle cx="14.2" cy="3" r="1.6" />
                <circle cx="14.2" cy="9" r="1.6" />
                <circle cx="14.2" cy="15" r="1.6" />
            </g>
        );
    }
    if (kind === 'db') {
        return (
            <g {...common}>
                <ellipse cx="9" cy="4.4" rx="6" ry="2.4" />
                <path d="M3 4.4 v9.2 c0 1.33 2.69 2.4 6 2.4 s6-1.07 6-2.4 V4.4" />
                <path d="M3 9 c0 1.33 2.69 2.4 6 2.4 s6-1.07 6-2.4" />
            </g>
        );
    }
    return (
        <g {...common}>
            <rect x="4.2" y="4.2" width="9.6" height="9.6" rx="1.6" />
            <path d="M7 1.6 v2.6 M11 1.6 v2.6 M7 13.8 v2.6 M11 13.8 v2.6" />
            <path d="M1.6 7 h2.6 M1.6 11 h2.6 M13.8 7 h2.6 M13.8 11 h2.6" />
        </g>
    );
}

function edgePath(a: [number, number], b: [number, number]) {
    const mx = (a[0] + b[0]) / 2;
    return `M ${a[0]} ${a[1]} C ${mx} ${a[1]}, ${mx} ${b[1]}, ${b[0]} ${b[1]}`;
}

function NodeBox({
    x, y, label, kind, state, tone,
}: {
    x: number; y: number; label: string;
    kind: 'lb' | 'node' | 'db'; state: NodeState; tone: string;
}) {
    const dead = state === 'dead';
    const stroke = dead ? c.missLine : state === 'hit' ? c.hit : state === 'miss' ? c.origin : c.line;
    const fg = dead ? c.miss : state === 'hit' ? c.hit : state === 'miss' ? c.origin : tone;
    return (
        <g transform={`translate(${x - BOX_W / 2} ${y - BOX_H / 2})`} style={{ transition: 'opacity .3s' }}>
            {(state === 'hit' || state === 'miss') && (
                <rect
                    x={-3} y={-3} width={BOX_W + 6} height={BOX_H + 6} rx={11}
                    fill="none" stroke={state === 'hit' ? c.hit : c.origin} strokeWidth={1}
                    opacity={0.3}
                />
            )}
            <rect
                width={BOX_W} height={BOX_H} rx={8}
                fill={dead ? c.missWash : c.surface}
                stroke={stroke} strokeWidth={1.25}
                style={{ transition: 'stroke .3s var(--ease), fill .3s var(--ease)' }}
            />
            <g transform={`translate(${BOX_W / 2 - 10} 13) scale(1.15)`} opacity={dead ? 0.5 : 1}>
                <Glyph kind={kind} color={fg} />
            </g>
            <text
                x={BOX_W / 2} y={BOX_H - 13} textAnchor="middle"
                fontSize={9.5} fontWeight={600} letterSpacing=".05em"
                fill={dead ? c.miss : c.ink3} fontFamily="var(--font-sans), sans-serif"
            >
                {label.toUpperCase()}
            </text>
        </g>
    );
}

export default function Topology({
    count = 4,
    states = {},
    running = false,
    height = 400,
}: {
    count?: number;
    states?: Record<string, NodeState>;
    running?: boolean;
    height?: number;
}) {
    const n = Math.max(1, Math.min(10, count));
    const H = height;
    const cy = H / 2;
    const top = 48;
    const span = H - top * 2;
    const ys = Array.from({ length: n }, (_, i) => (n === 1 ? cy : top + (span * i) / (n - 1)));

    const lb: [number, number] = [70, cy];
    const db: [number, number] = [VW - 70, cy];
    const nx = VW / 2;

    const edges = ys.map((y) => ({
        inn: edgePath([lb[0] + BOX_W / 2 + 6, cy], [nx - BOX_W / 2 - 6, y]),
        out: edgePath([nx + BOX_W / 2 + 6, y], [db[0] - BOX_W / 2 - 6, cy]),
    }));

    return (
        <Box
            component="svg"
            viewBox={`0 0 ${VW} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            sx={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
            role="img"
            aria-label={`Topology: load balancer, ${n} cache nodes, database`}
        >
            {edges.map((e, i) => {
                const dead = states[`node_${i}`] === 'dead';
                return (
                    <g key={i}>
                        <path
                            d={e.inn} fill="none"
                            stroke={dead ? c.missLine : c.route}
                            strokeWidth={1.1}
                            strokeDasharray={dead ? '4 5' : undefined}
                            opacity={dead ? 0.9 : 0.5}
                        />
                        <path
                            d={e.out} fill="none"
                            stroke={dead ? c.missLine : c.origin}
                            strokeWidth={1.1}
                            strokeDasharray={dead ? '4 5' : undefined}
                            opacity={dead ? 0.9 : 0.4}
                        />
                        {running && !dead && (
                            <>
                                <circle r={3.2} fill={c.route} style={{
                                    offsetPath: `path("${e.inn}")`, offsetRotate: '0deg',
                                    animation: `cn-packet ${1.6 + (i % 3) * 0.35}s linear infinite`,
                                    animationDelay: `${(i * 0.42) % 1.7}s`,
                                }} />
                                <circle r={2.8} fill={c.origin} opacity={0.85} style={{
                                    offsetPath: `path("${e.out}")`, offsetRotate: '0deg',
                                    animation: `cn-packet ${2 + (i % 2) * 0.4}s linear infinite`,
                                    animationDelay: `${0.9 + (i * 0.5) % 1.9}s`,
                                }} />
                            </>
                        )}
                    </g>
                );
            })}

            <NodeBox x={lb[0]} y={cy} label="Balancer" kind="lb" state="idle" tone={c.route} />
            {ys.map((y, i) => (
                <NodeBox
                    key={i} x={nx} y={y}
                    label={`Cache ${String(i).padStart(2, '0')}`}
                    kind="node"
                    state={states[`node_${i}`] ?? 'idle'}
                    tone={c.hit}
                />
            ))}
            <NodeBox x={db[0]} y={cy} label="Origin" kind="db" state={states.database ?? 'idle'} tone={c.origin} />
        </Box>
    );
}
