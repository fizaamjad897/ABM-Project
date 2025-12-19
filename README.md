# CacheNet: Agent-Based Distributed Cache Simulator

An agent-based model (ABM) simulator for distributed cache invalidation systems, built with discrete-event simulation. This project models service nodes, clients, network latency, and database interactions as autonomous agents communicating through message passing.

## Project Goal

Build a comprehensive simulation of distributed caching systems where:
- **Cache nodes** maintain local data with TTL and invalidation
- **Clients** generate read/write requests
- **Network** introduces realistic latency and potential failures
- **Database** serves as the source of truth
- **Agents** make decisions and communicate asynchronously

Future extension: Multi-agent chatbot interface with RAG for analyzing simulation results.

## Features

- **Discrete-Event Engine**: Priority queue-based simulation with precise timing
- **Agent-Based Architecture**: Modular agents for different system components
- **LRU Cache Implementation**: Efficient caching with eviction policies
- **Network Simulation**: Configurable latency, packet loss, and partitioning
- **Message Passing**: Asynchronous communication between agents
- **Metrics Collection**: Track cache hits, misses, staleness, and latency
- **Extensible Experiments**: Framework for running parameter sweeps and scenarios

## Architecture

```
CacheNet/
├── core/           # Simulation engine (events, time management)
├── agents/         # Agent implementations
│   ├── base.py         # BaseAgent class
│   ├── service_node.py # Cache node agents
│   ├── client.py       # Client request generators
│   ├── database.py     # Database source of truth
│   └── network.py      # Network latency simulation
├── cache/          # Cache data structures
├── messages/       # Inter-agent communication protocols
├── metrics/        # Performance monitoring
├── experiments/    # Simulation scenarios
└── chat_agent/     # Future RAG chatbot interface
```

## Quick Start

### Prerequisites
- Python 3.8+
- No external dependencies (uses only standard library)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fizaamjad897/ABM-Project.git
   cd ABM-Project
   ```

2. (Optional) Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

### Running the Simulation

Run the basic experiment:
```bash
python experiments/simple_run.py
```

Expected output:
```
Client client1 received: test_key = test_value (v1) at time 30
```

This demonstrates:
- Client writes data to database
- Database invalidates cache nodes
- Client reads, experiences cache miss due to invalidation
- Data retrieved from database and cached

## Understanding the Simulation

### Timeline Example
- **T=0**: Client sends WRITE request
- **T=5**: Database receives write, updates data, sends invalidates
- **T=10**: Cache nodes receive invalidation
- **T=15**: Client sends READ request
- **T=20**: Cache miss → query database
- **T=30**: Client receives response

### Key Concepts
- **Agents**: Autonomous entities with behavior and state
- **Messages**: Asynchronous communication with network delays
- **Events**: Discrete time steps in priority queue
- **Consistency**: Invalidation ensures cache coherence

## Configuration

### Network Latency
Modify latency in experiments:
```python
network = NetworkAgent(sim, latency_fn=lambda: random.uniform(1, 10))
```

### Cache Capacity
```python
cache = LRUCache(capacity=100)
```

### Experiment Parameters
Edit `experiments/simple_run.py` to:
- Add multiple clients/nodes
- Change timing
- Introduce network failures

## Metrics & Analysis

The simulator tracks:
- Cache hit/miss ratios
- Read latency distributions
- Invalidation overhead
- Network utilization

Future: Integration with analysis tools and visualization.

## Running Experiments

### Basic Experiment
```bash
python experiments/simple_run.py
```

### Custom Experiments
Create new files in `experiments/`:
```python
# experiments/load_test.py
from core.simulation import Simulation
# ... setup multiple clients with random requests
```

## Future: Multi-Agent Chatbot

Planned extension with:
- **RAG System**: Query simulation logs and metrics
- **Analysis Agents**: Explain performance bottlenecks
- **Experiment Agents**: Run parameter sweeps autonomously
- **LangChain Integration**: Natural language interaction

## Technical Details

### Event Queue
Uses Python's `heapq` for O(log n) event scheduling with tie-breaking by event ID.

### Agent Communication
All inter-agent communication goes through the NetworkAgent with configurable delays.

### Cache Implementation
LRU eviction using `collections.OrderedDict` for O(1) operations.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

Built for studying distributed systems, caching strategies, and agent-based modeling techniques.