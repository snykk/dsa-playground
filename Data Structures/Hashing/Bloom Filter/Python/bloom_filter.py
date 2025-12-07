"""
Bloom Filter Implementation

A Bloom Filter is a probabilistic data structure that tests
whether an element is a member of a set.
"""

import hashlib


class BloomFilter:
    """
    Bloom Filter - Probabilistic data structure for membership testing
    
    False positives are possible, but false negatives are not.
    """
    
    def __init__(self, capacity, error_rate=0.01):
        """
        Initialize Bloom Filter
        
        Args:
            capacity: Expected number of elements
            error_rate: Desired false positive rate (default: 0.01)
        """
        self.capacity = capacity
        self.error_rate = error_rate
        
        # Calculate optimal number of bits and hash functions
        import math
        self.num_bits = int(-capacity * math.log(error_rate) / (math.log(2) ** 2))
        self.num_hashes = int(self.num_bits * math.log(2) / capacity)
        
        # Initialize bit array
        self.bits = [False] * self.num_bits
    
    def _hash_functions(self, item):
        """
        Generate multiple hash values for an item
        
        Args:
            item: The item to hash
            
        Returns:
            List of hash values
        """
        item_str = str(item).encode('utf-8')
        hashes = []
        
        for i in range(self.num_hashes):
            # Use different hash functions by appending index
            hash_obj = hashlib.md5(item_str + str(i).encode('utf-8'))
            hash_value = int(hash_obj.hexdigest(), 16)
            hashes.append(hash_value % self.num_bits)
        
        return hashes
    
    def add(self, item):
        """
        Add an item to the Bloom Filter
        
        Args:
            item: The item to add
            
        Time Complexity: O(k) where k is number of hash functions
        """
        for hash_value in self._hash_functions(item):
            self.bits[hash_value] = True
    
    def contains(self, item):
        """
        Check if item might be in the Bloom Filter
        
        Args:
            item: The item to check
            
        Returns:
            True if item might be present (may be false positive)
            False if item is definitely not present
            
        Time Complexity: O(k) where k is number of hash functions
        """
        for hash_value in self._hash_functions(item):
            if not self.bits[hash_value]:
                return False
        return True
    
    def __contains__(self, item):
        """Support 'in' operator"""
        return self.contains(item)
    
    def get_stats(self):
        """
        Get statistics about the Bloom Filter
        
        Returns:
            Dictionary with statistics
        """
        set_bits = sum(1 for bit in self.bits if bit)
        return {
            'capacity': self.capacity,
            'num_bits': self.num_bits,
            'num_hashes': self.num_hashes,
            'set_bits': set_bits,
            'load': set_bits / self.num_bits
        }

