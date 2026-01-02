"""
Sliding Window

Technique for solving problems involving subarrays or substrings by maintaining
a window that slides through the array/string.
"""

from typing import List, Optional


def max_sum_subarray(arr: List[int], k: int) -> int:
    """
    Find maximum sum of subarray of size k using fixed sliding window.
    
    Args:
        arr: Input array
        k: Size of subarray
        
    Returns:
        Maximum sum of subarray of size k
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if len(arr) < k:
        return 0
    
    # Calculate sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    # Slide the window
    for i in range(k, len(arr)):
        window_sum = window_sum - arr[i - k] + arr[i]
        max_sum = max(max_sum, window_sum)
    
    return max_sum


def longest_substring_k_distinct(s: str, k: int) -> int:
    """
    Find length of longest substring with at most k distinct characters.
    
    Args:
        s: Input string
        k: Maximum distinct characters allowed
        
    Returns:
        Length of longest substring
        
    Time Complexity: O(n)
    Space Complexity: O(k)
    """
    if not s or k == 0:
        return 0
    
    char_count = {}
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        # Add current character
        char_count[s[right]] = char_count.get(s[right], 0) + 1
        
        # Shrink window if distinct chars exceed k
        while len(char_count) > k:
            char_count[s[left]] -= 1
            if char_count[s[left]] == 0:
                del char_count[s[left]]
            left += 1
        
        max_len = max(max_len, right - left + 1)
    
    return max_len


def min_window_substring(s: str, t: str) -> str:
    """
    Find minimum window substring containing all characters of t.
    
    Args:
        s: Source string
        t: Target string
        
    Returns:
        Minimum window substring, empty string if not found
        
    Time Complexity: O(|s| + |t|)
    Space Complexity: O(|s| + |t|)
    """
    if not s or not t or len(s) < len(t):
        return ""
    
    # Count characters in t
    need = {}
    for char in t:
        need[char] = need.get(char, 0) + 1
    
    window = {}
    left = 0
    valid = 0
    start = 0
    min_len = float('inf')
    
    for right in range(len(s)):
        char = s[right]
        
        # Add to window
        if char in need:
            window[char] = window.get(char, 0) + 1
            if window[char] == need[char]:
                valid += 1
        
        # Shrink window
        while valid == len(need):
            # Update minimum window
            if right - left + 1 < min_len:
                start = left
                min_len = right - left + 1
            
            # Remove left character
            left_char = s[left]
            if left_char in need:
                if window[left_char] == need[left_char]:
                    valid -= 1
                window[left_char] -= 1
            left += 1
    
    return s[start:start + min_len] if min_len != float('inf') else ""


def longest_substring_no_repeat(s: str) -> int:
    """
    Find length of longest substring without repeating characters.
    
    Args:
        s: Input string
        
    Returns:
        Length of longest substring without repeating characters
        
    Time Complexity: O(n)
    Space Complexity: O(min(n, m)) where m is charset size
    """
    char_index = {}
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        # If character seen before and within current window
        if s[right] in char_index and char_index[s[right]] >= left:
            left = char_index[s[right]] + 1
        
        char_index[s[right]] = right
        max_len = max(max_len, right - left + 1)
    
    return max_len


def main():
    """Example usage."""
    print("Sliding Window Examples:")
    print()
    
    # Fixed window: Maximum sum subarray
    arr = [1, 4, 2, 10, 23, 3, 1, 0, 20]
    k = 4
    result = max_sum_subarray(arr, k)
    print(f"Maximum sum of subarray of size {k}: {result}")
    print()
    
    # Variable window: Longest substring with k distinct
    s = "eceba"
    k = 2
    result = longest_substring_k_distinct(s, k)
    print(f"Longest substring with {k} distinct chars: {result}")
    print()
    
    # Minimum window substring
    s = "ADOBECODEBANC"
    t = "ABC"
    result = min_window_substring(s, t)
    print(f"Minimum window containing '{t}': '{result}'")
    print()
    
    # Longest substring without repeat
    s = "abcabcbb"
    result = longest_substring_no_repeat(s)
    print(f"Longest substring without repeat: {result}")


if __name__ == "__main__":
    main()

