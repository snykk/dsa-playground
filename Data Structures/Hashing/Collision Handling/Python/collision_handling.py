"""
Collision Handling Implementation

Demonstrates two main collision handling techniques:
1. Chaining - Store colliding elements in a linked list
2. Open Addressing - Find next available slot using probing
"""


class HashTableChaining:
    """
    Hash Table with Chaining collision handling
    
    Each bucket contains a list of key-value pairs.
    Collisions are handled by storing multiple pairs in the same bucket.
    """
    
    def __init__(self, capacity=16):
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]
    
    def _hash(self, key):
        """Hash function"""
        if isinstance(key, int):
            return key % self.capacity
        elif isinstance(key, str):
            hash_value = 0
            for char in key:
                hash_value = (hash_value * 31 + ord(char)) % self.capacity
            return hash_value
        else:
            return hash(key) % self.capacity
    
    def put(self, key, value):
        """Insert or update key-value pair"""
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        
        bucket.append((key, value))
        self.size += 1
    
    def get(self, key):
        """Get value for key"""
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for k, v in bucket:
            if k == key:
                return v
        return None
    
    def remove(self, key):
        """Remove key-value pair"""
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.size -= 1
                return True
        return False


class _OpenAddressing:
    """
    Shared code of the open-addressing tables: every key has a probe
    sequence of slot indices, and a removed key leaves a tombstone (DELETED)
    so that lookups keep walking past it.

    Subclasses define _step(i), the offset of the i-th probe from the home slot.
    """

    DELETED = object()  # Marker for deleted entries (tombstone)

    def __init__(self, capacity=16):
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self.capacity = capacity
        self.size = 0
        self.buckets = [None] * capacity

    def _hash(self, key):
        """Hash function"""
        if isinstance(key, int):
            return key % self.capacity
        elif isinstance(key, str):
            hash_value = 0
            for char in key:
                hash_value = (hash_value * 31 + ord(char)) % self.capacity
            return hash_value
        else:
            return hash(key) % self.capacity

    def _step(self, i):
        raise NotImplementedError

    def _probe(self, key):
        """
        Walk the probe sequence of key.

        Returns (found, free): found is the slot holding key (or None), and
        free is the slot to insert into (the first tombstone if there was one,
        otherwise the empty slot that ended the walk), or None if the table
        has no free slot on this sequence.
        """
        start = self._hash(key)
        free = None
        for i in range(self.capacity):
            index = (start + self._step(i)) % self.capacity
            slot = self.buckets[index]
            if slot is None:
                return None, (index if free is None else free)
            if slot is self.DELETED:
                if free is None:
                    free = index
            elif slot[0] == key:
                return index, free
        return None, free

    def put(self, key, value):
        """Insert or update key-value pair"""
        found, free = self._probe(key)
        if found is not None:
            self.buckets[found] = (key, value)
            return
        if free is None:
            raise Exception("Hash table is full")
        self.buckets[free] = (key, value)
        self.size += 1

    def get(self, key):
        """Get value for key"""
        found, _ = self._probe(key)
        if found is None:
            return None
        return self.buckets[found][1]

    def remove(self, key):
        """Remove key-value pair (leaves a tombstone)"""
        found, _ = self._probe(key)
        if found is None:
            return False
        self.buckets[found] = self.DELETED
        self.size -= 1
        return True


class HashTableOpenAddressing(_OpenAddressing):
    """
    Hash Table with Open Addressing collision handling

    Uses linear probing: slot (hash + i) mod capacity for i = 0, 1, 2, ...
    """

    def _step(self, i):
        return i


class HashTableQuadraticProbing(_OpenAddressing):
    """
    Hash Table with Quadratic Probing

    Uses triangular-number steps i*(i+1)/2: slot (hash + i*(i+1)/2) mod
    capacity. For a power-of-two capacity (the default 16) this visits every
    slot, whereas the plain i*i steps reach only a few of them.
    """

    def _step(self, i):
        return i * (i + 1) // 2
