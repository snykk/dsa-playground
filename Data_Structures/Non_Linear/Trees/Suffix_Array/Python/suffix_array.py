class SuffixArray:
    """Suffix Array implementation.
    
    A Suffix Array is a sorted array of all suffixes of a string.
    It's a simpler alternative to Suffix Tree with similar functionality.
    """
    
    def __init__(self, text):
        """Initialize suffix array with text.
        
        Args:
            text: The input string
        """
        self.text = text
        self.n = len(text)
        self.suffix_array = self._build_suffix_array()
    
    def _build_suffix_array(self):
        """Build suffix array by sorting all suffixes.
        
        Returns:
            List of indices representing sorted suffixes
        """
        # Create list of (suffix, index) pairs
        suffixes = [(self.text[i:], i) for i in range(self.n)]
        # Sort by suffix string
        suffixes.sort(key=lambda x: x[0])
        # Return sorted indices
        return [suffix[1] for suffix in suffixes]
    
    def search(self, pattern):
        """Search for pattern in text using binary search.
        
        Args:
            pattern: The pattern to search for
            
        Returns:
            List of starting indices where pattern is found
        """
        left = 0
        right = self.n - 1
        first_occurrence = -1
        
        # Binary search for first occurrence
        while left <= right:
            mid = (left + right) // 2
            suffix_index = self.suffix_array[mid]
            suffix = self.text[suffix_index:]
            
            if suffix.startswith(pattern):
                first_occurrence = mid
                right = mid - 1
            elif suffix < pattern:
                left = mid + 1
            else:
                right = mid - 1
        
        if first_occurrence == -1:
            return []
        
        # Find last occurrence
        left = first_occurrence
        right = self.n - 1
        last_occurrence = first_occurrence
        
        while left <= right:
            mid = (left + right) // 2
            suffix_index = self.suffix_array[mid]
            suffix = self.text[suffix_index:]
            
            if suffix.startswith(pattern):
                last_occurrence = mid
                left = mid + 1
            else:
                right = mid - 1
        
        # Return all occurrences
        result = []
        for i in range(first_occurrence, last_occurrence + 1):
            result.append(self.suffix_array[i])
        
        return sorted(result)
    
    def get_suffixes(self):
        """Get all suffixes in sorted order.
        
        Returns:
            List of suffixes in sorted order
        """
        return [self.text[i:] for i in self.suffix_array]
    
    def longest_common_prefix(self, i, j):
        """Calculate longest common prefix between two suffixes.
        
        Args:
            i: First suffix index
            j: Second suffix index
            
        Returns:
            Length of longest common prefix
        """
        k = 0
        while (i + k < self.n and j + k < self.n and 
               self.text[i + k] == self.text[j + k]):
            k += 1
        return k

