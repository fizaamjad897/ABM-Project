from agents.base import BaseAgent
from cache.cache_entry import CacheEntry
from messages.message import Message

class ServiceNode(BaseAgent):
    def __init__(self, agent_id, sim, cache, network, db):
        super().__init__(agent_id, sim)
        self.cache = cache
        self.network = network
        self.db = db
        self.pending_requests = {}

    def handle_message(self, message):
        payload = message.payload

        if payload["type"] == "READ":
            self.handle_read(payload, message.src)

        elif payload["type"] == "INVALIDATE":
            self.cache.store.pop(payload["key"], None)

        elif payload["type"] == "READ_RESPONSE":
            # Response from DB
            key = payload["key"]
            value = payload["value"]
            version = payload["version"]
            ttl = 100  # example TTL
            entry = CacheEntry(key, value, version, ttl, self.sim.time)
            self.cache.put(key, entry)
            if key in self.pending_requests:
                requester = self.pending_requests.pop(key)
                response = Message(src=self, dst=requester, payload={"type": "READ_RESPONSE", "key": key, "value": value, "version": version})
                self.network.send(response)

    def handle_read(self, payload, requester):
        key = payload["key"]
        entry = self.cache.get(key)
        if entry and entry.expiry > self.sim.time:
            # Cache hit
            response = Message(src=self, dst=requester, payload={"type": "READ_RESPONSE", "key": key, "value": entry.value, "version": entry.version})
            self.network.send(response)
        else:
            # Cache miss, read from DB
            self.pending_requests[key] = requester
            message = Message(src=self, dst=self.db, payload={"type": "READ_DB", "key": key})
            self.network.send(message)