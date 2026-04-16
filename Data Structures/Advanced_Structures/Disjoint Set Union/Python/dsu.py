"""
Disjoint Set Union (DSU) Data Structure

A standalone DSU focused on the data-structure perspective: core operations,
path compression, union by rank, component counting and enumeration.

For graph-algorithm applications (cycle detection, Kruskal's MST, etc.),
see Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/.
"""

from typing import Dict, List


class DSU:
    """
    Disjoint Set Union with path compression and union by rank.

    Elements are integers in the range [0, n).
    """

    def __init__(self, n: int):
        """
        Initialize n singleton sets {0}, {1}, ..., {n-1}.

        Args:
            n: Number of elements.

        Time:  O(n)
        Space: O(n)
        """
        self.parent = list(range(n))
        self.rank = [0] * n
        self.size = [1] * n
        self._count = n

    def find(self, x: int) -> int:
        """
        Return the representative (root) of the set containing x.

        Uses path compression: every node on the path from x to the root
        is re-pointed directly to the root.

        Args:
            x: Element to look up.

        Returns:
            Root of the set containing x.

        Time:  O(alpha(n)) amortized
        """
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        """
        Merge the sets containing x and y using union by rank.

        Args:
            x: First element.
            y: Second element.

        Returns:
            True if a merge occurred (x and y were in different sets),
            False if they were already in the same set.

        Time:  O(alpha(n)) amortized
        """
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return False

        # Attach the shorter tree under the taller tree.
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
            self.size[root_y] += self.size[root_x]
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
            self.size[root_x] += self.size[root_y]
        else:
            self.parent[root_y] = root_x
            self.size[root_x] += self.size[root_y]
            self.rank[root_x] += 1

        self._count -= 1
        return True

    def connected(self, x: int, y: int) -> bool:
        """
        Check whether x and y belong to the same set.

        Args:
            x: First element.
            y: Second element.

        Returns:
            True if x and y share the same root.

        Time:  O(alpha(n)) amortized
        """
        return self.find(x) == self.find(y)

    def get_component_count(self) -> int:
        """
        Return the current number of disjoint sets.

        Returns:
            Number of disjoint sets.

        Time:  O(1)
        """
        return self._count

    def get_components(self) -> Dict[int, List[int]]:
        """
        Return a mapping from each root to the list of elements in its set.

        Returns:
            Dict mapping root -> sorted list of member elements.

        Time:  O(n)
        """
        components: Dict[int, List[int]] = {}
        for i in range(len(self.parent)):
            root = self.find(i)
            if root not in components:
                components[root] = []
            components[root].append(i)
        return components

    def get_size(self, x: int) -> int:
        """
        Return the size of the set containing x.

        Args:
            x: Element to query.

        Returns:
            Number of elements in the set containing x.

        Time:  O(alpha(n)) amortized
        """
        return self.size[self.find(x)]


if __name__ == "__main__":
    dsu = DSU(6)
    print(f"Initial component count: {dsu.get_component_count()}")  # 6

    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(3, 4)
    print(f"After unions: count={dsu.get_component_count()}")  # 3
    print(f"connected(0,1)={dsu.connected(0, 1)}")  # True
    print(f"connected(0,2)={dsu.connected(0, 2)}")  # False
    print(f"size of set containing 2: {dsu.get_size(2)}")  # 3
    print(f"Components: {dsu.get_components()}")
