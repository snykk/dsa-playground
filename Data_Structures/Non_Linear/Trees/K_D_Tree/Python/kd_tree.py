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
        best_point = self._root.point
        best_dist = _squared_distance(query, best_point)

        # Explicit stack (a degenerate tree built by sorted inserts can be
        # thousands of levels deep). Entries are (node, bound): bound is None
        # for a near child, or the squared distance to the splitting plane for
        # a far child, which is only visited if the plane could hide a closer point.
        stack: List[Tuple[_Node, Optional[float]]] = [(self._root, None)]
        while stack:
            node, bound = stack.pop()
            if bound is not None and bound >= best_dist:
                continue
            d = _squared_distance(query, node.point)
            if d < best_dist:
                best_point = node.point
                best_dist = d

            diff = query[node.axis] - node.point[node.axis]
            near = node.left if diff < 0 else node.right
            far = node.right if diff < 0 else node.left
            if far is not None:
                stack.append((far, diff * diff))
            if near is not None:
                stack.append((near, None))
        return best_point

    def range_search(self, lower: Point, upper: Point) -> List[Point]:
        """Return all points `p` with lower[i] <= p[i] <= upper[i] for every axis."""
        if self._root is None:
            return []
        if len(lower) != self._k or len(upper) != self._k:
            raise ValueError(f"bounds must be {self._k}-dim")
        result: List[Point] = []
        stack: List[_Node] = [self._root]
        while stack:
            node = stack.pop()
            p = node.point
            if all(lower[i] <= p[i] <= upper[i] for i in range(self._k)):
                result.append(p)
            # push right first so the left subtree is visited first
            if upper[node.axis] >= p[node.axis] and node.right is not None:
                stack.append(node.right)
            if lower[node.axis] <= p[node.axis] and node.left is not None:
                stack.append(node.left)
        return result


if __name__ == "__main__":
    pts = [(7, 2), (5, 4), (9, 6), (2, 3), (4, 7), (8, 1)]
    tree = KDTree(pts)
    print(f"Nearest to (6, 5): {tree.nearest((6, 5))}")
    print(f"In rect (3,3) to (8,7): {tree.range_search((3, 3), (8, 7))}")
