"""
Hash Table Implementation

A Hash Table is a data structure that implements an associative array,
mapping keys to values using a hash function.
"""


class HashTable:
    """
    Hash Table - Basic hash table implementation with chaining
    
    Uses a simple hash function and handles collisions using chaining
    (linked lists at each bucket).
    """
    
    def __init__(self, capacity=16):
        """
        Initialize hash table with given capacity
        
        Args:
            capacity: Initial capacity of the hash table (default: 16)
        """
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]
        self.load_factor_threshold = 0.75
    
    def _hash(self, key):
        """
        Hash function to map key to bucket index
        
        Args:
            key: The key to hash
            
        Returns:
            Bucket index for the key
        """
        if isinstance(key, int):
            return key % self.capacity
        elif isinstance(key, str):
            # Simple string hashing
            hash_value = 0
            for char in key:
                hash_value = (hash_value * 31 + ord(char)) % self.capacity
            return hash_value
        else:
            # Use built-in hash for other types
            return hash(key) % self.capacity
    
    def _resize(self):
        """Resize the hash table when load factor exceeds threshold"""
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        
        # Rehash all existing key-value pairs
        for bucket in old_buckets:
            for key, value in bucket:
                self.put(key, value)
    
    def put(self, key, value):
        """
        Insert or update a key-value pair
        
        Args:
            key: The key
            value: The value to store
            
        Time Complexity: O(1) average, O(n) worst case
        """
        index = self._hash(key)
        bucket = self.buckets[index]
        
        # Check if key already exists
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)  # Update existing
                return
        
        # Add new key-value pair
        bucket.append((key, value))
        self.size += 1
        
        # Check if resize is needed
        if self.size / self.capacity > self.load_factor_threshold:
            self._resize()
    
    def get(self, key, default=None):
        """
        Get value for a key
        
        Args:
            key: The key to search for
            default: Default value if key not found
            
        Returns:
            Value associated with key, or default if not found
            
        Time Complexity: O(1) average, O(n) worst case
        """
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for k, v in bucket:
            if k == key:
                return v
        
        return default
    
    def remove(self, key):
        """
        Remove a key-value pair
        
        Args:
            key: The key to remove
            
        Returns:
            True if key was removed, False if not found
            
        Time Complexity: O(1) average, O(n) worst case
        """
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.size -= 1
                return True
        
        return False
    
    def contains(self, key):
        """
        Check if key exists in hash table
        
        Args:
            key: The key to check
            
        Returns:
            True if key exists, False otherwise
            
        Time Complexity: O(1) average, O(n) worst case
        """
        return self.get(key) is not None
    
    def keys(self):
        """
        Get all keys in the hash table
        
        Returns:
            List of all keys
            
        Time Complexity: O(n)
        """
        result = []
        for bucket in self.buckets:
            for key, value in bucket:
                result.append(key)
        return result
    
    def values(self):
        """
        Get all values in the hash table
        
        Returns:
            List of all values
            
        Time Complexity: O(n)
        """
        result = []
        for bucket in self.buckets:
            for key, value in bucket:
                result.append(value)
        return result
    
    def items(self):
        """
        Get all key-value pairs in the hash table
        
        Returns:
            List of (key, value) tuples
            
        Time Complexity: O(n)
        """
        result = []
        for bucket in self.buckets:
            result.extend(bucket)
        return result
    
    def clear(self):
        """Clear all entries from the hash table"""
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
    
    def is_empty(self):
        """Check if hash table is empty"""
        return self.size == 0
    
    def __len__(self):
        """Return the number of key-value pairs"""
        return self.size
    
    def __contains__(self, key):
        """Support 'in' operator"""
        return self.contains(key)
    
    def __getitem__(self, key):
        """Support dictionary-style access"""
        value = self.get(key)
        if value is None:
            raise KeyError(f"Key '{key}' not found")
        return value
    
    def __setitem__(self, key, value):
        """Support dictionary-style assignment"""
        self.put(key, value)
    
    def __delitem__(self, key):
        """Support 'del' operator"""
        if not self.remove(key):
            raise KeyError(f"Key '{key}' not found")

