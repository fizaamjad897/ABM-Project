from agents.base import BaseAgent
from messages.message import Message

class LoadBalancerAgent(BaseAgent):
    """
    An agent that distributes requests across multiple cache nodes.
    Uses consistent hashing so same keys always go to same node (enables cache hits).
    """
    def __init__(self, agent_id, sim, nodes, network):
        super().__init__(agent_id, sim)
        self.nodes = nodes
        self.network = network

    async def handle_message(self, message):
        payload = message.payload
        if payload["type"] == "READ":
            # Consistent hashing: same key always goes to same node
            key = payload.get("key", "")
            key_hash = hash(key) % len(self.nodes)
            
            # Skip dead nodes - find next available
            attempts = 0
            while attempts < len(self.nodes):
                target = self.nodes[(key_hash + attempts) % len(self.nodes)]
                if getattr(target, 'active', True):
                    break
                attempts += 1
            else:
                # All nodes dead, pick any
                target = self.nodes[key_hash % len(self.nodes)]
            
            # Forward the message
            forwarded = Message(src=message.src, dst=target, payload=payload)
            self.network.send(forwarded)

