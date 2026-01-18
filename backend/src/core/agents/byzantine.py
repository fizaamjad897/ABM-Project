from agents.service_node import ServiceNode
import random

class ByzantineServiceNode(ServiceNode):
    """
    An agent that can act maliciously by returning wrong data or ignoring requests.
    Used for testing system resilience.
    """
    def __init__(self, agent_id, sim, cache, network, db, malicious_prob=0.2):
        super().__init__(agent_id, sim, cache, network, db)
        self.malicious_prob = malicious_prob

    def handle_read(self, payload, requester):
        if random.random() < self.malicious_prob:
            # Act maliciously: Return wrong data
            from messages.message import Message
            response = Message(
                src=self, 
                dst=requester, 
                payload={
                    "type": "READ_RESPONSE", 
                    "key": payload["key"], 
                    "value": "CORRUPTED_DATA_BYZANTINE", 
                    "version": -1
                }
            )
            self.network.send(response)
        else:
            # Act normally
            super().handle_read(payload, requester)
