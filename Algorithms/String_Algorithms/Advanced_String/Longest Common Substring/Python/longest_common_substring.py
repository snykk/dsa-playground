"""
Longest Common Substring Implementation

Finds the longest common substring between two strings using dynamic programming.
"""

from typing import Tuple


def longest_common_substring(s1: str, s2: str) -> Tuple[str, int, int, int]:
    """
    Find longest common substring between two strings
    
    Args:
        s1: First string
        s2: Second string
        
    Returns:
        Tuple of (substring, length, end_index_in_s1, end_index_in_s2)
    """
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    max_len = 0
    end_i, end_j = 0, 0
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                if dp[i][j] > max_len:
                    max_len = dp[i][j]
                    end_i = i
                    end_j = j
            else:
                dp[i][j] = 0
    
    if max_len == 0:
        return "", 0, 0, 0
    
    substring = s1[end_i - max_len:end_i]
    return substring, max_len, end_i - max_len, end_j - max_len


if __name__ == "__main__":
    s1 = "ABABC"
    s2 = "BABCA"
    
    print("Longest Common Substring Example:")
    result = longest_common_substring(s1, s2)
    print(f"Substring: {result[0]}, Length: {result[1]}")

