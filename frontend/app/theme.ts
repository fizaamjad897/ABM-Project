'use client';

import { createTheme } from '@mui/material/styles';

/* ============================================================
   The single source of colour truth.

   Rule of the system: interface chrome carries no colour. Nav,
   panels, borders, buttons and controls are neutral. Colour only
   appears where it names something the model does —
   cyan = a request in flight, green = a cache hit,
   amber = a read that fell through to the origin, red = a failure.
   A chart line is green because it plots hits.
   ============================================================ */
export const c = {
    /* surfaces, darkest to lightest */
    paper: '#0b0c0e',      // page
    surface: '#121418',    // panels
    sunken: '#191c21',     // raised fills: chips, table heads, bubbles
    inverse: '#08090b',    // recessed wells: the event console
    inverse2: '#1b1e24',   // its border

    /* text */
    ink: '#eceef1',
    ink2: '#9ba1ab',
    ink3: '#7b818b',
    inkInverse: '#eceef1',
    inkInverse2: '#7b818b',

    /* rules — "soft" sits closer to the background, "strong" further */
    line: '#23262c',
    lineSoft: '#1a1d22',
    lineStrong: '#343841',

    /* neutral emphasis — used where nothing is being stated about data */
    accent: '#eceef1',
    accentInk: '#ffffff',
    accentWash: '#1c1f25',
    accentLine: '#33373f',

    /* ------------------------------------------------------------
       Channel colours. Borrowed from test equipment, where every
       trace on the screen gets its own hue so you can tell the
       channels apart at a glance. Each one here names one thing the
       model does, and is never used for anything else.
       ------------------------------------------------------------ */
    route: '#22d3ee',      // a request in flight: client -> balancer -> node
    routeWash: '#062a33',
    routeLine: '#0e4c5c',

    hit: '#34e39b',        // the node answered from its own cache
    hitWash: '#07291d',
    hitLine: '#12523a',

    origin: '#f0a92e',     // the read fell through to the database
    originWash: '#2b1f07',
    originLine: '#553d10',

    miss: '#ff4d6a',       // a node died, or the run failed
    missWash: '#2d1017',
    missLine: '#5a2030',

    violet: '#a97cff',     // reserved for a further series in comparisons
    violetWash: '#1b1333',
    violetLine: '#3b2a68',
} as const;

/* Chart series, in the order the eye should read them. Semantic first. */
export const series = [c.hit, c.origin, c.route, c.violet, c.miss];

export const radius = { sm: 4, md: 8 };

const theme = createTheme({
    cssVariables: false,
    palette: {
        mode: 'dark',
        primary: { main: c.accent, dark: '#ffffff', light: c.accentWash, contrastText: c.paper },
        success: { main: c.hit },
        error: { main: c.miss },
        warning: { main: c.origin },
        background: { default: c.paper, paper: c.surface },
        text: { primary: c.ink, secondary: c.ink2, disabled: c.ink3 },
        divider: c.line,
    },
    shape: { borderRadius: radius.md },
    typography: {
        fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
        htmlFontSize: 16,
        fontSize: 15,
        h1: { fontSize: '3.5rem', lineHeight: 1.06, letterSpacing: '-0.022em', fontWeight: 600 },
        h2: { fontSize: '2.5rem', lineHeight: 1.12, letterSpacing: '-0.02em', fontWeight: 600 },
        h3: { fontSize: '1.75rem', lineHeight: 1.22, letterSpacing: '-0.016em', fontWeight: 600 },
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
            styleOverrides: { body: { backgroundColor: c.paper, colorScheme: 'dark' } },
        },
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: c.surface,
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
                /* The one high-contrast element on the page. */
                containedPrimary: {
                    backgroundColor: c.ink,
                    color: c.paper,
                    '&:hover': { backgroundColor: '#ffffff' },
                },
                outlined: {
                    borderColor: c.line,
                    color: c.ink,
                    backgroundColor: 'transparent',
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
                    backgroundColor: c.sunken,
                    color: c.ink2,
                },
                label: { paddingInline: 8 },
                icon: { marginLeft: 6, marginRight: -2, fontSize: 14 },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: c.ink, height: 3, padding: '12px 0',
                    '&.Mui-disabled': { color: c.lineStrong },
                },
                rail: { backgroundColor: c.lineStrong, opacity: 1 },
                track: { border: 'none' },
                thumb: {
                    width: 13, height: 13, backgroundColor: c.paper,
                    border: `2px solid ${c.ink}`,
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
                    color: c.ink3,
                    '&.Mui-checked': {
                        transform: 'translateX(14px)',
                        color: c.paper,
                        '& + .MuiSwitch-track': { opacity: 1, backgroundColor: c.ink },
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
                    backgroundColor: c.paper,
                    fontSize: '0.875rem',
                    color: c.ink,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: c.line },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.lineStrong },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.route, borderWidth: 1 },
                },
                input: { '&::placeholder': { color: c.ink3, opacity: 1 } },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: { height: 3, borderRadius: 2, backgroundColor: c.line },
                bar: { borderRadius: 2, backgroundColor: c.ink },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: c.sunken, color: c.ink, border: `1px solid ${c.line}`,
                    fontSize: '0.75rem', fontWeight: 400, borderRadius: radius.sm, padding: '6px 9px',
                },
            },
        },
        MuiDivider: { styleOverrides: { root: { borderColor: c.line } } },
        MuiIconButton: { styleOverrides: { root: { color: c.ink2, '&:hover': { color: c.ink, backgroundColor: c.sunken } } } },
    },
});

export default theme;
