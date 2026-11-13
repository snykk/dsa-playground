class RopeNode:
    """A node in the rope binary tree.

    Leaf nodes store a non-empty string fragment in `data` (height 0).
    Internal nodes store `weight` (total length of left subtree)
    and pointers to `left` and `right` children.
    Every node caches its total `length` and its `height` (the longest
    path down to a leaf), so neither has to be recomputed by walking.
    """

    def __init__(self, data=None):
        self.left = None
        self.right = None
        self.data = data
        self.weight = len(data) if data else 0
        self.length = self.weight
        self.height = 0


def _length(node):
    """Compute total length of string stored in the subtree rooted at node."""
    return 0 if node is None else node.length


def _height(node):
    """Height of the subtree rooted at node (an empty tree has height -1)."""
    return -1 if node is None else node.height


def _make(left, right):
    """A new internal node over two non-empty subtrees, with its cached fields set."""
    parent = RopeNode()
    parent.left = left
    parent.right = right
    parent.weight = left.length
    parent.length = left.length + right.length
    parent.height = 1 + max(left.height, right.height)
    return parent


def _index(node, i):
    """Return the character at position i in the subtree rooted at node."""
    if node is None:
        raise IndexError("index out of range")
    if node.data is not None:
        if i < 0 or i >= len(node.data):
            raise IndexError("index out of range")
        return node.data[i]
    if i < node.weight:
        return _index(node.left, i)
    return _index(node.right, i - node.weight)


def _collect(node, parts):
    """In-order traversal to collect leaf strings."""
    if node is None:
        return
    if node.data is not None:
        parts.append(node.data)
        return
    _collect(node.left, parts)
    _collect(node.right, parts)


def _build(text, leaf_size=10):
    """Build a balanced rope tree from a string, splitting into leaf_size chunks."""
    if len(text) <= leaf_size:
        return RopeNode(text)
    mid = len(text) // 2
    return _make(_build(text[:mid], leaf_size), _build(text[mid:], leaf_size))


def _split(node, i):
    """Split the subtree at position i, returning (left_tree, right_tree).

    The pieces are put back together with _join, so both stay balanced.
    The original tree is not modified.
    """
    if node is None:
        return (None, None)

    if node.data is not None:
        if i <= 0:
            return (None, node)
        if i >= len(node.data):
            return (node, None)
        return (RopeNode(node.data[:i]), RopeNode(node.data[i:]))

    if i < node.weight:
        left_part, right_part = _split(node.left, i)
        return (left_part, _join(right_part, node.right))

    if i > node.weight:
        left_part, right_part = _split(node.right, i - node.weight)
        return (_join(node.left, left_part), right_part)

    # i == node.weight
    return (node.left, node.right)


def _join(left, right):
    """Concatenate two rope subtrees, keeping the heights of siblings within 1.

    Like AVL join: if one side is more than one level taller, walk down its
    spine until the heights match, then rebalance with rotations on the way up.
    Costs O(|height(left) - height(right)| + 1).
    """
    if left is None:
        return right
    if right is None:
        return left
    if left.height > right.height + 1:
        return _join_right(left, right)
    if right.height > left.height + 1:
        return _join_left(left, right)
    return _make(left, right)


def _join_right(left, right):
    """left is taller: attach right somewhere down left's right spine."""
    joined = _join(left.right, right)
    if joined.height <= left.left.height + 1:
        return _make(left.left, joined)
    # joined is two levels taller than left.left: rotate it up
    if joined.left.height <= joined.right.height:
        return _make(_make(left.left, joined.left), joined.right)
    return _make(
        _make(left.left, joined.left.left),
        _make(joined.left.right, joined.right),
    )


def _join_left(left, right):
    """right is taller: attach left somewhere down right's left spine."""
    joined = _join(left, right.left)
    if joined.height <= right.right.height + 1:
        return _make(joined, right.right)
    if joined.right.height <= joined.left.height:
        return _make(joined.left, _make(joined.right, right.right))
    return _make(
        _make(joined.left, joined.right.left),
        _make(joined.right.right, right.right),
    )


class Rope:
    """Rope data structure for efficient string manipulation.

    A rope stores a string as a binary tree of fragments. Concatenation and
    splitting rebalance the tree (AVL-style join), so its height stays
    O(log n) and index, concat, split, insert and delete are O(log n)
    (plus the cost of building the inserted text). Positions count Python
    code points.
    """

    def __init__(self, text=""):
        if text:
            self._root = _build(text)
        else:
            self._root = None

    def index(self, i):
        """Return the character at position i."""
        return _index(self._root, i)

    def concat(self, other):
        """Concatenate this rope with another, returning a new Rope."""
        result = Rope()
        result._root = _join(self._root, other._root)
        return result

    def split(self, i):
        """Split the rope at position i, returning two new Ropes."""
        left_node, right_node = _split(self._root, i)
        left_rope = Rope()
        left_rope._root = left_node
        right_rope = Rope()
        right_rope._root = right_node
        return (left_rope, right_rope)

    def insert(self, i, text):
        """Insert text at position i."""
        left, right = self.split(i)
        middle = Rope(text)
        merged = left.concat(middle).concat(right)
        self._root = merged._root

    def delete(self, i, length):
        """Delete `length` characters starting at position i."""
        left, rest = self.split(i)
        _, right = rest.split(length)
        merged = left.concat(right)
        self._root = merged._root

    def to_string(self):
        """Collect all leaf fragments into a single string."""
        parts = []
        _collect(self._root, parts)
        return "".join(parts)

    def height(self):
        """Height of the tree (0 for a single leaf, -1 for an empty rope)."""
        return _height(self._root)

    def __len__(self):
        """Return total length of the string stored in this rope."""
        return _length(self._root)

    def __repr__(self):
        return f"Rope({self.to_string()!r})"
