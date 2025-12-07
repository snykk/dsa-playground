"""
Hash Map Implementation

A Hash Map is similar to a Hash Table but typically provides
additional features like iteration and better integration
with language features.
"""

"""
Hash Map Implementation

A Hash Map is similar to a Hash Table but typically provides
additional features like iteration and better integration
with language features.
"""

# Import HashTable - adjust path as needed
try:
    from hash_table import HashTable
except ImportError:
    # If direct import fails, try relative import
    import sys
    import os
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, os.path.join(parent_dir, 'Hash Table', 'Python'))
    from hash_table import HashTable


class HashMap(HashTable):
    """
    Hash Map - Extended hash table with additional features
    
    Inherits from HashTable and adds iterator support
    and additional convenience methods.
    """
    
    def __iter__(self):
        """Make HashMap iterable"""
        return iter(self.items())
    
    def __repr__(self):
        """String representation"""
        items = []
        for key, value in self.items():
            items.append(f"{key!r}: {value!r}")
        return "{" + ", ".join(items) + "}"
    
    def get_or_default(self, key, default):
        """
        Get value or return default if key doesn't exist
        
        Args:
            key: The key to search for
            default: Default value to return if key not found
            
        Returns:
            Value associated with key, or default
        """
        return self.get(key, default)
    
    def put_if_absent(self, key, value):
        """
        Put value only if key doesn't exist
        
        Args:
            key: The key
            value: The value to store
            
        Returns:
            True if value was inserted, False if key already exists
        """
        if not self.contains(key):
            self.put(key, value)
            return True
        return False
    
    def update(self, other):
        """
        Update this map with key-value pairs from another map/dict
        
        Args:
            other: Dictionary or HashMap to copy from
        """
        if isinstance(other, dict):
            for key, value in other.items():
                self.put(key, value)
        elif isinstance(other, HashMap):
            for key, value in other.items():
                self.put(key, value)
    
    def copy(self):
        """Create a copy of this HashMap"""
        new_map = HashMap(self.capacity)
        for key, value in self.items():
            new_map.put(key, value)
        return new_map

