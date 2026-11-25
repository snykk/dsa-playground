"""
Shell Sort Implementation

Shell Sort is insertion sort over shrinking gaps. A pass with gap h
insertion-sorts each of the h interleaved subsequences
arr[r], arr[r + h], arr[r + 2h], ... so that the array becomes h-sorted
(arr[i] <= arr[i + h] for every i). Far-apart elements move in long
jumps while the gap is large; the last pass, with gap 1, is a plain
insertion sort of an array that is already nearly sorted.

How fast it runs depends on the gap sequence. Three are provided:

- "shell": n // 2, n // 4, ..., 1 (Shell, 1959);
- "knuth": 1, 4, 13, 40, ..., (3^k - 1) / 2, each 3h + 1 (Knuth);
- "ciura": 1, 4, 10, 23, 57, 132, 301, 701 (Ciura, 2001), extended past
  701 by next = 2h + h // 4, which is floor(2.25 h) in integers.

Every sequence uses the terms below n, largest first. Ciura's is the
default: it makes the fewest comparisons of the three in practice.
"""

SHELL = "shell"
KNUTH = "knuth"
CIURA = "ciura"
SEQUENCES = (SHELL, KNUTH, CIURA)
DEFAULT_SEQUENCE = CIURA

# Ciura's measured gaps. Past 701 each gap is 2.25 times the one before,
# rounded down.
CIURA_GAPS = (1, 4, 10, 23, 57, 132, 301, 701)


def shell_gaps(n):
    """Shell's gaps for n elements: n // 2, n // 4, ..., 1. Empty for n < 2."""
    gaps = []
    gap = n // 2
    while gap > 0:
        gaps.append(gap)
        gap //= 2
    return gaps


def knuth_gaps(n):
    """Knuth's gaps (3^k - 1) / 2 below n, largest first. Empty for n < 2."""
    gaps = []
    h = 1
    while h < n:
        gaps.append(h)
        # The next gap 3h + 1 is below n only if h <= (n - 2) // 3; stopping
        # here never computes a number above n (see ciura_gaps).
        if h > (n - 2) // 3:
            break
        h = 3 * h + 1
    gaps.reverse()
    return gaps


def ciura_gaps(n):
    """Ciura's gaps below n, largest first, extended past 701 by floor(2.25 h).

    The extension computes 2h + h // 4, the same integer expression in the
    C++ and Go versions: 1577, 3548, 7983, 17961, 40412, 90927, ...
    """
    gaps = [g for g in CIURA_GAPS if g < n]
    h = CIURA_GAPS[-1]
    while h < n:
        # The next gap 2h + h // 4 is below n only if 2h < n and h // 4 < n - 2h.
        # Testing it this way never computes a number above n, which keeps the
        # C++ and Go versions (same code) free of overflow.
        if h > (n - 1) // 2 or h // 4 >= n - 2 * h:
            break
        h = 2 * h + h // 4
        gaps.append(h)
    gaps.reverse()
    return gaps


_GAP_FUNCTIONS = {SHELL: shell_gaps, KNUTH: knuth_gaps, CIURA: ciura_gaps}


def gap_sequence(n, sequence=DEFAULT_SEQUENCE):
    """
    The gaps Shell Sort uses on n elements, largest first.

    Args:
        n: Number of elements (n < 2 gives no gaps: nothing to sort)
        sequence: "shell", "knuth" or "ciura" (the default)

    Returns:
        A list of strictly decreasing gaps, all below n, ending with 1
        when n >= 2

    Raises:
        ValueError: if sequence is not one of SEQUENCES
    """
    if sequence not in _GAP_FUNCTIONS:
        raise ValueError(
            f"unknown gap sequence {sequence!r}; use one of {', '.join(SEQUENCES)}"
        )
    return _GAP_FUNCTIONS[sequence](n)


def h_sort(arr, gap):
    """
    One pass of Shell Sort: insertion-sort arr with stride gap, in place.

    Each element is inserted among the earlier elements of its own
    subsequence (the indices with the same remainder mod gap). Afterwards
    arr[i] <= arr[i + gap] for every i. With gap 1 this is exactly
    Insertion Sort.

    Args:
        arr: List of elements that support > (modified in place)
        gap: The stride, at least 1; a gap >= len(arr) changes nothing

    Returns:
        The same list

    Raises:
        ValueError: if gap < 1
    """
    if gap < 1:
        raise ValueError(f"gap must be at least 1, got {gap}")
    for i in range(gap, len(arr)):
        key = arr[i]
        j = i
        # Strict >: an equal element stops the shifting, as in Insertion Sort.
        while j >= gap and arr[j - gap] > key:
            arr[j] = arr[j - gap]
            j -= gap
        arr[j] = key
    return arr


def shell_sort(arr, sequence=DEFAULT_SEQUENCE):
    """
    Sort a list in place with Shell Sort.

    Args:
        arr: List of elements that support > (modified in place)
        sequence: The gap sequence, "shell", "knuth" or "ciura" (default)

    Returns:
        The sorted list (same reference as input)

    Raises:
        ValueError: if sequence is not one of SEQUENCES

    Time Complexity: depends on the sequence. Shell's gaps are Theta(n^2)
        in the worst case, Knuth's O(n^(3/2)); Ciura's have no proven
        bound but make the fewest comparisons of the three in practice.
    Space Complexity: O(1) extra (O(log n) for the list of gaps)
    Not stable: a long jump can carry an element past an equal one.
    """
    for gap in gap_sequence(len(arr), sequence):
        h_sort(arr, gap)
    return arr


if __name__ == "__main__":
    example = [98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38]
    for name in SEQUENCES:
        arr = list(example)
        print(f"{name}:")
        for gap in gap_sequence(len(arr), name):
            h_sort(arr, gap)
            print(f"  after gap {gap}: {' '.join(map(str, arr))}")
