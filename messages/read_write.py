class ReadMessage:
    def __init__(self, key):
        self.key = key

class WriteMessage:
    def __init__(self, key, value):
        self.key = key
        self.value = value