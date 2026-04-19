"""K-D Tree (k-dimensional binary search tree) for nearest-neighbor and range queries.

Each internal node splits the space by one coordinate axis; the splitting
axis cycles through 0, 1, ..., k-1 with depth.

This implementation supports arbitrary k via tuples of floats.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

Point = Tuple[float, ...]


@dataclass
class _Node:
    point: Point
    axis: int
    left: Optional["_Node"] = None
    right: Optional["_Node"] = None


def _squared_distance(a: Point, b: Point) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b))


class KDTree:
    """K-D Tree supporting build, insert, nearest-neighbor, and range queries."""

    def __init__(self, points: Optional[List[Point]] = None) -> None:
        if points is None or not points:
            self._root: Optional[_Node] = None
            self._k = 0
        else:
            self._k = len(points[0])
            for p in points:
                if len(p) != self._k:
                    raise ValueError("all points must have the same dimensionality")
            self._root = self._build(list(points), depth=0)

    @property
    def dimensionality(self) -> int:
        return self._k

    def _build(self, pts: List[Point], depth: int) -> Optional[_Node]:
        if not pts:
            return None
        axis = depth % self._k
        pts.sort(key=lambda p: p[axis])
        mid = len(pts) // 2
        node = _Node(point=pts[mid], axis=axis)
        node.left = self._build(pts[:mid], depth + 1)
        node.right = self._build(pts[mid + 1:], depth + 1)
        return node

    def insert(self, point: Point) -> None:
        if self._root is None:
            self._k = len(point)
            self._root = _Node(point=point, axis=0)
            return
        if len(point) != self._k:
            raise ValueError(f"expected {self._k}-dim point, got {len(point)}-dim")

        node = self._root
        depth = 0
        while True:
            axis = depth % self._k
            if point[axis] < node.point[axis]:
                if node.left is None:
                    node.left = _Node(point=point, axis=(depth + 1) % self._k)
                    return
                node = node.left
            else:
                if node.right is None:
                    node.right = _Node(point=point, axis=(depth + 1) % self._k)
                    return
                node = node.right
            depth += 1

    def nearest(self, query: Point) -> Optional[Point]:
        """Return the point in the tree closest to `query` (Euclidean)."""
        if self._root is None:
            return None
        if len(query) != self._k:
            raise ValueError(f"expected {self._k}-dim query, got {len(query)}-dim")
        best = [self._root.point, _squared_distance(query, self._root.point)]
        self._nearest(self._root, query, best)
        return best[0]

    def _nearest(self, node: Optional[_Node], query: Point, best: list) -> None:
        if node is None:
            return
        d = _squared_distance(query, node.point)
        if d < best[1]:
            best[0] = node.point
            best[1] = d

        diff = query[node.axis] - node.point[node.axis]
        near = node.left if diff < 0 else node.right
        far = node.right if diff < 0 else node.left

        self._nearest(near, query, best)
        # Only recurse into `far` if the splitting plane could hide a closer point.
        if diff * diff < best[1]:
            self._nearest(far, query, best)

    def range_search(self, lower: Point, upper: Point) -> List[Point]:
        """Return all points `p` with lower[i] <= p[i] <= upper[i] for every axis."""
        if self._root is None:
            return []
        if len(lower) != self._k or len(upper) != self._k:
            raise ValueError(f"bounds must be {self._k}-dim")
        result: List[Point] = []
        self._range(self._root, lower, upper, result)
        return result

    def _range(self, node: Optional[_Node], lo: Point, hi: Point,
               out: List[Point]) -> None:
        if node is None:
            return
        p = node.point
        if all(lo[i] <= p[i] <= hi[i] for i in range(self._k)):
            out.append(p)
        if lo[node.axis] <= p[node.axis]:
            self._range(node.left, lo, hi, out)
        if hi[node.axis] >= p[node.axis]:
            self._range(node.right, lo, hi, out)


if __name__ == "__main__":
    pts = [(7, 2), (5, 4), (9, 6), (2, 3), (4, 7), (8, 1)]
    tree = KDTree(pts)
    print(f"Nearest to (6, 5): {tree.nearest((6, 5))}")
    print(f"In rect (3,3) to (8,7): {tree.range_search((3, 3), (8, 7))}")
