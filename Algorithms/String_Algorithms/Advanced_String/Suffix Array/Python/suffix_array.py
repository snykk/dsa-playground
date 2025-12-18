"""
Suffix Array Implementation

Suffix array is a sorted array of all suffixes of a string.
"""

from typing import List, Tuple


def build_suffix_array(s: str) -> List[int]:
    """
    Build suffix array for string s
    
    Args:
        s: Input string
        
    Returns:
        Suffix array - indices of sorted suffixes
    """
    n = len(s)
    suffixes = [(s[i:], i) for i in range(n)]
    suffixes.sort()
    return [idx for _, idx in suffixes]


def search_pattern(suffix_array: List[int], text: str, pattern: str) -> List[int]:
    """
    Search for pattern in text using suffix array (binary search)
    
    Args:
        suffix_array: Suffix array of text
        text: The text string
        pattern: Pattern to search
        
    Returns:
        List of starting indices where pattern is found
    """
    n = len(text)
    m = len(pattern)
    result = []
    
    # Binary search for first occurrence
    left, right = 0, n - 1
    first = -1
    
    while left <= right:
        mid = (left + right) // 2
        suffix_idx = suffix_array[mid]
        suffix = text[suffix_idx:]
        
        if suffix.startswith(pattern):
            first = mid
            right = mid - 1
        elif suffix < pattern:
            left = mid + 1
        else:
            right = mid - 1
    
    if first == -1:
        return []
    
    # Find last occurrence
    left, right = first, n - 1
    last = first
    
    while left <= right:
        mid = (left + right) // 2
        suffix_idx = suffix_array[mid]
        suffix = text[suffix_idx:]
        
        if suffix.startswith(pattern):
            last = mid
            left = mid + 1
        else:
            right = mid - 1
    
    # Collect all occurrences
    for i in range(first, last + 1):
        result.append(suffix_array[i])
    
    return sorted(result)


if __name__ == "__main__":
    text = "banana"
    print("Suffix Array Example:")
    suffix_array = build_suffix_array(text)
    print(f"Suffix array: {suffix_array}")
    
    pattern = "ana"
    occurrences = search_pattern(suffix_array, text, pattern)
    print(f"Pattern '{pattern}' found at: {occurrences}")

