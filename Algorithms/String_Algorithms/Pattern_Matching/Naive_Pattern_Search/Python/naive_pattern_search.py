"""
Naive Pattern Search Implementation

Naive pattern search is the simplest string matching algorithm that checks
all positions in the text to see if the pattern matches.
"""

from typing import List


def naive_pattern_search(text: str, pattern: str) -> List[int]:
    """
    Find all occurrences of pattern in text using naive approach
    
    Args:
        text: The text string to search in
        pattern: The pattern string to search for
        
    Returns:
        List of starting indices where pattern is found
        
    Time Complexity: O(n * m) where n = len(text), m = len(pattern)
    Space Complexity: O(1) excluding output array
    """
    if not pattern:
        return []
    if not text or len(pattern) > len(text):
        return []
    
    n = len(text)
    m = len(pattern)
    result = []
    
    # Check each possible starting position
    for i in range(n - m + 1):
        # Check if pattern matches at position i
        j = 0
        while j < m and text[i + j] == pattern[j]:
            j += 1
        
        # If we matched the entire pattern
        if j == m:
            result.append(i)
    
    return result


def naive_pattern_search_count(text: str, pattern: str) -> int:
    """
    Count occurrences of pattern in text
    
    Args:
        text: The text string to search in
        pattern: The pattern string to search for
        
    Returns:
        Number of occurrences
        
    Time Complexity: O(n * m)
    Space Complexity: O(k) for the list of the k occurrences it builds
    """
    return len(naive_pattern_search(text, pattern))


def naive_pattern_search_first(text: str, pattern: str) -> int:
    """
    Find first occurrence of pattern in text
    
    Args:
        text: The text string to search in
        pattern: The pattern string to search for
        
    Returns:
        Index of first occurrence, or -1 if not found
        
    Time Complexity: O(n * m)
    Space Complexity: O(k) for the list of the k occurrences it builds
    """
    occurrences = naive_pattern_search(text, pattern)
    return occurrences[0] if occurrences else -1


if __name__ == "__main__":
    # Example usage
    text = "ABABDABACDABABCABC"
    pattern = "ABABCABC"
    
    print("Naive Pattern Search Example:")
    print(f"Text: {text}")
    print(f"Pattern: {pattern}")
    
    # Find all occurrences
    occurrences = naive_pattern_search(text, pattern)
    print(f"Occurrences at indices: {occurrences}")
    
    # Count occurrences
    count = naive_pattern_search_count(text, pattern)
    print(f"Total occurrences: {count}")
    
    # Find first occurrence
    first = naive_pattern_search_first(text, pattern)
    print(f"First occurrence at index: {first}")
    
    # Example with multiple matches
    text2 = "AABAACAADAABAABA"
    pattern2 = "AABA"
    print(f"\nText: {text2}")
    print(f"Pattern: {pattern2}")
    occurrences2 = naive_pattern_search(text2, pattern2)
    print(f"Occurrences at indices: {occurrences2}")

