"""Randomized Quickselect - O(n) expected-time k-th smallest element.

Uses a three-way (Dutch flag) partition with a random pivot, so duplicates
cannot cause quadratic time. Mutates the input array.
"""

import random
from typing import List, Optional


def quickselect(
    arr: List[int], k: int, rng: Optional[random.Random] = None
) -> int:
    """Return the k-th smallest element (0-indexed) of `arr`.

    Mutates `arr` in place. Pass a copy if you need the original preserved.

    Args:
        arr: list to select from (modified in place).
        k: zero-indexed rank of the element to return (0 = smallest).
        rng: optional random.Random for deterministic testing.
    """
    if not arr:
        raise ValueError("arr must be non-empty")
    if k < 0 or k >= len(arr):
        raise IndexError(f"k={k} out of range [0, {len(arr)})")
    if rng is None:
        rng = random
    return _quickselect(arr, 0, len(arr) - 1, k, rng)


def _quickselect(arr: List[int], lo: int, hi: int, k: int,
                 rng: random.Random) -> int:
    while lo < hi:
        lt, gt = _partition3(arr, lo, hi, rng.randint(lo, hi))
        if k < lt:
            hi = lt - 1
        elif k > gt:
            lo = gt + 1
        else:
            return arr[k]  # k falls inside the band of keys equal to the pivot
    return arr[lo]


def _partition3(arr: List[int], lo: int, hi: int, pivot_idx: int):
    """Three-way partition around arr[pivot_idx].

    Reorders arr[lo..hi] into  < pivot | == pivot | > pivot  and returns
    (lt, gt): arr[lt..gt] holds exactly the keys equal to the pivot.
    """
    pivot = arr[pivot_idx]
    lt, i, gt = lo, lo, hi
    while i <= gt:
        if arr[i] < pivot:
            arr[lt], arr[i] = arr[i], arr[lt]
            lt += 1
            i += 1
        elif arr[i] > pivot:
            arr[i], arr[gt] = arr[gt], arr[i]
            gt -= 1
        else:
            i += 1
    return lt, gt


def top_k_smallest(arr: List[int], k: int,
                   rng: Optional[random.Random] = None) -> List[int]:
    """Return (unordered) the k smallest elements of `arr`. O(n) expected."""
    if k <= 0:
        return []
    if k >= len(arr):
        return list(arr)
    arr = list(arr)                      # don't mutate caller's list
    _ = quickselect(arr, k - 1, rng)
    return arr[:k]


if __name__ == "__main__":
    rng = random.Random(42)
    data = [7, 2, 1, 8, 6, 3, 5, 4]
    print(f"3rd smallest (k=2) of {data}: {quickselect(list(data), 2, rng)}")
    print(f"Top-3 smallest: {top_k_smallest(data, 3, rng)}")
