"""Monotonic deque helpers.

The main use case is sliding-window maximum / minimum in O(n) total.
The queue itself stores *indices*; values are compared via the original array.
"""

from collections import deque
from typing import Callable, List


def sliding_window_max(arr: List[int], k: int) -> List[int]:
    """Return the maximum of every contiguous window of size `k`.

    Time: O(n)
    Space: O(k)
    """
    if k <= 0 or not arr:
        return []
    if k > len(arr):
        return []

    dq: deque = deque()   # stores indices with decreasing arr[] values
    result: List[int] = []

    for i, value in enumerate(arr):
        # Evict indices that are now outside the window
        while dq and dq[0] <= i - k:
            dq.popleft()
        # Maintain decreasing order from front to back
        while dq and arr[dq[-1]] <= value:
            dq.pop()
        dq.append(i)
        # Once the first full window has formed, record the answer
        if i >= k - 1:
            result.append(arr[dq[0]])
    return result


def sliding_window_min(arr: List[int], k: int) -> List[int]:
    """Return the minimum of every contiguous window of size `k`."""
    if k <= 0 or not arr:
        return []
    if k > len(arr):
        return []

    dq: deque = deque()
    result: List[int] = []
    for i, value in enumerate(arr):
        while dq and dq[0] <= i - k:
            dq.popleft()
        while dq and arr[dq[-1]] >= value:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(arr[dq[0]])
    return result


class MonotonicDeque:
    """A reusable monotonic deque keyed by a comparison function.

    Use `MonotonicDeque(lambda existing, new: existing <= new)` to get the
    'pop while back <= new' rule (gives you a max-oriented deque).

    Use `lambda existing, new: existing >= new` for min-oriented.
    """

    def __init__(self, should_pop: Callable[[int, int], bool]) -> None:
        self._dq: deque = deque()
        self._should_pop = should_pop

    def push(self, value: int) -> None:
        while self._dq and self._should_pop(self._dq[-1], value):
            self._dq.pop()
        self._dq.append(value)

    def pop_front_if(self, value: int) -> None:
        """Remove `value` from the front if present (for window eviction)."""
        if self._dq and self._dq[0] == value:
            self._dq.popleft()

    def front(self) -> int:
        return self._dq[0]

    def __len__(self) -> int:
        return len(self._dq)


if __name__ == "__main__":
    print(sliding_window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3,3,5,5,6,7]
    print(sliding_window_min([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [-1,-3,-3,-3,3,3]
