class LazySegmentTree:
    """Segment Tree with Lazy Propagation for range sum queries and range updates.

    Supports:
    - Range sum query: O(log n)
    - Range update (add value to range): O(log n)

    Lazy propagation defers updates to child nodes until they are needed,
    enabling efficient range updates without visiting every element.
    """

    def __init__(self, arr):
        """Initialize segment tree with lazy propagation from array.

        Args:
            arr: Input array of integers
        """
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        if self.n > 0:
            self._build(arr, 1, 0, self.n - 1)

    def _build(self, arr, node, start, end):
        """Build the segment tree recursively.

        Args:
            arr: Input array
            node: Current tree node index
            start: Start of current segment
            end: End of current segment
        """
        if start == end:
            self.tree[node] = arr[start]
        else:
            mid = (start + end) // 2
            self._build(arr, 2 * node, start, mid)
            self._build(arr, 2 * node + 1, mid + 1, end)
            self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def _push_down(self, node, start, end):
        """Propagate lazy values to children.

        Args:
            node: Current tree node index
            start: Start of current segment
            end: End of current segment
        """
        if self.lazy[node] != 0:
            mid = (start + end) // 2
            left_count = mid - start + 1
            right_count = end - mid

            self.tree[2 * node] += self.lazy[node] * left_count
            self.lazy[2 * node] += self.lazy[node]

            self.tree[2 * node + 1] += self.lazy[node] * right_count
            self.lazy[2 * node + 1] += self.lazy[node]

            self.lazy[node] = 0

    def update_range(self, left, right, val):
        """Add val to all elements in range [left, right] (inclusive, 0-indexed).

        Args:
            left: Left index (0-indexed)
            right: Right index (0-indexed, inclusive)
            val: Value to add to each element in range

        An empty tree has no node 1, so there is nothing to update.
        """
        if self.n == 0:
            return
        self._update_range(1, 0, self.n - 1, left, right, val)

    def _update_range(self, node, start, end, left, right, val):
        """Internal recursive range update.

        Args:
            node: Current tree node index
            start: Start of current segment
            end: End of current segment
            left: Left bound of update range
            right: Right bound of update range
            val: Value to add
        """
        if right < start or end < left:
            return
        if left <= start and end <= right:
            self.tree[node] += val * (end - start + 1)
            self.lazy[node] += val
            return
        self._push_down(node, start, end)
        mid = (start + end) // 2
        self._update_range(2 * node, start, mid, left, right, val)
        self._update_range(2 * node + 1, mid + 1, end, left, right, val)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, left, right):
        """Query sum in range [left, right] (inclusive, 0-indexed).

        Args:
            left: Left index (0-indexed)
            right: Right index (0-indexed, inclusive)

        Returns:
            Sum of elements in range [left, right] (0 for an empty tree)
        """
        if self.n == 0:
            return 0
        return self._query(1, 0, self.n - 1, left, right)

    def _query(self, node, start, end, left, right):
        """Internal recursive range query.

        Args:
            node: Current tree node index
            start: Start of current segment
            end: End of current segment
            left: Left bound of query range
            right: Right bound of query range

        Returns:
            Sum of elements in the queried range
        """
        if right < start or end < left:
            return 0
        if left <= start and end <= right:
            return self.tree[node]
        self._push_down(node, start, end)
        mid = (start + end) // 2
        left_sum = self._query(2 * node, start, mid, left, right)
        right_sum = self._query(2 * node + 1, mid + 1, end, left, right)
        return left_sum + right_sum
