import random
from agents.base import BaseAgent
from messages.message import Message

class Client(BaseAgent):
    def __init__(self, agent_id, sim, network, service_node, max_time=None):
        super().__init__(agent_id, sim)
        self.network = network
        self.service_node = service_node
        self.max_time = max_time  # Stop generating reads after this time
        # Schedule first read immediately or very soon
        self.schedule_immediate_read()
        self.schedule_next_read()
    
    def schedule_immediate_read(self):
        """Schedule first read immediately to kickstart the simulation"""
        from engine.event import Event
        # Use generate_random_read which handles the full flow
        event = Event(time=self.sim.time + 0.1, callback=self.generate_random_read)
        self.sim.event_queue.push(event)

    def schedule_next_read(self):
        # Schedule the next read event at a random interval (shorter for more activity)
        interval = random.uniform(5, 25)  # Reduced from 10-50 to generate more events
        next_time = self.sim.time + interval
        
        # Don't schedule if we've exceeded max_time
        if self.max_time and next_time > self.max_time:
            return
            
        from engine.event import Event
        event = Event(time=next_time, callback=self.generate_random_read)
        self.sim.event_queue.push(event)

    def generate_random_read(self):
        # Don't generate if we've exceeded max_time
        if self.max_time and self.sim.time > self.max_time:
            return
            
        key = f"key_{random.randint(1, 10)}" # Small set of keys for hits
        print(f"[Client] Generating read request for {key} at time {self.sim.time:.2f}")
        self.send_read(key)
        self.schedule_next_read()

    def send_read(self, key):
        # Support both single node and list/load balancer
        target = self.service_node[0] if isinstance(self.service_node, list) else self.service_node
        message = Message(src=self, dst=target, payload={"type": "READ", "key": key})
        self.network.send(message)

    async def handle_message(self, message):
        pass # Client just prints or logs, handled by observer