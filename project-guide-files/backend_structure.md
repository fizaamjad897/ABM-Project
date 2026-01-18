# Backend Structure Analysis

## Overview
The backend is a **Discrete-Event Simulation (DES)** engine built with **Python** and **FastAPI**. It models a distributed caching system where independent agents (clients, nodes, database) interact via a simulated network.

## Directory Structure
```
backend/
├── src/
│   ├── core/               # The simulation engine and agent definitions
│   │   ├── agents/         # Specific agent implementations
│   │   ├── cache/          # Cache data structures (LRU)
│   │   ├── engine/         # Core event loop logic
│   │   ├── experiments/    # Pre-defined simulation scenarios
│   │   ├── messages/       # Data classes for inter-agent messages
│   │   └── metrics/        # Telemetry collection
│   ├── api/                # (Optional) Additional API routes
│   ├── main.py             # Entry point (FastAPI app & WebSocket handler)
│   ├── simulation_manager.py # Orchestrator linking API to Simulation
│   └── ai_analyst.py       # LLM integration for log analysis
├── requirements.txt        # Dependencies (FastAPI, LangChain, etc.)
└── Dockerfile              # Containerization setup
```

## Key Components

### 1. The Core Engine (`src/core/engine/`)
*   **`simulation.py`**: Contains the event loop. It likely uses a priority queue (`heapq`) to manage events sorted by time. It executes the next event, updates the global clock, and handles the "future" queue.

### 2. Agents (`src/core/agents/`)
Agents are autonomous entities that have state and can schedule events.
*   **`service_node.py`**: Represents a **Cache Node**. It handles GET requests (checking local cache) and processes invalidation messages from the DB.
*   **`client.py`**: Simulates user traffic. It generates a stream of READ/WRITE requests directed at the Load Balancer.
*   **`database.py`**: The authoritative data source. Handles WRITEs and issues invalidations to service nodes.
*   **`load_balancer.py`**: Routes client requests to specific service nodes (e.g., Round Robin or Hash-based).
*   **`network.py`**: Simulates the messy reality of networks. It adds latency (delay) and potential packet loss to messages passing between agents.
*   **`chaos_monkey.py`**: Randomly "kills" or slows down nodes to test system resilience.
*   **`observer.py`**: A passive agent that records metrics (Hits, Misses, Latency) for analysis.

### 3. Simulation Manager (`src/simulation_manager.py`)
*   Acts as the bridge between the **Web** world (websockets) and the **Simulation** world.
*   Initializes the `Simulation` object and all internal agents based on the `config` received from the frontend.
*   Runs the simulation loop in chunks using `asyncio`, allowing it to yield control back to the event loop so the WebSocket can broadcast updates in real-time.

### 4. API Entry Point (`src/main.py`)
*   **`POST /simulate/start`**: Accepts configuration (nodes, cache size, etc.) and triggers the `SimulationManager`.
*   **`WS /ws/simulation`**: A bidirectional WebSocket.
    *   **Sends**: Real-time metrics (`SIM_UPDATE`), logs (`LOG`), and completion status (`SIM_FINISHED`).
    *   **Receives**: Commands like `STOP_SIM`.
*   **`POST /ai/analyze`**: Receives simulation metrics + a user query, sends them to `AIAnalyst` to generate an insight using an LLM.

### 5. AI Analyst (`src/ai_analyst.py`)
*   Uses **LangChain** and an LLM (likely OpenAI or Google Gemini) to interpret the raw JSON metrics into a human-readable summary.
*   Example: "Why did the hit ratio drop?" -> Analyst checks logs for "Chaos Monkey killed Node 2" and explains it.

## Data Flow
1.  **Frontend** sends `START` via WebSocket.
2.  **`main.py`** calls `sim_manager.run_simulation()`.
3.  **`sim_manager`** creates the agents and starts the `sim` loop.
4.  **`client` agent** schedules a "Send Request" event.
5.  **`network` agent** processes the message, adds delay, schedules "Receive Request" at `ServiceNode`.
6.  **`ServiceNode`** processes request, updates internal `LRUCache`.
7.  **`Observer`** records the result (Hit/Miss).
8.  **`sim_manager`** wakes up every few simulated milliseconds, gathers metrics from `Observer`, and pushes JSON to the **WebSocket**.
9.  **Frontend** renders the update on the charts.
