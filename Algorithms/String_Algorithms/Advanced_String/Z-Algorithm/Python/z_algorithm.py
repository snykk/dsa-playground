"""
Z-Algorithm Implementation

Z-Algorithm constructs a Z-array where Z[i] is the length of the longest substring
starting from position i which is also a prefix of the string.
"""

from typing import List


def build_z_array(s: str) -> List[int]:
    """
    Build Z-array for string s
    
    Args:
        s: Input string
        
    Returns:
        Z-array where Z[i] is length of longest prefix starting at i
    """
    n = len(s)
    z = [0] * n
    l, r = 0, 0  # Z-box boundaries
    
    for i in range(1, n):
        if i <= r:
            z[i] = min(r - i + 1, z[i - l])
        
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        
        if i + z[i] - 1 > r:
            l = i
            r = i + z[i] - 1
    
    return z


def z_algorithm_search(text: str, pattern: str) -> List[int]:
    """
    Find all occurrences of pattern in text using Z-algorithm
    
    Args:
        text: The text string to search in
        pattern: The pattern string to search for
        
    Returns:
        List of starting indices where pattern is found
    """
    if not pattern:
        return []
    if not text or len(pattern) > len(text):
        return []
    
    # Create combined string: pattern$text
    combined = pattern + "$" + text
    z = build_z_array(combined)
    
    result = []
    m = len(pattern)
    
    # Find positions where Z[i] == m (pattern length)
    for i in range(m + 1, len(combined)):
        if z[i] == m:
            result.append(i - m - 1)
    
    return result


if __name__ == "__main__":
    text = "ABABDABACDABABCABC"
    pattern = "ABABCABC"
    
    print("Z-Algorithm Example:")
    print(f"Text: {text}")
    print(f"Pattern: {pattern}")
    
    occurrences = z_algorithm_search(text, pattern)
    print(f"Occurrences at indices: {occurrences}")

