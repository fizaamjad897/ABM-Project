# CacheNet Technical Documentation

## Overview

CacheNet is an agent-based model (ABM) simulator for distributed cache invalidation systems. This document provides a detailed technical breakdown of the codebase, explaining how each component works and interacts.

## Core Architecture

The simulator uses a discrete-event simulation approach where time advances in discrete steps based on scheduled events. All components are modeled as agents that communicate asynchronously through message passing with simulated network latency.

### Key Design Patterns

- **Agent Pattern**: Each system component (clients, caches, database, network) is an autonomous agent
- **Event-Driven Simulation**: Time advances through a priority queue of scheduled events
- **Message Passing**: All inter-agent communication uses structured messages with network delays
- **Observer Pattern**: Agents react to incoming messages without direct coupling

## Module Breakdown

### `core/` - Simulation Engine

#### `event.py` - Event Management

```python
class Event:
    def __init__(self, time, callback, payload=None):
        self.time = time
        self.callback = callback
        self.payload = payload
        self.id = next(Event._ids)  # Tie-breaker for same-time events

    def __lt__(self, other):
        return (self.time, self.id) < (other.time, other.id)
```

**Purpose**: Represents scheduled actions in the simulation timeline.

**Key Features**:
- Timestamp-based ordering
- Unique ID for tie-breaking
- Callback function to execute
- Optional payload data

```python
class EventQueue:
    def __init__(self):
        self.queue = []  # Python heapq

    def push(self, event: Event):
        heapq.heappush(self.queue, event)

    def pop(self):
        return heapq.heappop(self.queue)

    def empty(self):
        return len(self.queue) == 0
```

**Purpose**: Priority queue for managing simulation events.

**Implementation**: Uses `heapq` for O(log n) insertions and O(1) peeks.

#### `simulation.py` - Main Simulation Loop

```python
class Simulation:
    def __init__(self):
        self.time = 0
        self.event_queue = EventQueue()
        self.agents = []  # Registry of active agents

    def run(self, until_time):
        while not self.event_queue.empty():
            event = self.event_queue.pop()
            if event.time > until_time:
                break
            self.time = event.time
            event.callback()
```

**Purpose**: Orchestrates the entire simulation execution.

**Algorithm**:
1. While events exist and current time < end time
2. Pop earliest event from queue
3. Advance simulation time
4. Execute event callback
5. Repeat

### `agents/` - Agent Implementations

#### `base.py` - Base Agent Class

```python
class BaseAgent:
    def __init__(self, agent_id, sim):
        self.agent_id = agent_id
        self.sim = sim  # Reference to simulation for scheduling

    def handle_message(self, message):
        raise NotImplementedError
```

**Purpose**: Abstract base class defining the agent interface.

**Responsibilities**:
- Unique identification
- Access to simulation state
- Message handling contract

#### `network.py` - Network Agent

```python
class NetworkAgent:
    def __init__(self, sim, latency_fn, drop_prob=0.0):
        self.sim = sim
        self.latency_fn = latency_fn  # Function returning delay
        self.drop_prob = drop_prob

    def send(self, message):
        if random.random() < self.drop_prob:
            return  # Packet loss simulation

        delay = self.latency_fn()
        event = Event(
            time=self.sim.time + delay,
            callback=lambda: message.dst.handle_message(message)
        )
        self.sim.event_queue.push(event)
```

**Purpose**: Simulates network communication with latency and failures.

**Key Features**:
- Configurable latency distribution
- Packet drop probability
- Asynchronous message delivery
- Uses lambda closures to capture message context

#### `service_node.py` - Cache Node Agent

```python
class ServiceNode(BaseAgent):
    def __init__(self, agent_id, sim, cache, network, db):
        super().__init__(agent_id, sim)
        self.cache = cache
        self.network = network
        self.db = db
        self.pending_requests = {}  # key -> requester

    def handle_message(self, message):
        payload = message.payload

        if payload["type"] == "READ":
            self.handle_read(payload, message.src)
        elif payload["type"] == "INVALIDATE":
            self.cache.store.pop(payload["key"], None)
        elif payload["type"] == "READ_RESPONSE":
            # Handle DB response
            self.process_db_response(payload)

    def handle_read(self, payload, requester):
        key = payload["key"]
        entry = self.cache.get(key)

        if entry and entry.expiry > self.sim.time:
            # Cache hit - immediate response
            self.send_response(requester, entry)
        else:
            # Cache miss - query database
            self.pending_requests[key] = requester
            db_query = Message(src=self, dst=self.db,
                             payload={"type": "READ_DB", "key": key})
            self.network.send(db_query)
```

**Purpose**: Implements caching logic with invalidation handling.

**State Management**:
- LRU cache instance
- Pending request tracking
- Database reference for misses

**Cache Logic**:
1. Check for valid cached entry
2. Return hit or query database
3. Handle invalidation messages
4. Process database responses

#### `client.py` - Client Agent

```python
class Client(BaseAgent):
    def __init__(self, agent_id, sim, network, service_node):
        super().__init__(agent_id, sim)
        self.network = network
        self.service_node = service_node

    def send_read(self, key):
        message = Message(src=self, dst=self.service_node,
                         payload={"type": "READ", "key": key})
        self.network.send(message)

    def handle_message(self, message):
        payload = message.payload
        if payload["type"] == "READ_RESPONSE":
            print(f"Client {self.agent_id} received: "
                  f"{payload['key']} = {payload['value']} "
                  f"(v{payload['version']}) at time {self.sim.time}")
```

**Purpose**: Generates read/write requests and handles responses.

**Behavior**:
- Sends requests to service nodes
- Logs received responses
- Can be extended for request patterns

#### `database.py` - Database Agent

```python
class Database(BaseAgent):
    def __init__(self, agent_id, sim, network):
        super().__init__(agent_id, sim)
        self.network = network
        self.data = {}  # key -> (value, version)
        self.version_counter = 0
        self.service_nodes = []  # For invalidation broadcasts

    def handle_message(self, message):
        payload = message.payload

        if payload["type"] == "WRITE":
            self.handle_write(payload)
        elif payload["type"] == "READ_DB":
            self.handle_read_db(payload, message.src)

    def handle_write(self, payload):
        key, value = payload["key"], payload["value"]
        self.version_counter += 1
        self.data[key] = (value, self.version_counter)

        # Broadcast invalidation to all cache nodes
        for node in self.service_nodes:
            invalidate_msg = Message(
                src=self, dst=node,
                payload={"type": "INVALIDATE", "key": key,
                        "version": self.version_counter}
            )
            self.network.send(invalidate_msg)

    def handle_read_db(self, payload, requester):
        key = payload["key"]
        if key in self.data:
            value, version = self.data[key]
            response = Message(
                src=self, dst=requester,
                payload={"type": "READ_RESPONSE", "key": key,
                        "value": value, "version": version}
            )
            self.network.send(response)
```

**Purpose**: Acts as the authoritative data source.

**Key Operations**:
- Write operations with version increment
- Read operations for cache misses
- Invalidation broadcasting on writes

### `cache/` - Cache Data Structures

#### `cache_entry.py` - Cache Entry

```python
class CacheEntry:
    def __init__(self, key, value, version, ttl, created_at):
        self.key = key
        self.value = value
        self.version = version
        self.expiry = created_at + ttl
```

**Purpose**: Represents cached data with metadata.

**Fields**:
- `key`: Cache key
- `value`: Cached value
- `version`: Version for consistency
- `expiry`: Absolute expiration time

#### `lru_cache.py` - LRU Cache Implementation

```python
class LRUCache:
    def __init__(self, capacity):
        self.store = OrderedDict()  # key -> CacheEntry
        self.capacity = capacity

    def get(self, key):
        if key not in self.store:
            return None
        self.store.move_to_end(key)  # Mark as recently used
        return self.store[key]

    def put(self, key, value):
        self.store[key] = value
        self.store.move_to_end(key)
        if len(self.store) > self.capacity:
            self.store.popitem(last=False)  # Remove LRU item
```

**Purpose**: Efficient LRU cache with O(1) operations.

**Algorithm**:
- `OrderedDict` maintains access order
- `move_to_end()` marks recent access
- `popitem(last=False)` removes least recently used

### `messages/` - Communication Protocol

#### `message.py` - Base Message

```python
class Message:
    def __init__(self, src, dst, payload):
        self.src = src      # Source agent
        self.dst = dst      # Destination agent
        self.payload = payload  # Message data
```

**Purpose**: Standard message format for inter-agent communication.

#### `read_write.py` - Request Types

```python
class ReadMessage:
    def __init__(self, key):
        self.key = key

class WriteMessage:
    def __init__(self, key, value):
        self.key = key
        self.value = value
```

**Purpose**: Typed message classes for different operations.

## Simulation Flow Example

Let's trace through `experiments/simple_run.py`:

### Setup Phase
```python
sim = Simulation()
network = NetworkAgent(sim, latency_fn=lambda: 5)
db = Database("db", sim, network)
cache = LRUCache(capacity=10)
service_node = ServiceNode("node1", sim, cache, network, db)
client = Client("client1", sim, network, service_node)
db.service_nodes = [service_node]
```

### Event Scheduling
```python
# Schedule write at T=0
def write_to_db():
    message = Message(src=client, dst=db,
                     payload={"type": "WRITE", "key": "test_key", "value": "test_value"})
    network.send(message)

event1 = Event(time=0, callback=write_to_db)
sim.event_queue.push(event1)

# Schedule read at T=10
def read_from_client():
    client.send_read("test_key")

event2 = Event(time=10, callback=read_from_client)
sim.event_queue.push(event2)
```

### Execution Timeline

1. **T=0**: `write_to_db()` executes
   - Client sends WRITE message
   - Network delays by 5 units
   - Message arrives at DB at T=5

2. **T=5**: DB receives WRITE
   - Updates data with version 1
   - Sends INVALIDATE to service_node
   - Network delays by 5 units
   - Invalidation arrives at T=10

3. **T=10**: Service node receives INVALIDATE
   - Removes "test_key" from cache
   - Simultaneously, `read_from_client()` executes
   - Client sends READ message
   - Network delays by 5 units
   - Read arrives at service node at T=15

4. **T=15**: Service node receives READ
   - Cache miss (invalidated at T=10)
   - Sends READ_DB to database
   - Network delays by 5 units
   - Query arrives at DB at T=20

5. **T=20**: DB receives READ_DB
   - Returns data with version 1
   - Network delays by 5 units
   - Response arrives at service node at T=25

6. **T=25**: Service node receives READ_RESPONSE
   - Caches the data
   - Sends response to client
   - Network delays by 5 units
   - Client receives at T=30

## Performance Characteristics

- **Time Complexity**: O(log n) per event (heap operations)
- **Space Complexity**: O(n) for event queue, O(c) for cache capacity
- **Scalability**: Linear with number of agents and events
- **Accuracy**: Deterministic execution order with tie-breaking

## Extension Points

### Adding New Agent Types
1. Inherit from `BaseAgent`
2. Implement `handle_message()`
3. Register with simulation

### Adding New Message Types
1. Define payload structure
2. Update agent message handlers
3. Add to `messages/` module

### Custom Metrics
1. Add to `Simulation` class
2. Update agents to record metrics
3. Add analysis in `metrics/` module

## Testing Strategy

- **Unit Tests**: Individual agent behaviors
- **Integration Tests**: Multi-agent interactions
- **Performance Tests**: Large-scale simulations
- **Deterministic Verification**: Same inputs produce same outputs

This architecture provides a solid foundation for studying distributed caching systems, network effects, and agent-based modeling techniques.