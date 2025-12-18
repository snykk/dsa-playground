"""
KMP (Knuth-Morris-Pratt) Algorithm Implementation

KMP algorithm is an efficient string matching algorithm that uses preprocessing
to avoid rechecking characters that have already been matched.
"""

from typing import List


def build_lps(pattern: str) -> List[int]:
    """
    Build Longest Proper Prefix which is also Suffix (LPS) array
    
    Args:
        pattern: The pattern string
        
    Returns:
        LPS array where lps[i] is the length of longest proper prefix
        which is also a suffix for pattern[0:i+1]
        
    Time Complexity: O(m) where m = len(pattern)
    Space Complexity: O(m)
    """
    m = len(pattern)
    lps = [0] * m
    length = 0  # Length of previous longest prefix suffix
    i = 1
    
    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                # Don't increment i, try with shorter prefix
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1
    
    return lps


def kmp_search(text: str, pattern: str) -> List[int]:
    """
    Find all occurrences of pattern in text using KMP algorithm
    
    Args:
        text: The text string to search in
        pattern: The pattern string to search for
        
    Returns:
        List of starting indices where pattern is found
        
    Time Complexity: O(n + m) where n = len(text), m = len(pattern)
    Space Complexity: O(m)
    """
    if not pattern:
        return []
    if not text or len(pattern) > len(text):
        return []
    
    n = len(text)
    m = len(pattern)
    result = []
    
    # Build LPS array
    lps = build_lps(pattern)
    
    i = 0  # Index for text
    j = 0  # Index for pattern
    
    while i < n:
        if text[i] == pattern[j]:
            i += 1
            j += 1
        
        if j == m:
            # Pattern found at index i - j
            result.append(i - j)
            # Continue searching for next occurrence
            j = lps[j - 1]
        elif i < n and text[i] != pattern[j]:
            # Mismatch after j matches
            if j != 0:
                # Don't match lps[0..lps[j-1]] characters, they will match anyway
                j = lps[j - 1]
            else:
                i += 1
    
    return result


def kmp_search_count(text: str, pattern: str) -> int:
    """
    Count occurrences of pattern in text using KMP algorithm
    
    Args:
        text: The text string to search in
        pattern: The pattern string to search for
        
    Returns:
        Number of occurrences
        
    Time Complexity: O(n + m)
    Space Complexity: O(m)
    """
    return len(kmp_search(text, pattern))


def kmp_search_first(text: str, pattern: str) -> int:
    """
    Find first occurrence of pattern in text using KMP algorithm
    
    Args:
        text: The text string to search in
        pattern: The pattern string to search for
        
    Returns:
        Index of first occurrence, or -1 if not found
        
    Time Complexity: O(n + m)
    Space Complexity: O(m)
    """
    occurrences = kmp_search(text, pattern)
    return occurrences[0] if occurrences else -1


if __name__ == "__main__":
    # Example usage
    text = "ABABDABACDABABCABC"
    pattern = "ABABCABC"
    
    print("KMP Algorithm Example:")
    print(f"Text: {text}")
    print(f"Pattern: {pattern}")
    
    # Build LPS array
    lps = build_lps(pattern)
    print(f"LPS array: {lps}")
    
    # Find all occurrences
    occurrences = kmp_search(text, pattern)
    print(f"Occurrences at indices: {occurrences}")
    
    # Count occurrences
    count = kmp_search_count(text, pattern)
    print(f"Total occurrences: {count}")
    
    # Find first occurrence
    first = kmp_search_first(text, pattern)
    print(f"First occurrence at index: {first}")
    
    # Example with multiple matches
    text2 = "AABAACAADAABAABA"
    pattern2 = "AABA"
    print(f"\nText: {text2}")
    print(f"Pattern: {pattern2}")
    occurrences2 = kmp_search(text2, pattern2)
    print(f"Occurrences at indices: {occurrences2}")

