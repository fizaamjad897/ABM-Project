from agents.base import BaseAgent
from cache.cache_entry import CacheEntry
from messages.message import Message

class ServiceNode(BaseAgent):
    def __init__(self, agent_id, sim, cache, network, db, observer=None):
        super().__init__(agent_id, sim)
        self.cache = cache
        self.network = network
        self.db = db
        self.observer = observer
        self.pending_requests = {}
        self.active = True

    async def handle_message(self, message):
        if not getattr(self, "active", True):
            return

        payload = message.payload
        if payload["type"] == "READ":
            await self.handle_read(payload, message.src)

        elif payload["type"] == "INVALIDATE":
            self.cache.store.pop(payload["key"], None)

        elif payload["type"] == "READ_RESPONSE":
            # Response from DB
            key = payload["key"]
            value = payload["value"]
            version = payload["version"]
            ttl = 500  # Longer TTL for better hit ratio
            entry = CacheEntry(key, value, version, ttl, self.sim.time)
            self.cache.put(key, entry)
            print(f"[{self.agent_id}] Cached {key} from DB response (expiry: {entry.expiry:.2f}) - cache size: {len(self.cache.store)}")
            if key in self.pending_requests:
                requester = self.pending_requests.pop(key)
                response = Message(src=self, dst=requester, payload={"type": "READ_RESPONSE", "key": key, "value": value, "version": version})
                self.network.send(response)

    async def handle_read(self, payload, requester):
        key = payload["key"]
        entry = self.cache.get(key)
        if entry and entry.expiry > self.sim.time:
            # Cache hit
            print(f"[{self.agent_id}] CACHE HIT for {key} (expiry: {entry.expiry:.2f}, current time: {self.sim.time:.2f})")
            if self.observer:
                await self.observer.report_event("CACHE_HIT", {"node": self.agent_id, "key": key})
            # Use module-level Message import (don't re-import here!)
            response = Message(src=self, dst=requester, payload={"type": "READ_RESPONSE", "key": key, "value": entry.value, "version": entry.version})
            self.network.send(response)
        else:
            # Cache miss, read from DB
            reason = "not in cache" if not entry else f"expired (expiry: {entry.expiry:.2f}, time: {self.sim.time:.2f})"
            print(f"[{self.agent_id}] CACHE MISS for {key} - {reason}")
            if self.observer:
                await self.observer.report_event("CACHE_MISS", {"node": self.agent_id, "key": key})
            self.pending_requests[key] = requester
            db_request = Message(src=self, dst=self.db, payload={"type": "READ_DB", "key": key})
            self.network.send(db_request)