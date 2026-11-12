"""
String Pattern Matching algorithms in Python.

Implements four classic pattern matching algorithms:
    - Naive Search: brute-force comparison at every position.
    - KMP (Knuth-Morris-Pratt): uses a longest-prefix-suffix table to skip
      redundant comparisons.
    - Rabin-Karp: uses rolling hash values for fast average-case matching.
    - Boyer-Moore (bad character heuristic): scans the pattern right-to-left
      and shifts using a bad character table.
"""


# Naive pattern search
def naive_search(text: str, pattern: str) -> list:
    """
    Find all occurrences of a pattern in text using brute-force comparison.

    Args:
        text: The text to search in.
        pattern: The pattern to search for.

    Returns:
        A list of starting indices where the pattern occurs in the text.

    Time Complexity: O(n * m) where n is len(text) and m is len(pattern).
    """
    n, m = len(text), len(pattern)
    indices = []
    for i in range(n - m + 1):
        if text[i:i+m] == pattern:
            indices.append(i)
    return indices

# KMP algorithm
def compute_lps(pattern: str) -> list:
    """
    Compute the Longest Proper Prefix which is also Suffix (LPS) array.

    The LPS array is used by the KMP algorithm to determine how far to
    shift the pattern when a mismatch occurs.

    Args:
        pattern: The pattern to preprocess.

    Returns:
        A list where lps[i] is the length of the longest proper prefix
        of pattern[0..i] that is also a suffix.

    Time Complexity: O(m) where m is len(pattern).
    """
    lps = [0]*len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length-1]
            else:
                lps[i] = 0
                i += 1
    return lps

def kmp_search(text: str, pattern: str) -> list:
    """
    Find all occurrences of a pattern in text using the KMP algorithm.

    Uses the LPS (longest prefix suffix) array to avoid re-examining
    characters that have already been matched.

    Args:
        text: The text to search in.
        pattern: The pattern to search for.

    Returns:
        A list of starting indices where the pattern occurs in the text.

    Time Complexity: O(n + m) where n is len(text) and m is len(pattern).
    """
    n, m = len(text), len(pattern)
    if m == 0:
        # The empty pattern occurs at every position 0..n, as in naive_search.
        return list(range(n + 1))
    lps = compute_lps(pattern)
    indices = []
    i = j = 0
    while i < n:
        if pattern[j] == text[i]:
            i += 1
            j += 1
        if j == m:
            indices.append(i-j)
            j = lps[j-1]
        elif i < n and pattern[j] != text[i]:
            if j != 0:
                j = lps[j-1]
            else:
                i += 1
    return indices

# Rabin-Karp algorithm
def rabin_karp_search(text: str, pattern: str, q=101) -> list:
    """
    Find all occurrences of a pattern in text using the Rabin-Karp algorithm.

    Uses a rolling hash function to compare the hash of the pattern with
    the hash of each substring of the text. Only performs character-by-character
    comparison when hash values match (to handle collisions).

    Args:
        text: The text to search in.
        pattern: The pattern to search for.
        q: A prime number used as the modulus for hashing (default 101).

    Returns:
        A list of starting indices where the pattern occurs in the text.

    Time Complexity: O(n * m) worst case, O(n + m) average case.
    """
    d = 256
    n, m = len(text), len(pattern)
    if m == 0:
        # The empty pattern occurs at every position 0..n, as in naive_search.
        return list(range(n + 1))
    if m > n:
        # No window of length m fits (hashing the first window would index past the text).
        return []
    h = pow(d, m-1, q)
    p_hash = sum([ord(pattern[i])*pow(d,m-i-1,q) for i in range(m)]) % q
    t_hash = sum([ord(text[i])*pow(d,m-i-1,q) for i in range(m)]) % q
    indices = []
    for i in range(n-m+1):
        if p_hash == t_hash and text[i:i+m]==pattern:
            indices.append(i)
        if i < n-m:
            t_hash = (d*(t_hash - ord(text[i])*h) + ord(text[i+m])) % q
            if t_hash < 0:
                t_hash += q
    return indices

# Simple Boyer-Moore (bad character only)
def bad_char_table(pattern: str) -> dict:
    """
    Build the bad character table for the Boyer-Moore algorithm.

    Maps each character in the pattern to its rightmost occurrence index.

    Args:
        pattern: The pattern to preprocess.

    Returns:
        A dictionary mapping each character to its last index in the pattern.

    Time Complexity: O(m) where m is len(pattern).
    """
    table = {}
    m = len(pattern)
    for i in range(m):
        table[pattern[i]] = i
    return table

def boyer_moore_search(text: str, pattern: str) -> list:
    """
    Find all occurrences of a pattern in text using the Boyer-Moore algorithm.

    Uses the bad character heuristic to skip alignments. The pattern is
    compared right-to-left at each alignment position.

    Args:
        text: The text to search in.
        pattern: The pattern to search for.

    Returns:
        A list of starting indices where the pattern occurs in the text.

    Time Complexity: O(n * m) worst case, O(n / m) best case.
    """
    n, m = len(text), len(pattern)
    indices = []
    if m == 0:
        # The empty pattern occurs at every position 0..n, as in naive_search.
        return list(range(n + 1))
    bad_char = bad_char_table(pattern)
    s = 0
    while s <= n - m:
        j = m-1
        while j >=0 and pattern[j]==text[s+j]:
            j -= 1
        if j<0:
            indices.append(s)
            s += 1
        else:
            s += max(1, j - bad_char.get(text[s+j],-1))
    return indices
