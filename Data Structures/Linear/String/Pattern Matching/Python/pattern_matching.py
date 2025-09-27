# Naive pattern search
def naive_search(text: str, pattern: str) -> list:
    n, m = len(text), len(pattern)
    indices = []
    for i in range(n - m + 1):
        if text[i:i+m] == pattern:
            indices.append(i)
    return indices

# KMP algorithm
def compute_lps(pattern: str) -> list:
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
    n, m = len(text), len(pattern)
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
    d = 256
    n, m = len(text), len(pattern)
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
    table = {}
    m = len(pattern)
    for i in range(m):
        table[pattern[i]] = i
    return table

def boyer_moore_search(text: str, pattern: str) -> list:
    n, m = len(text), len(pattern)
    indices = []
    if m == 0: return indices
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
