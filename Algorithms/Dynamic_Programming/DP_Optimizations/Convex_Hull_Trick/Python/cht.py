"""Convex Hull Trick (min variant) and Li Chao Tree.

MonotonicCHT: O(1) amortized per insert and query.
    Requires slopes added in non-increasing order AND queries in non-decreasing order.

LiChaoTree: O(log V) per insert and query over a fixed query range.
    No monotonicity assumptions.

Both solve the problem:
    Given a set of lines y = m*x + b, answer "min y at x = q" queries.
"""

from collections import deque
from typing import Deque, Optional, Tuple


class MonotonicCHT:
    """Deque-based CHT for min queries.

    Preconditions:
      - Lines inserted with non-increasing slope.
      - Queries performed with non-decreasing x.
    """

    def __init__(self) -> None:
        self._lines: Deque[Tuple[int, int]] = deque()    # (m, b), slopes strictly decreasing

    @staticmethod
    def _bad(l1: Tuple[int, int], l2: Tuple[int, int], l3: Tuple[int, int]) -> bool:
        """True if l2 is never optimal given l1 and l3 are already present.

        Using integer cross-multiplication to avoid floating-point error.
        For lines l1, l2, l3 with slopes m1 >= m2 >= m3:
            intersection(l1, l3).x <= intersection(l1, l2).x
        """
        (m1, b1), (m2, b2), (m3, b3) = l1, l2, l3
        # (b3 - b1) / (m1 - m3) <= (b2 - b1) / (m1 - m2)
        return (b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3)

    def add_line(self, m: int, b: int) -> None:
        if self._lines and self._lines[-1][0] == m:
            # Equal slopes: only the lower intercept can ever be optimal.
            if self._lines[-1][1] <= b:
                return
            self._lines.pop()
        while len(self._lines) >= 2 and self._bad(
            self._lines[-2], self._lines[-1], (m, b)
        ):
            self._lines.pop()
        self._lines.append((m, b))

    def query(self, x: int) -> int:
        """Return min y over all lines at given x. Assumes x is non-decreasing."""
        if not self._lines:
            raise ValueError("no lines in CHT")
        while len(self._lines) >= 2:
            m1, b1 = self._lines[0]
            m2, b2 = self._lines[1]
            if m1 * x + b1 >= m2 * x + b2:
                self._lines.popleft()
            else:
                break
        m, b = self._lines[0]
        return m * x + b


class LiChaoTree:
    """Li Chao Tree for min queries over a fixed query range [lo, hi]."""

    class _Node:
        __slots__ = ("m", "b", "left", "right")

        def __init__(self) -> None:
            self.m: Optional[int] = None
            self.b: Optional[int] = None
            self.left: Optional["LiChaoTree._Node"] = None
            self.right: Optional["LiChaoTree._Node"] = None

    def __init__(self, lo: int, hi: int) -> None:
        assert lo <= hi
        self._lo, self._hi = lo, hi
        self._root = LiChaoTree._Node()

    @staticmethod
    def _eval(line: Tuple[int, int], x: int) -> int:
        m, b = line
        return m * x + b

    def add_line(self, m: int, b: int) -> None:
        self._insert(self._root, self._lo, self._hi, (m, b))

    def _insert(self, node: "LiChaoTree._Node", lo: int, hi: int,
                new: Tuple[int, int]) -> None:
        if node.m is None:
            node.m, node.b = new
            return
        mid = (lo + hi) // 2
        cur = (node.m, node.b)
        # If `new` is better at mid, swap.
        if self._eval(new, mid) < self._eval(cur, mid):
            node.m, node.b = new
            cur, new = new, cur
        if lo == hi:
            return
        # Decide which side might still beat node at the extreme.
        if self._eval(new, lo) < self._eval((node.m, node.b), lo):
            if node.left is None:
                node.left = LiChaoTree._Node()
            self._insert(node.left, lo, mid, new)
        elif self._eval(new, hi) < self._eval((node.m, node.b), hi):
            if node.right is None:
                node.right = LiChaoTree._Node()
            self._insert(node.right, mid + 1, hi, new)

    def query(self, x: int) -> int:
        if not (self._lo <= x <= self._hi):
            raise ValueError(f"x={x} out of range [{self._lo}, {self._hi}]")
        return self._query(self._root, self._lo, self._hi, x)

    def _query(self, node: Optional["LiChaoTree._Node"], lo: int, hi: int,
               x: int) -> int:
        if node is None or node.m is None:
            return float("inf")  # type: ignore[return-value]
        best = self._eval((node.m, node.b), x)
        if lo == hi:
            return best
        mid = (lo + hi) // 2
        if x <= mid:
            best = min(best, self._query(node.left, lo, mid, x))
        else:
            best = min(best, self._query(node.right, mid + 1, hi, x))
        return best
