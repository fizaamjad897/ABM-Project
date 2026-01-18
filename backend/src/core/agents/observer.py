from agents.base import BaseAgent

class ObserverAgent(BaseAgent):
    """
    Special agent that listens to all message traffic to collect statistics.
    In a real system, this would be a monitoring service like Prometheus.
    """
    def __init__(self, agent_id, sim):
        super().__init__(agent_id, sim)
        self.metrics = {
            "total_reads": 0,
            "hits": 0,
            "misses": 0,
            "latencies": [],
        }

    async def report_event(self, event_type, details):
        """
        Record a simulation event (e.g., cache hit, miss, node failure).
        """
        self.metrics[event_type] = self.metrics.get(event_type, 0) + 1
        # Debug logging
        hits = self.metrics.get("hits", 0)
        misses = self.metrics.get("misses", 0)
        if (hits + misses) % 10 == 1:  # Log every 10 events
            print(f"[Observer] Event: {event_type} | Total - Hits: {hits}, Misses: {misses}")
        
        # Add timestamped log entry
        log_entry = {
            "time": round(self.sim.time, 2),
            "type": event_type,
            "details": details
        }
        self.metrics["recent_logs"] = [log_entry] + self.metrics.get("recent_logs", [])[:20]
        
        # Also track agent specific stats
        if "node" in details:
            node_id = details["node"]
            if "agent_stats" not in self.metrics:
                self.metrics["agent_stats"] = {}
            if node_id not in self.metrics["agent_stats"]:
                self.metrics["agent_stats"][node_id] = {"hits": 0, "misses": 0}
            
            if event_type == "CACHE_HIT":
                self.metrics["agent_stats"][node_id]["hits"] += 1
            elif event_type == "CACHE_MISS":
                self.metrics["agent_stats"][node_id]["misses"] += 1
        
        if event_type == "CACHE_HIT":
            self.metrics["hits"] += 1
            self.metrics["total_reads"] += 1
        elif event_type == "CACHE_MISS":
            self.metrics["misses"] += 1
            self.metrics["total_reads"] += 1

    def handle_message(self, message):
        # The observer basically just watches, it doesn't respond
        pass
