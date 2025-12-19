class CacheEntry:
    def __init__(self, key, value, version, ttl, created_at):
        self.key = key
        self.value = value
        self.version = version
        self.expiry = created_at + ttl