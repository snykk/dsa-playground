"""
String Manipulation utilities in Python.

Provides common string manipulation functions including reversing,
palindrome checking, vowel counting, character replacement, case
conversion, splitting, and joining.
"""


def reverse_string(s: str) -> str:
    """
    Reverse a string.

    Args:
        s: The string to reverse.

    Returns:
        The reversed string.

    Time Complexity: O(n)
    """
    return s[::-1]

def is_palindrome(s: str) -> bool:
    """
    Check whether a string is a palindrome.

    Args:
        s: The string to check.

    Returns:
        True if the string reads the same forwards and backwards, False otherwise.

    Time Complexity: O(n)
    """
    return s == s[::-1]

def count_vowels(s: str) -> int:
    """
    Count the number of vowels in a string.

    Args:
        s: The string to examine.

    Returns:
        The total count of vowel characters (both upper and lower case).

    Time Complexity: O(n)
    """
    vowels = "aeiouAEIOU"
    return sum(1 for c in s if c in vowels)

def replace_char(s: str, old: str, new: str) -> str:
    """
    Replace all occurrences of a substring with another.

    Args:
        s: The source string.
        old: The substring to find.
        new: The substring to replace it with.

    Returns:
        A new string with all occurrences of old replaced by new.

    Time Complexity: O(n)
    """
    return s.replace(old, new)

def to_upper(s: str) -> str:
    """
    Convert a string to uppercase.

    Args:
        s: The string to convert.

    Returns:
        The string with all characters in uppercase.

    Time Complexity: O(n)
    """
    return s.upper()

def to_lower(s: str) -> str:
    """
    Convert a string to lowercase.

    Args:
        s: The string to convert.

    Returns:
        The string with all characters in lowercase.

    Time Complexity: O(n)
    """
    return s.lower()

def split_string(s: str, sep: str = " ") -> list:
    """
    Split a string into a list of substrings by a separator.

    Args:
        s: The string to split.
        sep: The delimiter to split on (default is a space).

    Returns:
        A list of substrings.

    Time Complexity: O(n)
    """
    return s.split(sep)

def join_string(lst: list, sep: str = " ") -> str:
    """
    Join a list of strings into a single string with a separator.

    Args:
        lst: The list of strings to join.
        sep: The separator to place between elements (default is a space).

    Returns:
        A single string with elements joined by the separator.

    Time Complexity: O(n) where n is the total length of all strings.
    """
    return sep.join(lst)
