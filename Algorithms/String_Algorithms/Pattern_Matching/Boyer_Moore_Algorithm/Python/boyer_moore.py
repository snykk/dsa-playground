"""
Boyer-Moore Algorithm Implementation

Boyer-Moore compares the pattern right to left and uses the bad character
rule to skip alignments. The good suffix rule of the full algorithm is not
implemented here (this is a Horspool-style variant).
"""

from typing import List, Dict


def build_bad_char_table(pattern: str) -> Dict[str, int]:
    """
    Build bad character table for Boyer-Moore algorithm
    
    Args:
        pattern: The pattern string
        
    Returns:
        Dictionary mapping characters to their last occurrence index in pattern
    """
    table = {}
    for i, char in enumerate(pattern):
        table[char] = i
    return table


def boyer_moore_search(text: str, pattern: str) -> List[int]:
    """
    Find all occurrences of pattern in text using Boyer-Moore algorithm
    
    Args:
        text: The text string to search in
        pattern: The pattern string to search for
        
    Returns:
        List of starting indices where pattern is found
        
    Time Complexity: O(n * m) worst case, O(n/m) best case
    Space Complexity: O(m)
    """
    if not pattern:
        return []
    if not text or len(pattern) > len(text):
        return []
    
    n = len(text)
    m = len(pattern)
    result = []
    
    # Build bad character table
    bad_char = build_bad_char_table(pattern)
    
    s = 0  # Shift of pattern with respect to text
    
    while s <= n - m:
        j = m - 1  # Start from last character of pattern
        
        # Keep reducing j while characters match
        while j >= 0 and pattern[j] == text[s + j]:
            j -= 1
        
        # If pattern found
        if j < 0:
            result.append(s)
            # Shift pattern to next position
            s += (m - bad_char.get(text[s + m], -1)) if s + m < n else 1
        else:
            # Shift pattern based on bad character rule
            bad_char_shift = j - bad_char.get(text[s + j], -1)
            s += max(1, bad_char_shift)
    
    return result


def boyer_moore_search_count(text: str, pattern: str) -> int:
    """Count occurrences of pattern in text"""
    return len(boyer_moore_search(text, pattern))


def boyer_moore_search_first(text: str, pattern: str) -> int:
    """Find first occurrence of pattern in text"""
    occurrences = boyer_moore_search(text, pattern)
    return occurrences[0] if occurrences else -1


if __name__ == "__main__":
    text = "ABABDABACDABABCABC"
    pattern = "ABABCABC"
    
    print("Boyer-Moore Algorithm Example:")
    print(f"Text: {text}")
    print(f"Pattern: {pattern}")
    
    occurrences = boyer_moore_search(text, pattern)
    print(f"Occurrences at indices: {occurrences}")

