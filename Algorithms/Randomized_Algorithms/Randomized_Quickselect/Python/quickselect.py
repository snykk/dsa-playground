"""Randomized Quickselect — O(n) expected-time k-th smallest element.

Uses Lomuto partition with a random pivot. Mutates the input array.
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
        pivot_idx = _partition(arr, lo, hi, rng.randint(lo, hi))
        if k == pivot_idx:
            return arr[k]
        if k < pivot_idx:
            hi = pivot_idx - 1
        else:
            lo = pivot_idx + 1
    return arr[lo]


def _partition(arr: List[int], lo: int, hi: int, pivot_idx: int) -> int:
    """Lomuto partition: move pivot to `hi`, then reorder. Returns pivot's final index."""
    arr[pivot_idx], arr[hi] = arr[hi], arr[pivot_idx]
    pivot = arr[hi]
    store = lo
    for i in range(lo, hi):
        if arr[i] < pivot:
            arr[i], arr[store] = arr[store], arr[i]
            store += 1
    arr[store], arr[hi] = arr[hi], arr[store]
    return store


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
