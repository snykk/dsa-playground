"""
Bloom Filter Implementation

A Bloom Filter is a probabilistic data structure that tests
whether an element is a member of a set.
"""

import hashlib
import math


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

        Raises:
            ValueError: If capacity is not positive or error_rate is not in (0, 1).
        """
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        if not 0 < error_rate < 1:
            raise ValueError("error_rate must be strictly between 0 and 1")
        self.capacity = capacity
        self.error_rate = error_rate
        
        # Calculate optimal number of bits and hash functions
        # (round the bits up and keep at least one hash, so a tiny filter still
        # rejects non-members instead of answering True for everything)
        self.num_bits = math.ceil(-capacity * math.log(error_rate) / (math.log(2) ** 2))
        self.num_hashes = max(1, round(self.num_bits * math.log(2) / capacity))
        
        # Initialize bit array (one byte per bit)
        self.bits = bytearray(self.num_bits)
    
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
            self.bits[hash_value] = 1
    
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

