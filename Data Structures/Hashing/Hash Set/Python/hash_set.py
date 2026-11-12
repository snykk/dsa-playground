"""
Hash Set Implementation

A Hash Set is a data structure that stores unique elements
using a hash table internally (only keys, no values).
"""


class HashSet:
    """
    Hash Set - Stores unique elements using hash table
    
    Uses a hash table internally but only stores keys (no values).
    """
    
    def __init__(self, capacity=16):
        """Initialize hash set with given capacity (must be positive)"""
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]
        self.load_factor_threshold = 0.75
    
    def _hash(self, key):
        """Hash function to map key to bucket index"""
        if isinstance(key, int):
            return key % self.capacity
        elif isinstance(key, str):
            hash_value = 0
            for char in key:
                hash_value = (hash_value * 31 + ord(char)) % self.capacity
            return hash_value
        else:
            return hash(key) % self.capacity
    
    def _resize(self):
        """Resize the hash set when load factor exceeds threshold"""
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        
        for bucket in old_buckets:
            for key in bucket:
                self.add(key)
    
    def add(self, key):
        """
        Add an element to the set
        
        Args:
            key: The element to add
            
        Returns:
            True if element was added, False if already exists
        """
        index = self._hash(key)
        bucket = self.buckets[index]
        
        if key in bucket:
            return False
        
        bucket.append(key)
        self.size += 1
        
        if self.size / self.capacity > self.load_factor_threshold:
            self._resize()
        
        return True
    
    def remove(self, key):
        """
        Remove an element from the set
        
        Args:
            key: The element to remove
            
        Returns:
            True if element was removed, False if not found
        """
        index = self._hash(key)
        bucket = self.buckets[index]
        
        try:
            bucket.remove(key)
            self.size -= 1
            return True
        except ValueError:
            return False
    
    def contains(self, key):
        """Check if element exists in set"""
        index = self._hash(key)
        return key in self.buckets[index]
    
    def clear(self):
        """Clear all elements from the set"""
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
    
    def is_empty(self):
        """Check if set is empty"""
        return self.size == 0
    
    def to_list(self):
        """Convert set to list"""
        result = []
        for bucket in self.buckets:
            result.extend(bucket)
        return result
    
    def __len__(self):
        """Return the number of elements"""
        return self.size
    
    def __contains__(self, key):
        """Support 'in' operator"""
        return self.contains(key)
    
    def __iter__(self):
        """Make set iterable"""
        for bucket in self.buckets:
            for key in bucket:
                yield key
    
    def __repr__(self):
        """String representation"""
        items = [repr(key) for key in self]
        return "{" + ", ".join(items) + "}"

