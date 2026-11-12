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
        
        if text.startswith(pattern, suffix_idx):
            first = mid
            right = mid - 1
        elif text[suffix_idx:suffix_idx + m] < pattern:
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
        
        if text.startswith(pattern, suffix_idx):
            last = mid
            left = mid + 1
        else:
            right = mid - 1
    
    # Collect all occurrences
    for i in range(first, last + 1):
        result.append(suffix_array[i])
    
    return sorted(result)


def get_suffixes(suffix_array: List[int], text: str) -> List[str]:
    """Return the suffixes of text in sorted order."""
    return [text[i:] for i in suffix_array]


def longest_common_prefix(text: str, i: int, j: int) -> int:
    """Length of the common prefix of the suffixes starting at i and j."""
    n = len(text)
    k = 0
    while i + k < n and j + k < n and text[i + k] == text[j + k]:
        k += 1
    return k


class SuffixArray:
    """Data-structure view: keeps the text and its suffix array together."""

    def __init__(self, text: str):
        self.text = text
        self.n = len(text)
        self.suffix_array = build_suffix_array(text)

    def search(self, pattern: str) -> List[int]:
        return search_pattern(self.suffix_array, self.text, pattern)

    def get_suffixes(self) -> List[str]:
        return get_suffixes(self.suffix_array, self.text)

    def longest_common_prefix(self, i: int, j: int) -> int:
        return longest_common_prefix(self.text, i, j)


if __name__ == "__main__":
    text = "banana"
    print("Suffix Array Example:")
    suffix_array = build_suffix_array(text)
    print(f"Suffix array: {suffix_array}")
    
    pattern = "ana"
    occurrences = search_pattern(suffix_array, text, pattern)
    print(f"Pattern '{pattern}' found at: {occurrences}")

