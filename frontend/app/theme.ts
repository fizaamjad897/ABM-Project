'use client';

import { createTheme } from '@mui/material/styles';

/* The single source of colour truth. Anything not here does not exist. */
export const c = {
    paper: '#fbfbfc',
    surface: '#ffffff',
    sunken: '#f6f7f9',
    inverse: '#0b1220',
    inverse2: '#131c2e',

    ink: '#0a0f1a',
    ink2: '#556072',
    ink3: '#8a93a3',
    inkInverse: '#e8ecf3',
    inkInverse2: '#8b98ae',

    line: '#e4e7ec',
    lineSoft: '#eff1f4',
    lineStrong: '#cdd3dd',

    accent: '#2563eb',
    accentInk: '#1d4ed8',
    accentWash: '#eff4ff',
    accentLine: '#d5e2fd',

    hit: '#0e9f6e',
    hitWash: '#ecfdf5',
    hitLine: '#b9e9d4',
    miss: '#e02424',
    missWash: '#fef2f2',
    missLine: '#fbd5d5',
    origin: '#c2760b',
    originWash: '#fffaeb',
    originLine: '#f6dfae',
} as const;

/* Chart series: accent first, then neutrals. Colour marks a series, not a mood. */
export const series = [c.accent, c.origin, c.hit, '#7c8698', '#9aa4b5'];

export const radius = { sm: 4, md: 8 };

const theme = createTheme({
    cssVariables: false,
    palette: {
        mode: 'light',
        primary: { main: c.accent, dark: c.accentInk, light: c.accentWash, contrastText: '#fff' },
        success: { main: c.hit },
        error: { main: c.miss },
        warning: { main: c.origin },
        background: { default: c.paper, paper: c.surface },
        text: { primary: c.ink, secondary: c.ink2, disabled: c.ink3 },
        divider: c.line,
    },
    shape: { borderRadius: radius.md },
    typography: {
        fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif',
        htmlFontSize: 16,
        fontSize: 15,
        h1: { fontSize: '3.5rem', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 600 },
        h2: { fontSize: '2.5rem', lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 600 },
        h3: { fontSize: '1.75rem', lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 600 },
        h4: { fontSize: '1.3125rem', lineHeight: 1.3, letterSpacing: '-0.015em', fontWeight: 600 },
        h5: { fontSize: '1.0625rem', lineHeight: 1.4, letterSpacing: '-0.01em', fontWeight: 600 },
        h6: { fontSize: '0.9375rem', lineHeight: 1.45, letterSpacing: '-0.005em', fontWeight: 600 },
        body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
        body2: { fontSize: '0.84375rem', lineHeight: 1.6 },
        button: { fontWeight: 500, letterSpacing: 0 },
        caption: { fontSize: '0.75rem', lineHeight: 1.5 },
        overline: {
            fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
            textTransform: 'uppercase', lineHeight: 1.4,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: { body: { backgroundColor: c.paper } },
        },
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: radius.md,
                    border: `1px solid ${c.line}`,
                    boxShadow: 'none',
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true, disableRipple: true },
            styleOverrides: {
                root: {
                    borderRadius: radius.sm,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    padding: '8px 16px',
                    minWidth: 0,
                    transition: 'background-color .16s var(--ease), border-color .16s var(--ease), color .16s var(--ease)',
                },
                sizeLarge: { padding: '12px 22px', fontSize: '0.9375rem' },
                sizeSmall: { padding: '6px 12px', fontSize: '0.8125rem' },
                containedPrimary: {
                    backgroundColor: c.accent,
                    '&:hover': { backgroundColor: c.accentInk },
                },
                outlined: {
                    borderColor: c.line,
                    color: c.ink,
                    backgroundColor: c.surface,
                    '&:hover': { borderColor: c.lineStrong, backgroundColor: c.sunken },
                },
                text: {
                    color: c.ink2,
                    '&:hover': { backgroundColor: c.sunken, color: c.ink },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: radius.sm,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 24,
                    border: `1px solid ${c.line}`,
                    backgroundColor: c.surface,
                    color: c.ink2,
                },
                label: { paddingInline: 8 },
                icon: { marginLeft: 6, marginRight: -2, fontSize: 14 },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: c.accent, height: 3, padding: '12px 0',
                    '&.Mui-disabled': { color: c.lineStrong },
                },
                rail: { backgroundColor: c.line, opacity: 1 },
                track: { border: 'none' },
                thumb: {
                    width: 13, height: 13, backgroundColor: c.surface,
                    border: `2px solid ${c.accent}`,
                    '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 5px ${c.accentWash}` },
                    '&.Mui-active': { boxShadow: `0 0 0 7px ${c.accentWash}` },
                },

            },
        },
        MuiSwitch: {
            styleOverrides: {
                root: { width: 34, height: 20, padding: 0, display: 'flex' },
                switchBase: {
                    padding: 3,
                    '&.Mui-checked': {
                        transform: 'translateX(14px)',
                        color: '#fff',
                        '& + .MuiSwitch-track': { opacity: 1, backgroundColor: c.accent },
                    },
                },
                thumb: { width: 14, height: 14, boxShadow: 'none' },
                track: { borderRadius: 10, opacity: 1, backgroundColor: c.lineStrong },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: radius.sm,
                    backgroundColor: c.surface,
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: c.line },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.lineStrong },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.accent, borderWidth: 1 },
                },
                input: { '&::placeholder': { color: c.ink3, opacity: 1 } },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: { height: 3, borderRadius: 2, backgroundColor: c.line },
                bar: { borderRadius: 2, backgroundColor: c.accent },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: c.inverse, fontSize: '0.75rem', fontWeight: 400,
                    borderRadius: radius.sm, padding: '6px 9px',
                },
            },
        },
        MuiDivider: { styleOverrides: { root: { borderColor: c.line } } },
    },
});

export default theme;
