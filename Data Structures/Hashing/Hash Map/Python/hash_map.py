"""
Hash Map Implementation

A Hash Map is similar to a Hash Table but typically provides
additional features like iteration and better integration
with language features.
"""

# Import HashTable from parent Hash Table folder
import sys
import os

# Get the path to Hash Table Python folder
current_dir = os.path.dirname(os.path.abspath(__file__))
# Go up: Hash Map/Python -> Hash Map -> Hashing -> Hash Table -> Python
hash_table_dir = os.path.join(
    os.path.dirname(os.path.dirname(current_dir)),  # Go to Hashing folder
    'Hash Table',
    'Python'
)

# Add to path if not already there
if hash_table_dir not in sys.path:
    sys.path.insert(0, hash_table_dir)

try:
    from hash_table import HashTable  # noqa: E402
except ImportError:
    raise ImportError(
        f"Could not import HashTable. Tried path: {hash_table_dir}. "
        "Please ensure Hash Table implementation exists."
    )


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
