import heapq
import itertools

class Event:
    def __init__(self, time, callback, payload=None):
        self.time = time
        self.callback = callback
        self.payload = payload
        self.id = next(Event._ids)

    _ids = itertools.count()

    def __lt__(self, other):
        return (self.time, self.id) < (other.time, other.id)


class EventQueue:
    def __init__(self):
        self.queue = []

    def push(self, event: Event):
        heapq.heappush(self.queue, event)

    def pop(self):
        return heapq.heappop(self.queue)

    def empty(self):
        return len(self.queue) == 0