def reverse_string(s: str) -> str:
    return s[::-1]

def is_palindrome(s: str) -> bool:
    return s == s[::-1]

def count_vowels(s: str) -> int:
    vowels = "aeiouAEIOU"
    return sum(1 for c in s if c in vowels)

def replace_char(s: str, old: str, new: str) -> str:
    return s.replace(old, new)

def to_upper(s: str) -> str:
    return s.upper()

def to_lower(s: str) -> str:
    return s.lower()

def split_string(s: str, sep: str = " ") -> list:
    return s.split(sep)

def join_string(lst: list, sep: str = " ") -> str:
    return sep.join(lst)
