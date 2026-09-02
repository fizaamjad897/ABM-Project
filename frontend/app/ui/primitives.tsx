'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Typography, Stack } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { c, radius } from '../theme';

/* ============================================================
   Shared primitives. Every surface in CacheNet is built from
   these, so a change here is a change everywhere — which is the
   whole point of having them.
   ============================================================ */

export const MAX_W = 1240;

/* ---------- identity ---------- */

export function Mark({ size = 22 }: { size?: number }) {
    // Four cache nodes around an origin — the model, drawn small.
    return (
        <Box
            component="svg"
            viewBox="0 0 24 24"
            sx={{ width: size, height: size, display: 'block', flex: 'none' }}
            aria-hidden
        >
            <rect x="1" y="1" width="22" height="22" rx="6" fill={c.ink} />
            <circle cx="12" cy="12" r="2.4" fill="#fff" />
            <circle cx="6.6" cy="6.6" r="1.9" fill={c.accent} />
            <circle cx="17.4" cy="6.6" r="1.9" fill={c.accent} />
            <circle cx="6.6" cy="17.4" r="1.9" fill={c.accent} />
            <circle cx="17.4" cy="17.4" r="1.9" fill={c.accent} />
        </Box>
    );
}

export function Wordmark({ href = '/' }: { href?: string }) {
    return (
        <Link href={href} aria-label="CacheNet home">
            <Stack direction="row" spacing={1.25} alignItems="center">
                <Mark />
                <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: c.ink }}>
                    CacheNet
                </Typography>
            </Stack>
        </Link>
    );
}

/* ---------- navigation ---------- */

const NAV = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Docs', href: '/docs' },
];

export function Nav({ current, children }: { current?: string; children?: React.ReactNode }) {
    return (
        <Box
            component="header"
            sx={{
                position: 'sticky', top: 0, zIndex: 20, height: 56,
                bgcolor: 'rgba(255,255,255,.82)', backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${c.line}`,
            }}
        >
            <Box sx={{
                maxWidth: MAX_W, mx: 'auto', height: '100%', px: { xs: 2.5, md: 4 },
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3,
            }}>
                <Wordmark />
                <Stack direction="row" spacing={{ xs: 2, md: 3 }} alignItems="center">
                    <Stack direction="row" spacing={{ xs: 2, md: 3 }} alignItems="center"
                        sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        {NAV.map((n) => {
                            const active = current === n.label;
                            return (
                                <Link key={n.href} href={n.href}>
                                    <Typography sx={{
                                        fontSize: 13.5, fontWeight: active ? 600 : 400,
                                        color: active ? c.ink : c.ink2,
                                        transition: 'color .16s var(--ease)',
                                        '&:hover': { color: c.ink },
                                    }}>
                                        {n.label}
                                    </Typography>
                                </Link>
                            );
                        })}
                    </Stack>
                    {children}
                </Stack>
            </Box>
        </Box>
    );
}

/* ---------- layout ---------- */

export function Page({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) {
    return (
        <Box sx={{ maxWidth: MAX_W, mx: 'auto', px: { xs: 2.5, md: 4 }, ...sx }}>{children}</Box>
    );
}

/* Section heading. No eyebrow above it — the heading carries itself. */
export function Heading({ title, lead, sx }: { title: React.ReactNode; lead?: string; sx?: SxProps<Theme> }) {
    return (
        <Box sx={{ ...sx }}>
            <Typography variant="h3" component="h2">{title}</Typography>
            {lead && (
                <Typography sx={{ mt: 1.25, color: c.ink2, maxWidth: '62ch', fontSize: 15.5 }}>
                    {lead}
                </Typography>
            )}
        </Box>
    );
}

export function Label({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) {
    return (
        <Typography component="span" sx={{
            fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase',
            color: c.ink3, display: 'block', ...sx,
        }}>
            {children}
        </Typography>
    );
}

export function Mono({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) {
    return (
        <Box component="span" className="mono num" sx={{ fontSize: 12.5, color: c.ink2, ...sx }}>
            {children}
        </Box>
    );
}

/* ---------- panel ---------- */

export function Panel({
    title, action, children, flush, dark, sx, bodySx,
}: {
    title?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
    flush?: boolean;
    dark?: boolean;
    sx?: SxProps<Theme>;
    bodySx?: SxProps<Theme>;
}) {
    return (
        <Box sx={{
            border: `1px solid ${c.line}`, borderRadius: `${radius.md}px`,
            bgcolor: dark ? c.inverse : c.surface, overflow: 'hidden',
            display: 'flex', flexDirection: 'column', ...sx,
        }}>
            {title && (
                <Box sx={{
                    flex: 'none', height: 42, px: 2, display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 2,
                    borderBottom: `1px solid ${dark ? c.inverse2 : c.line}`,
                    bgcolor: dark ? c.inverse : c.surface,
                }}>
                    <Typography sx={{
                        fontSize: 12.5, fontWeight: 600, letterSpacing: '.01em',
                        color: dark ? c.inkInverse : c.ink,
                    }}>
                        {title}
                    </Typography>
                    {action}
                </Box>
            )}
            <Box sx={{ flex: 1, minHeight: 0, p: flush ? 0 : 2, ...bodySx }}>{children}</Box>
        </Box>
    );
}

/* ---------- data display ---------- */

type Tone = 'neutral' | 'accent' | 'hit' | 'miss' | 'origin';

const TONE: Record<Tone, { fg: string; bg: string; bd: string }> = {
    neutral: { fg: c.ink2, bg: c.surface, bd: c.line },
    accent: { fg: c.accentInk, bg: c.accentWash, bd: c.accentLine },
    hit: { fg: c.hit, bg: c.hitWash, bd: c.hitLine },
    miss: { fg: c.miss, bg: c.missWash, bd: c.missLine },
    origin: { fg: c.origin, bg: c.originWash, bd: c.originLine },
};

export function Tag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
    const t = TONE[tone];
    return (
        <Box component="span" sx={{
            display: 'inline-flex', alignItems: 'center', gap: .75, height: 22, px: 1,
            borderRadius: `${radius.sm}px`, border: `1px solid ${t.bd}`, bgcolor: t.bg, color: t.fg,
            fontSize: 11.5, fontWeight: 500, whiteSpace: 'nowrap',
        }}>
            {children}
        </Box>
    );
}

export function Dot({ tone = 'hit', pulse }: { tone?: Tone; pulse?: boolean }) {
    return (
        <Box component="span" className={pulse ? 'pulse' : undefined} sx={{
            width: 6, height: 6, borderRadius: '50%', flex: 'none',
            bgcolor: TONE[tone].fg,
        }} />
    );
}

/* A metric cell. Cells live inside one ruled strip — never four floating cards. */
export function Metric({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
    return (
        <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2 }}>
            <Label>{label}</Label>
            <Typography className="num" sx={{
                mt: .75, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em',
                lineHeight: 1.1, color: c.ink,
            }}>
                {value}
            </Typography>
            {hint && <Typography sx={{ mt: .5, fontSize: 12, color: c.ink3 }}>{hint}</Typography>}
        </Box>
    );
}

/* The strip that holds them: one border, internal rules. */
export function MetricStrip({ children, cols = 4 }: { children: React.ReactNode; cols?: number }) {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: `repeat(${cols}, 1fr)` },
            border: `1px solid ${c.line}`, borderRadius: `${radius.md}px`, bgcolor: c.surface,
            '& > *': { borderRight: `1px solid ${c.lineSoft}`, borderBottom: `1px solid ${c.lineSoft}` },
            '& > *:nth-of-type(2n)': { borderRight: { xs: 0, md: `1px solid ${c.lineSoft}` } },
            [`& > *:nth-of-type(${cols}n)`]: { borderRight: { md: 0 } },
            '& > *:last-of-type': { borderRight: 0 },
            [`& > *:nth-last-of-type(-n+2)`]: { borderBottom: { xs: 0, md: `1px solid ${c.lineSoft}` } },
            [`& > *:nth-last-of-type(-n+${cols})`]: { borderBottom: { md: 0 } },
        }}>
            {children}
        </Box>
    );
}

/* A definition row: label left, value right, hairline under. */
export function DefRow({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
    return (
        <Box className="row">
            <Typography sx={{ fontSize: 13.5, color: c.ink2 }}>{k}</Typography>
            <Box sx={{ fontSize: 13, fontWeight: 500, color: c.ink, textAlign: 'right' }} className="num">{v}</Box>
        </Box>
    );
}

/* ---------- footer ---------- */

export function Footer() {
    return (
        <Box component="footer" sx={{ mt: 12, borderTop: `1px solid ${c.line}`, bgcolor: c.surface }}>
            <Page sx={{ py: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Mark size={18} />
                    <Typography sx={{ fontSize: 13, color: c.ink2 }}>
                        CacheNet — agent-based distributed cache simulator
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={3}>
                    {NAV.map((n) => (
                        <Link key={n.href} href={n.href}>
                            <Typography sx={{ fontSize: 13, color: c.ink2, '&:hover': { color: c.ink } }}>{n.label}</Typography>
                        </Link>
                    ))}
                </Stack>
            </Page>
        </Box>
    );
}
