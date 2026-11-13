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

    Entries are (index, value) pairs, where index counts the pushes, and
    eviction goes by index. Evicting by value would break on repeated values:
    the rules above pop an equal older value, so evicting the outgoing copy by
    value would remove the newer copy that is still in the window.
    """

    def __init__(self, should_pop: Callable[[int, int], bool]) -> None:
        self._dq: deque = deque()  # (index, value), values monotone front to back
        self._should_pop = should_pop
        self._pushed = 0   # index of the next value pushed
        self._evicted = 0  # index of the oldest value still in the window

    def push(self, value: int) -> None:
        while self._dq and self._should_pop(self._dq[-1][1], value):
            self._dq.pop()
        self._dq.append((self._pushed, value))
        self._pushed += 1

    def pop_front_if(self, value: int) -> None:
        """Evict `value`, the oldest value still in the window (for window eviction).

        Call it once for every value that leaves the window, oldest first. The
        front is removed only if it is that very element (same index); a newer
        equal value stays.
        """
        if self._evicted == self._pushed:
            return  # nothing in the window
        if self._dq and self._dq[0][0] == self._evicted:
            self._dq.popleft()
        self._evicted += 1

    def front(self) -> int:
        return self._dq[0][1]

    def __len__(self) -> int:
        return len(self._dq)


if __name__ == "__main__":
    print(sliding_window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3,3,5,5,6,7]
    print(sliding_window_min([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [-1,-3,-3,-3,3,3]
