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


class HashTableOpenAddressing:
    """
    Hash Table with Open Addressing collision handling
    
    Uses linear probing to find next available slot.
    """
    
    DELETED = object()  # Marker for deleted entries
    
    def __init__(self, capacity=16):
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
    
    def _probe(self, start_index, key):
        """Linear probing to find next available slot"""
        index = start_index
        attempts = 0
        
        while attempts < self.capacity:
            if self.buckets[index] is None or self.buckets[index] == self.DELETED:
                return index
            if self.buckets[index][0] == key:
                return index
            index = (index + 1) % self.capacity
            attempts += 1
        
        return None  # Table is full
    
    def put(self, key, value):
        """Insert or update key-value pair"""
        index = self._hash(key)
        slot = self._probe(index, key)
        
        if slot is None:
            raise Exception("Hash table is full")
        
        if self.buckets[slot] is None or self.buckets[slot] == self.DELETED:
            self.size += 1
        
        self.buckets[slot] = (key, value)
    
    def get(self, key):
        """Get value for key"""
        index = self._hash(key)
        attempts = 0
        
        while attempts < self.capacity:
            if self.buckets[index] is None:
                return None
            if self.buckets[index] != self.DELETED and self.buckets[index][0] == key:
                return self.buckets[index][1]
            index = (index + 1) % self.capacity
            attempts += 1
        
        return None
    
    def remove(self, key):
        """Remove key-value pair"""
        index = self._hash(key)
        attempts = 0
        
        while attempts < self.capacity:
            if self.buckets[index] is None:
                return False
            if self.buckets[index] != self.DELETED and self.buckets[index][0] == key:
                self.buckets[index] = self.DELETED
                self.size -= 1
                return True
            index = (index + 1) % self.capacity
            attempts += 1
        
        return False


class HashTableQuadraticProbing:
    """
    Hash Table with Quadratic Probing
    
    Uses quadratic probing instead of linear probing
    """
    
    DELETED = object()
    
    def __init__(self, capacity=16):
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
    
    def _probe(self, start_index, key):
        """Quadratic probing"""
        index = start_index
        i = 0
        
        while i < self.capacity:
            if self.buckets[index] is None or self.buckets[index] == self.DELETED:
                return index
            if self.buckets[index][0] == key:
                return index
            i += 1
            index = (start_index + i * i) % self.capacity
        
        return None
    
    def put(self, key, value):
        """Insert or update"""
        index = self._hash(key)
        slot = self._probe(index, key)
        
        if slot is None:
            raise Exception("Hash table is full")
        
        if self.buckets[slot] is None or self.buckets[slot] == self.DELETED:
            self.size += 1
        
        self.buckets[slot] = (key, value)
    
    def get(self, key):
        """Get value"""
        index = self._hash(key)
        i = 0
        
        while i < self.capacity:
            if self.buckets[index] is None:
                return None
            if self.buckets[index] != self.DELETED and self.buckets[index][0] == key:
                return self.buckets[index][1]
            i += 1
            index = (self._hash(key) + i * i) % self.capacity
        
        return None

