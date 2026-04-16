"""
String Introduction -- basic string operations in Python.

Demonstrates fundamental string operations including character access,
length computation, traversal, concatenation, and substring extraction.
"""


def access_char(s: str, index: int) -> str:
    """
    Access a character in a string by index.

    Args:
        s: The source string.
        index: The zero-based position of the character.

    Returns:
        The character at the given index.

    Time Complexity: O(1)
    """
    return s[index]

def string_length(s: str) -> int:
    """
    Return the length of a string.

    Args:
        s: The string to measure.

    Returns:
        The number of characters in the string.

    Time Complexity: O(1)
    """
    return len(s)

def traverse_string(s: str) -> list:
    """
    Traverse a string and collect each character into a list.

    Args:
        s: The string to traverse.

    Returns:
        A list of individual characters from the string.

    Time Complexity: O(n)
    """
    return [c for c in s]

def concatenate(s1: str, s2: str) -> str:
    """
    Concatenate two strings.

    Args:
        s1: The first string.
        s2: The second string.

    Returns:
        A new string formed by appending s2 to s1.

    Time Complexity: O(n + m) where n and m are the lengths of s1 and s2.
    """
    return s1 + s2

def substring(s: str, start: int, end: int) -> str:
    """
    Extract a substring from a string.

    Args:
        s: The source string.
        start: The starting index (inclusive).
        end: The ending index (exclusive).

    Returns:
        The substring from start to end.

    Time Complexity: O(k) where k is end - start.
    """
    return s[start:end]
