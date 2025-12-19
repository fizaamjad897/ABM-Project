from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.store = OrderedDict()
        self.capacity = capacity

    def get(self, key):
        if key not in self.store:
            return None
        self.store.move_to_end(key)
        return self.store[key]

    def put(self, key, value):
        self.store[key] = value
        self.store.move_to_end(key)
        if len(self.store) > self.capacity:
            self.store.popitem(last=False)