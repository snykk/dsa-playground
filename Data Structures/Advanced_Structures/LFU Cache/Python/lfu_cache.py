"""LFU (Least Frequently Used) Cache — O(1) get and put.

The structure:
    key_to_node  : dict[key] -> Node            (O(1) key lookup)
    freq_to_list : defaultdict[freq] -> ordered dict acting as DLL
                   (head = MRU, tail = LRU within this frequency bucket)
    min_freq     : the smallest frequency currently present

Every operation is O(1) because all work is either a dict lookup
or a move inside an OrderedDict (which is implemented as a DLL).
"""

from collections import OrderedDict, defaultdict


class LFUCache:
    def __init__(self, capacity: int):
        if capacity < 0:
            raise ValueError("capacity must be non-negative")
        self.capacity = capacity
        self.size = 0
        self.min_freq = 0
        # key -> (value, freq)
        self.key_to_val: dict = {}
        # freq -> OrderedDict[key -> value] preserving insertion order (MRU at tail)
        self.freq_to_keys: defaultdict = defaultdict(OrderedDict)

    def get(self, key: int) -> int:
        if self.capacity == 0 or key not in self.key_to_val:
            return -1
        self._promote(key)
        value, _ = self.key_to_val[key]
        return value

    def put(self, key: int, value: int) -> None:
        if self.capacity == 0:
            return

        if key in self.key_to_val:
            # Update value and promote frequency.
            _, freq = self.key_to_val[key]
            self.key_to_val[key] = (value, freq)
            self._promote(key)
            return

        # Evict if full.
        if self.size >= self.capacity:
            evict_key, _ = self.freq_to_keys[self.min_freq].popitem(last=False)
            del self.key_to_val[evict_key]
            self.size -= 1

        # Insert new entry with freq = 1.
        self.key_to_val[key] = (value, 1)
        self.freq_to_keys[1][key] = value
        self.min_freq = 1
        self.size += 1

    def _promote(self, key: int) -> None:
        """Move `key` from its current freq bucket to freq+1 bucket."""
        value, freq = self.key_to_val[key]
        # Remove from old bucket.
        del self.freq_to_keys[freq][key]
        if not self.freq_to_keys[freq]:
            del self.freq_to_keys[freq]
            if self.min_freq == freq:
                self.min_freq = freq + 1
        # Insert into new bucket (at tail = MRU).
        self.freq_to_keys[freq + 1][key] = value
        self.key_to_val[key] = (value, freq + 1)
