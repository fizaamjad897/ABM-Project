import asyncio
import json
import random
from typing import Dict, Any, List
from engine.simulation import Simulation
from agents.service_node import ServiceNode
from agents.byzantine import ByzantineServiceNode
from agents.observer import ObserverAgent
from agents.chaos_monkey import ChaosMonkeyAgent
from agents.load_balancer import LoadBalancerAgent
from agents.client import Client
from agents.database import Database
from agents.network import NetworkAgent
from cache.lru_cache import LRUCache
from messages.message import Message

class SimulationManager:
    def __init__(self, websocket_manager):
        self.websocket_manager = websocket_manager
        self.sim = None
        self.running = False
        self.observer = None

    async def run_simulation(self, config: Dict[str, Any]):
        try:
            self.running = True
            self.sim = Simulation()
            
            # 1. Setup Observer for telemetry
            self.observer = ObserverAgent("observer", self.sim)
            
            # 2. Setup Core Infrastructure
            network = NetworkAgent(self.sim, latency_fn=lambda: random.uniform(1, 5))
            db = Database("db1", self.sim, network)
            # Seed DB with some initial data
            for i in range(1, 11):
                db.data[f"key_{i}"] = (f"value_{i}", 1)
            
            # 3. Setup Cache Nodes
            cache_nodes = []
            num_nodes = config.get("nodes", 3)
            for i in range(num_nodes):
                node_id = f"node_{i}"
                node_cache = LRUCache(capacity=config.get("cache_size", 100))
                node = ServiceNode(node_id, self.sim, node_cache, network, db, observer=self.observer)
                cache_nodes.append(node)
            
            # Register service nodes with database for invalidation broadcasts
            db.service_nodes = cache_nodes
            print(f"[Simulation] Initialized {num_nodes} cache nodes, database seeded with 10 keys")
                
            # 4. Setup Load Balancer (Topology Complexity)
            lb = LoadBalancerAgent("lb1", self.sim, cache_nodes, network)
            print(f"[Simulation] Load balancer initialized")
                
            # 5. Setup Clients (Talk to LB instead of direct nodes)
            # Pass max_time to client so it stops generating events at end of simulation
            total_time = config.get("duration", 1000)
            client = Client("client1", self.sim, network, [lb], max_time=total_time)
            print(f"[Simulation] Client initialized, will generate read requests until time {total_time}")
            
            # 6. Setup Chaos Monkey for fault injection
            if config.get("chaos_enabled", True):
                chaos = ChaosMonkeyAgent("chaos_monkey", self.sim, cache_nodes, kill_prob=0.1)
                print(f"[Simulation] Chaos Monkey enabled")
            
            # 7. Execution Loop with real-time streaming
            chunk_size = 20
            
            print(f"[Simulation] Starting execution loop (duration={total_time}, chunk_size={chunk_size})")
            print(f"[Simulation] Initial event queue size: {len(self.sim.event_queue.queue)}")
            
            # DEBUG: Print first few events
            if self.sim.event_queue.queue:
                print(f"[Simulation] Next event scheduled at time: {self.sim.event_queue.queue[0].time:.2f}")
            
            # Process simulation in chunks until we reach total_time or are stopped
            target_end_time = self.sim.time + total_time
            last_broadcast_time = -1  # Changed to -1 to ensure first broadcast
            iteration_count = 0
            last_log_count = 0  # Track how many logs we've already sent
            
            while self.sim.time < target_end_time:
                if not self.running:
                    print(f"[Simulation] Stopped by user at time {self.sim.time:.1f}")
                    break
                
                iteration_count += 1
                
                # Calculate next chunk end time
                next_chunk_time = min(self.sim.time + chunk_size, target_end_time)
                
                # Run simulation until next chunk time
                try:
                    await self.sim.run(until_time=next_chunk_time)
                except Exception as e:
                    print(f"[Simulation] ERROR in sim.run: {e}")
                    import traceback
                    traceback.print_exc()
                
                # Broadcast state/metrics to UI with progress every iteration
                progress = min(100, (self.sim.time / target_end_time) * 100)
                hits = self.observer.metrics.get("hits", 0)
                misses = self.observer.metrics.get("misses", 0)
                
                status = {
                    "type": "SIM_UPDATE",
                    "time": self.sim.time,
                    "progress": progress,
                    "metrics": self.observer.metrics,
                    "agent_states": {node.agent_id: getattr(node, "active", True) for node in cache_nodes}
                }
                
                try:
                    await self.websocket_manager.broadcast(json.dumps(status))
                    if iteration_count <= 3 or iteration_count % 10 == 0:
                        print(f"[Simulation] Broadcast #{iteration_count}: time={self.sim.time:.1f}, progress={progress:.1f}%")
                    
                    # Broadcast individual LOG messages for the frontend log panel
                    recent_logs = self.observer.metrics.get("recent_logs", [])
                    new_logs = recent_logs[:len(recent_logs) - last_log_count] if len(recent_logs) > last_log_count else []
                    for log in reversed(new_logs[:10]):  # Send up to 10 new logs, oldest first
                        details = log.get("details", {})
                        log_msg = {
                            "type": "LOG",
                            "time": log["time"],
                            "log_type": log["type"],
                            "msg": f"{details.get('key', 'N/A')} on {details.get('node', 'N/A')}"
                        }
                        await self.websocket_manager.broadcast(json.dumps(log_msg))
                    last_log_count = len(recent_logs)
                    
                except Exception as e:
                    print(f"[Simulation] ERROR broadcasting: {e}")
                
                last_broadcast_time = self.sim.time
                
                # Log progress
                if int(self.sim.time) % 100 == 0 or hits + misses > 0:
                    ratio = (hits / (hits + misses) * 100) if (hits + misses) > 0 else 0
                    queue_size = len(self.sim.event_queue.queue)
                    print(f"[Simulation] Time={self.sim.time:.1f}/{target_end_time:.1f} ({progress:.1f}%), Hits={hits}, Misses={misses}, Ratio={ratio:.1f}%, Queue={queue_size}")
                
                # If we've reached the end, break
                if self.sim.time >= target_end_time:
                    break
                
                # Small delay to prevent tight loop when queue is empty
                await asyncio.sleep(0.05)

            self.running = False
            final_hits = self.observer.metrics.get("hits", 0)
            final_misses = self.observer.metrics.get("misses", 0)
            final_ratio = (final_hits / (final_hits + final_misses) * 100) if (final_hits + final_misses) > 0 else 0
            print(f"[Simulation] Finished at time {self.sim.time:.1f}. Final stats: Hits={final_hits}, Misses={final_misses}, Hit Ratio={final_ratio:.1f}%")
            await self.websocket_manager.broadcast(json.dumps({
                "type": "SIM_FINISHED", 
                "final_metrics": self.observer.metrics,
                "final_time": self.sim.time
            }))
        except Exception as e:
            print(f"[Simulation] CRITICAL ERROR: {e}")
            import traceback
            traceback.print_exc()
            self.running = False

    def stop(self):
        self.running = False
