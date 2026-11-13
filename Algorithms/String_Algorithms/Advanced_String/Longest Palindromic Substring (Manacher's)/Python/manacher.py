"""
Manacher's Algorithm Implementation

Finds the longest palindromic substring in linear time.
"""

from typing import Tuple


def manacher(s: str) -> Tuple[str, int, int]:
    """
    Find longest palindromic substring using Manacher's algorithm
    
    Args:
        s: Input string
        
    Returns:
        Tuple of (substring, start_index, length)
    """
    if not s:
        return "", 0, 0
    
    # Transform string: "abc" -> "#a#b#c#". No sentinel characters: the expansion is
    # bounds-checked instead, so any character (including "^" and "$") is safe in s.
    transformed = "#" + "#".join(s) + "#"
    n = len(transformed)
    p = [0] * n
    center = 0
    right = 0
    
    for i in range(n):
        mirror = 2 * center - i
        
        if i < right:
            p[i] = min(right - i, p[mirror])
        
        # Expand around center i
        while (i - p[i] - 1 >= 0 and i + p[i] + 1 < n
               and transformed[i + p[i] + 1] == transformed[i - p[i] - 1]):
            p[i] += 1
        
        # Update center and right boundary
        if i + p[i] > right:
            center = i
            right = i + p[i]
    
    # Find maximum palindrome
    max_len = 0
    center_index = 0
    for i in range(n):
        if p[i] > max_len:
            max_len = p[i]
            center_index = i
    
    start = (center_index - max_len) // 2
    return s[start:start + max_len], start, max_len


if __name__ == "__main__":
    s = "babad"
    print("Manacher's Algorithm Example:")
    result = manacher(s)
    print(f"Longest palindromic substring: {result[0]}, Start: {result[1]}, Length: {result[2]}")

