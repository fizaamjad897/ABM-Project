# Frontend Structure Analysis

## Overview
The frontend is a **Next.js 16** application (using React 19) that serves as the control center and visualization dashboard for the simulation. It connects to the backend via **WebSockets** for real-time telemetry.

## Directory Structure
```
frontend/
├── app/
│   ├── dashboard/page.tsx  # The MAIN simulation interface
│   ├── layout.tsx          # Global layout (fonts, theme registry)
│   ├── ThemeRegistry.tsx   # Material UI setup with Next.js App Router
│   ├── globals.css         # Tailwind directives & global styles
│   └── page.tsx            # Landing page (likely redirects or shows intro)
├── package.json            # Dependencies (MUI, Recharts, Framer Motion)
└── next.config.ts          # Next.js configuration
```

## Key Components

### 1. Dashboard (`app/dashboard/page.tsx`)
This is the heart of the application. It acts as a "Lab Notebook" interface.

*   **State Management**:
    *   `metrics`: Array of data points matching time to hit ratio (for the chart).
    *   `logs`: List of simulation events (Hits, Misses, Invalidations).
    *   `config`: User settings (Nodes, Cache Size, Chaos).
    *   `ws`: The WebSocket connection reference.

*   **Visualizations**:
    *   **Telemetry Plot**: An `AreaChart` from `recharts` showing Hit Ratio over time.
    *   **System Topology**: A dynamic SVG-based map.
        *   `TopologyEdge`: Animated lines connecting Client -> Load Balancer -> Nodes -> DB.
        *   `NodeBox`: Represents agents. Uses `framer-motion` to pulse green/red on Hit/Miss.
    *   **Execution Logs**: A scrolling console window showing raw event logs.

*   **Interaction**:
    *   **Sliders**: Adjust parameters before running.
    *   **Execute Model**: Sends `START_SIM` command to backend.
    *   **System Analyst**: A chat interface interacting with `ai_analyst.py`.

### 2. Styles & Theme (`app/ThemeRegistry.tsx`)
*   Integrates **Material UI** (MUI) v7 with Next.js App Router.
*   Uses `Emotion` for CSS-in-JS style caching.
*   Fonts: Inter and JetBrains Mono.

### 3. WebSocket Integration
The dashboard establishes a persistent connection to `ws://localhost:8000/ws/simulation`.
*   **On Message (`SIM_UPDATE`)**:
    *   Updates `metrics` (Chart redraws).
    *   Updates `agentStates` (Visual topology nodes light up).
    *   Updates `logs` (Console text appears).

## User Flow
1.  **Configuration**: User sets "Model Nodes" to 5 and "Cache Storage" to 200MB.
2.  **Execution**: User clicks "Execute Model".
3.  **Real-Time View**:
    *   The "System Topology" drawing expands to show 5 nodes.
    *   "Packets" (dots) fly across the SVG lines.
    *   The "Hit Ratio" chart updates live.
4.  **Analysis**: User asks the chat: "Why is the hit ratio fluctuating?"
    *   Frontend sends metrics to `/ai/analyze`.
    *   Backend LLM explains the results.
