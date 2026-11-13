"""
Rabin-Karp Algorithm Implementation

Rabin-Karp algorithm uses hashing to find pattern in text. It computes hash
values for the pattern and all substrings of text, comparing hashes instead
of characters directly.
"""

from typing import List

# Base of the hash: the number of byte values (256 is not a prime).
BASE = 256
# Modulus of the hash: a small prime, so about 1 window in 101 collides by chance.
# Collisions are harmless to correctness (every hash hit is verified) but slow the
# search down; use a large prime for real inputs.
MOD = 101


def rabin_karp_search(text: str, pattern: str, base: int = BASE, mod: int = MOD) -> List[int]:
    """
    Find all occurrences of pattern in text using Rabin-Karp algorithm
    
    Args:
        text: The text string to search in
        pattern: The pattern string to search for
        base: Base for hash function (default: 256)
        mod: Modulus for hash function (default: 101, a small prime)
        
    Returns:
        List of starting indices where pattern is found
        
    Time Complexity: O(n + m) average, O(n * m) worst case
    Space Complexity: O(1)
    """
    if not pattern:
        return []
    if not text or len(pattern) > len(text):
        return []
    
    n = len(text)
    m = len(pattern)
    result = []
    
    # Calculate hash value for pattern and first window of text
    pattern_hash = 0
    text_hash = 0
    h = 1  # h = base^(m-1) % mod
    
    # Calculate h = base^(m-1) % mod
    for i in range(m - 1):
        h = (h * base) % mod
    
    # Calculate initial hash values
    for i in range(m):
        pattern_hash = (base * pattern_hash + ord(pattern[i])) % mod
        text_hash = (base * text_hash + ord(text[i])) % mod
    
    # Slide the pattern over text one by one
    for i in range(n - m + 1):
        # Check if hash values match
        if pattern_hash == text_hash:
            # If hashes match, verify character by character
            match = True
            for j in range(m):
                if text[i + j] != pattern[j]:
                    match = False
                    break
            
            if match:
                result.append(i)
        
        # Calculate hash for next window
        if i < n - m:
            # Remove leading character, add trailing character
            text_hash = (base * (text_hash - ord(text[i]) * h) + ord(text[i + m])) % mod
            
            # Handle negative hash
            if text_hash < 0:
                text_hash += mod
    
    return result


def rabin_karp_search_count(text: str, pattern: str) -> int:
    """Count occurrences of pattern in text"""
    return len(rabin_karp_search(text, pattern))


def rabin_karp_search_first(text: str, pattern: str) -> int:
    """Find first occurrence of pattern in text"""
    occurrences = rabin_karp_search(text, pattern)
    return occurrences[0] if occurrences else -1


if __name__ == "__main__":
    # Example usage
    text = "ABABDABACDABABCABC"
    pattern = "ABABCABC"
    
    print("Rabin-Karp Algorithm Example:")
    print(f"Text: {text}")
    print(f"Pattern: {pattern}")
    
    # Find all occurrences
    occurrences = rabin_karp_search(text, pattern)
    print(f"Occurrences at indices: {occurrences}")
    
    # Count occurrences
    count = rabin_karp_search_count(text, pattern)
    print(f"Total occurrences: {count}")
    
    # Find first occurrence
    first = rabin_karp_search_first(text, pattern)
    print(f"First occurrence at index: {first}")

