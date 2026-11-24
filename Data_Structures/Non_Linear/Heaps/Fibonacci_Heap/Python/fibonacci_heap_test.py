import heapq
import math
import random
import unittest

from fibonacci_heap import FibonacciHeap, FibonacciHeapNode

PHI = (1 + 5 ** 0.5) / 2


def ring(start):
    """The nodes of a circular list, walking right from start."""
    out = []
    if start is None:
        return out
    current = start
    while True:
        out.append(current)
        current = current.right
        if current is start:
            return out


def show(node):
    """A tree as text: key, * when marked, then the children in ring order."""
    text = str(node.key) + ("*" if node.marked else "")
    children = ring(node.child)
    if children:
        text += "(" + " ".join(show(c) for c in children) + ")"
    return text


def dump(heap):
    """The root list from min_node, one tree per entry."""
    return ", ".join(show(r) for r in ring(heap.min_node))


def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


def marked_count(heap):
    total = 0
    stack = [heap.min_node] if heap.min_node else []
    while stack:
        for node in ring(stack.pop()):
            total += node.marked
            if node.child:
                stack.append(node.child)
    return total


def check_invariants(test, heap):
    """Heap order, degree bound, mark rules and the root list, for every node."""
    if heap.min_node is None:
        test.assertEqual(heap.count, 0)
        return
    total = 0
    for root in ring(heap.min_node):
        # The root list is a consistent circular doubly linked list of roots.
        test.assertIs(root.right.left, root)
        test.assertIs(root.left.right, root)
        test.assertIsNone(root.parent)
        test.assertFalse(root.marked, "a root is never marked")
        test.assertLessEqual(heap.min_node.key, root.key)
        total += check_tree(test, heap, root)
    test.assertEqual(total, heap.count)


def check_tree(test, heap, root):
    """Checks one tree without recursion; returns its number of nodes."""
    order = []
    stack = [root]
    while stack:
        node = stack.pop()
        order.append(node)
        test.assertTrue(node.in_heap)
        children = ring(node.child)
        test.assertEqual(node.degree, len(children))
        for child in children:
            test.assertIs(child.parent, node)
            test.assertIs(child.right.left, child)
            test.assertGreaterEqual(child.key, node.key, "heap order")
            stack.append(child)
    size = {}
    for node in reversed(order):
        size[node] = 1 + sum(size[c] for c in ring(node.child))
        # The lemma behind the name: degree d means at least F(d + 2) nodes,
        # so no degree exceeds log_phi(n).
        test.assertGreaterEqual(size[node], fibonacci(node.degree + 2))
        test.assertLessEqual(node.degree, math.log(heap.count, PHI) + 1e-9)
    return size[root]


class TestFibonacciHeap(unittest.TestCase):
    def setUp(self):
        self.heap = FibonacciHeap()

    def test_insert_and_peek(self):
        self.heap.insert(5)
        self.heap.insert(3)
        self.heap.insert(7)
        self.assertEqual(self.heap.peek(), 3)

    def test_extract_min(self):
        self.heap.insert(5)
        self.heap.insert(3)
        self.heap.insert(7)
        self.heap.insert(1)

        self.assertEqual(self.heap.extract_min(), 1)
        self.assertEqual(self.heap.extract_min(), 3)
        self.assertEqual(self.heap.extract_min(), 5)
        self.assertEqual(self.heap.extract_min(), 7)

    def test_is_empty(self):
        self.assertTrue(self.heap.is_empty())
        self.heap.insert(5)
        self.assertFalse(self.heap.is_empty())

    def test_size(self):
        self.assertEqual(self.heap.size(), 0)
        self.heap.insert(5)
        self.heap.insert(3)
        self.assertEqual(self.heap.size(), 2)

    def test_clear(self):
        self.heap.insert(5)
        self.heap.insert(3)
        self.heap.clear()
        self.assertTrue(self.heap.is_empty())
        self.assertEqual(self.heap.size(), 0)

    def test_single_element(self):
        self.heap.insert(5)
        self.assertEqual(self.heap.peek(), 5)
        self.assertEqual(self.heap.extract_min(), 5)
        self.assertTrue(self.heap.is_empty())

    def test_empty_heap_operations(self):
        with self.assertRaises(IndexError):
            self.heap.peek()
        with self.assertRaises(IndexError):
            self.heap.extract_min()

    def test_multiple_extracts(self):
        arr = [5, 3, 7, 1, 9, 2]
        for val in arr:
            self.heap.insert(val)

        result = []
        while not self.heap.is_empty():
            result.append(self.heap.extract_min())

        self.assertEqual(result, [1, 2, 3, 5, 7, 9])

    def test_scale_with_duplicates_and_negatives(self):
        rng = random.Random(7)
        vals = [rng.randint(-250, 250) for _ in range(2000)]
        for v in vals:
            self.heap.insert(v)
        out = [self.heap.extract_min() for _ in range(len(vals))]
        self.assertEqual(out, sorted(vals))
        self.assertTrue(self.heap.is_empty())

    def test_interleaved_insert_extract(self):
        rng = random.Random(11)
        ref = []
        for _ in range(1500):
            if ref and rng.random() < 0.4:
                self.assertEqual(self.heap.extract_min(), heapq.heappop(ref))
            else:
                v = rng.randint(-50, 50)
                self.heap.insert(v)
                heapq.heappush(ref, v)
            self.assertEqual(self.heap.size(), len(ref))

    # ---------- handles ----------

    def test_insert_returns_a_handle(self):
        h = self.heap.insert(5)
        self.assertIsInstance(h, FibonacciHeapNode)
        self.assertEqual(h.key, 5)
        self.assertTrue(h.in_heap)
        self.assertEqual(repr(h), "FibonacciHeapNode(key=5)")

    def test_extracted_handle_is_stale(self):
        h = self.heap.insert(1)
        self.heap.insert(2)
        self.assertEqual(self.heap.extract_min(), 1)
        self.assertFalse(h.in_heap)
        with self.assertRaisesRegex(ValueError, "stale handle"):
            self.heap.decrease_key(h, 0)
        with self.assertRaisesRegex(ValueError, "stale handle"):
            self.heap.delete(h)
        # The rejected calls changed nothing.
        self.assertEqual(self.heap.size(), 1)
        self.assertEqual(self.heap.peek(), 2)

    def test_deleted_handle_is_stale(self):
        h = self.heap.insert(4)
        self.heap.insert(6)
        self.heap.delete(h)
        self.assertFalse(h.in_heap)
        with self.assertRaisesRegex(ValueError, "stale handle"):
            self.heap.delete(h)
        self.assertEqual(self.heap.size(), 1)

    def test_none_is_not_a_handle(self):
        self.heap.insert(1)
        with self.assertRaisesRegex(ValueError, "stale handle"):
            self.heap.decrease_key(None, 0)
        with self.assertRaisesRegex(ValueError, "stale handle"):
            self.heap.delete(None)
        self.assertEqual(self.heap.size(), 1)

    def test_clear_makes_every_handle_stale(self):
        handles = [self.heap.insert(k) for k in range(10)]
        self.heap.extract_min()
        self.heap.decrease_key(handles[9], -1)
        self.heap.clear()
        self.assertTrue(all(not h.in_heap for h in handles))
        with self.assertRaisesRegex(ValueError, "stale handle"):
            self.heap.decrease_key(handles[5], 0)
        self.heap.insert(3)
        self.assertEqual(self.heap.peek(), 3)

    # ---------- decrease_key ----------

    def test_decrease_key_rejects_a_larger_key(self):
        handles = [self.heap.insert(k) for k in (5, 3, 7)]
        before = dump(self.heap)
        with self.assertRaisesRegex(ValueError, "greater than the current key"):
            self.heap.decrease_key(handles[1], 4)
        self.assertEqual(handles[1].key, 3)
        self.assertEqual(dump(self.heap), before)

    def test_decrease_key_to_the_same_key_is_allowed(self):
        handles = [self.heap.insert(k) for k in range(9)]
        self.heap.extract_min()
        before = dump(self.heap)
        self.heap.decrease_key(handles[8], 8)
        self.assertEqual(dump(self.heap), before)
        self.assertEqual(self.heap.cut_count, 0)

    def test_decrease_key_of_a_root_moves_min_node(self):
        handles = [self.heap.insert(k) for k in (5, 3, 7)]
        self.heap.decrease_key(handles[2], 1)
        self.assertEqual(self.heap.peek(), 1)
        self.assertIs(self.heap.min_node, handles[2])
        self.assertEqual(self.heap.cut_count, 0)

    def test_decrease_key_keeps_the_earlier_of_equal_minimums(self):
        first = self.heap.insert(2)
        second = self.heap.insert(5)
        self.heap.decrease_key(second, 2)
        self.assertIs(self.heap.min_node, first)

    def test_decrease_key_that_keeps_heap_order_moves_nothing(self):
        handles = [self.heap.insert(k) for k in range(9)]
        self.heap.extract_min()
        self.assertEqual(dump(self.heap), "1(2 5(6 7(8)) 3(4))")
        self.heap.decrease_key(handles[8], 7)
        self.assertEqual(dump(self.heap), "1(2 5(6 7(7)) 3(4))")
        self.assertEqual(self.heap.cut_count, 0)

    def test_cascading_cut_on_a_hand_built_tree(self):
        handles = [self.heap.insert(k) for k in range(9)]
        self.assertEqual(self.heap.extract_min(), 0)
        # One binomial tree of degree 3.
        self.assertEqual(dump(self.heap), "1(2 5(6 7(8)) 3(4))")
        check_invariants(self, self.heap)

        # 8 -> 0 breaks heap order under 7: cut 8; 7 loses its first child and is marked.
        self.heap.decrease_key(handles[8], 0)
        self.assertEqual(dump(self.heap), "0, 1(2 5(6 7*) 3(4))")
        self.assertEqual(self.heap.cut_count, 1)
        check_invariants(self, self.heap)

        # 6 -> 3: cut 6 (it goes right after min_node); 5 is marked.
        self.heap.decrease_key(handles[6], 3)
        self.assertEqual(dump(self.heap), "0, 3, 1(2 5*(7*) 3(4))")
        self.assertEqual(self.heap.cut_count, 2)
        check_invariants(self, self.heap)

        # 7 -> 1: cut 7, which clears its mark. Its parent 5 was already marked,
        # so it has now lost two children: cut it as well (cascading cut). The
        # walk stops at 1, a root, which is never marked.
        self.heap.decrease_key(handles[7], 1)
        self.assertEqual(dump(self.heap), "0, 5, 1, 3, 1(2 3(4))")
        self.assertEqual(self.heap.cut_count, 4)
        self.assertFalse(handles[5].marked)
        self.assertFalse(handles[7].marked)
        check_invariants(self, self.heap)

        self.assertEqual([self.heap.extract_min() for _ in range(8)], [0, 1, 1, 2, 3, 3, 4, 5])

    def test_cascading_cut_climbs_several_levels(self):
        handles = [self.heap.insert(k) for k in range(17)]
        self.heap.extract_min()
        self.assertEqual(dump(self.heap), "1(2 9(10 13(14 15(16)) 11(12)) 5(6 7(8)) 3(4))")
        self.heap.decrease_key(handles[16], 0)
        self.heap.decrease_key(handles[14], 0)
        self.heap.decrease_key(handles[10], 0)
        self.assertEqual(dump(self.heap), "0, 0, 0, 1(2 9*(13*(15*) 11(12)) 5(6 7(8)) 3(4))")
        cuts = self.heap.cut_count
        # 15 -> 0: cut 15; 13 and 9 are marked, so both are cut too; 1 is a root.
        self.heap.decrease_key(handles[15], 0)
        self.assertEqual(self.heap.cut_count - cuts, 3)
        self.assertEqual(marked_count(self.heap), 0)
        self.assertEqual(dump(self.heap), "0, 9(11(12)), 13, 0, 0, 0, 1(2 5(6 7(8)) 3(4))")
        check_invariants(self, self.heap)

    def test_a_node_that_becomes_a_root_loses_its_mark(self):
        handles = [self.heap.insert(k) for k in range(9)]
        self.heap.extract_min()
        self.heap.decrease_key(handles[6], -1)
        self.assertTrue(handles[5].marked)
        self.assertEqual(self.heap.extract_min(), -1)
        self.assertEqual(dump(self.heap), "1(2 5*(7(8)) 3(4))")
        # Extracting 1 promotes its children: 5 becomes a root, unmarked, and
        # consolidation links it under 3, still unmarked.
        self.assertEqual(self.heap.extract_min(), 1)
        self.assertEqual(dump(self.heap), "2, 3(4 5(7(8)))")
        self.assertFalse(handles[5].marked)
        check_invariants(self, self.heap)

    # ---------- delete ----------

    def test_delete_a_leaf_the_minimum_and_an_inner_node(self):
        handles = [self.heap.insert(k) for k in range(9)]
        self.heap.extract_min()
        self.heap.delete(handles[4])          # a leaf: its parent 3 is marked
        self.assertEqual(dump(self.heap), "1(2 5(6 7(8)) 3*)")
        self.heap.delete(handles[1])          # the minimum, a root
        self.assertEqual(dump(self.heap), "2(3), 5(6 7(8))")
        self.heap.delete(handles[7])          # an inner node: its child 8 stays
        self.assertEqual(dump(self.heap), "2(3 5(6)), 8")
        check_invariants(self, self.heap)
        out = [self.heap.extract_min() for _ in range(self.heap.size())]
        self.assertEqual(out, [2, 3, 5, 6, 8])

    def test_delete_cuts_and_cascades(self):
        handles = [self.heap.insert(k) for k in range(9)]
        self.heap.extract_min()
        self.heap.decrease_key(handles[6], 0)
        self.assertEqual(dump(self.heap), "0, 1(2 5*(7(8)) 3(4))")
        # 7 is cut, and 5 has now lost two children: cut too.
        self.heap.delete(handles[7])
        self.assertEqual(dump(self.heap), "0(8), 5, 1(2 3(4))")
        self.assertEqual(self.heap.cut_count, 3)
        self.assertFalse(handles[7].in_heap)
        check_invariants(self, self.heap)
        out = [self.heap.extract_min() for _ in range(self.heap.size())]
        self.assertEqual(out, [0, 1, 2, 3, 4, 5, 8])

    def test_delete_the_only_node(self):
        h = self.heap.insert(42)
        self.heap.delete(h)
        self.assertTrue(self.heap.is_empty())
        self.assertEqual(self.heap.size(), 0)

    def test_delete_needs_no_minus_infinity(self):
        # Tuples have no smallest value, yet delete works: it never lowers the key.
        handles = {name: self.heap.insert((rank, name)) for rank, name in [(2, "b"), (1, "a"), (3, "c"), (0, "z")]}
        self.heap.extract_min()
        self.heap.delete(handles["c"])
        self.assertEqual(handles["c"].key, (3, "c"))
        self.assertEqual([self.heap.extract_min() for _ in range(2)], [(1, "a"), (2, "b")])

    def test_delete_with_duplicates_removes_that_node(self):
        a = self.heap.insert(4)
        b = self.heap.insert(4)
        c = self.heap.insert(4)
        self.heap.delete(b)
        self.assertTrue(a.in_heap and c.in_heap and not b.in_heap)
        # Consolidation met a, then c: on a tie the tree already in the table
        # (a) becomes the child, so c is the root and the next minimum.
        self.assertEqual(dump(self.heap), "4(4)")
        self.assertIs(self.heap.min_node, c)
        self.assertEqual(self.heap.extract_min(), 4)
        self.assertFalse(c.in_heap)
        self.assertTrue(a.in_heap)

    # ---------- merge ----------

    def test_merge_two_heaps(self):
        other = FibonacciHeap()
        mine = [self.heap.insert(k) for k in (5, 3, 7)]
        theirs = [other.insert(k) for k in (4, 1, 6)]
        self.heap.merge(other)
        # other's ring, from its min_node 1, lands right after min_node 3.
        self.assertEqual(dump(self.heap), "1, 6, 4, 7, 5, 3")
        self.assertEqual(self.heap.size(), 6)
        self.assertTrue(other.is_empty())
        self.assertEqual(other.size(), 0)
        # Handles from other now work on this heap.
        self.heap.decrease_key(theirs[2], 0)
        self.heap.delete(mine[0])
        self.assertEqual([self.heap.extract_min() for _ in range(5)], [0, 1, 3, 4, 7])
        # other is empty but still usable.
        other.insert(9)
        self.assertEqual(other.peek(), 9)

    def test_merge_keeps_the_earlier_minimum_on_a_tie(self):
        other = FibonacciHeap()
        mine = self.heap.insert(2)
        other.insert(2)
        self.heap.merge(other)
        self.assertIs(self.heap.min_node, mine)

    def test_merge_with_empty_heaps(self):
        other = FibonacciHeap()
        self.heap.merge(other)
        self.assertTrue(self.heap.is_empty())
        h = other.insert(3)
        self.heap.merge(other)
        self.assertIs(self.heap.min_node, h)
        self.heap.merge(FibonacciHeap())
        self.assertEqual(self.heap.size(), 1)

    def test_merge_with_itself_is_an_error(self):
        self.heap.insert(1)
        with self.assertRaisesRegex(ValueError, "itself"):
            self.heap.merge(self.heap)
        self.assertEqual(self.heap.size(), 1)

    def test_merge_is_constant_time(self):
        # Count every attribute write on the nodes during merge: four, whatever the sizes.
        writes = [0]

        class CountingNode(FibonacciHeapNode):
            def __setattr__(self, name, value):
                writes[0] += 1
                object.__setattr__(self, name, value)

        for size in (10, 1000):
            a, b = FibonacciHeap(), FibonacciHeap()
            nodes = [a.insert(k) for k in range(size)] + [b.insert(k) for k in range(size)]
            a.extract_min()
            b.extract_min()
            for n in nodes:
                n.__class__ = CountingNode
            writes[0] = 0
            a.merge(b)
            self.assertEqual(writes[0], 4)
            self.assertEqual(a.size(), 2 * size - 2)

    # ---------- the same results in all three languages ----------

    # Handles are numbered in insert order, merges included. Each step gives the
    # return value (or the exception), the root list from min_node (* = marked)
    # and which handles are still in the heap. The C++ and Go tests pin the
    # same strings.
    PINNED_SCRIPT = (
        [("insert", k) for k in (5, 3, 7, 1, 9, 2, 8, 6, 4, 0)]
        + [("extract",), ("decrease", 4, 0), ("decrease", 6, 2), ("decrease", 0, 5), ("decrease", 1, 4),
           ("delete", 2), ("merge", [4, 1, 10]), ("extract",), ("delete", 11), ("decrease", 12, -1),
           ("extract",), ("decrease", 7, -2), ("delete", 8), ("extract",), ("delete", 9), ("peek",),
           ("delete", 0), ("merge", []), ("merge", [1])]
        + [("extract",)] * 7
    )

    PINNED = [
        "- | 5 | 1",
        "- | 3, 5 | 11",
        "- | 3, 7, 5 | 111",
        "- | 1, 7, 5, 3 | 1111",
        "- | 1, 9, 7, 5, 3 | 11111",
        "- | 1, 2, 9, 7, 5, 3 | 111111",
        "- | 1, 8, 2, 9, 7, 5, 3 | 1111111",
        "- | 1, 6, 8, 2, 9, 7, 5, 3 | 11111111",
        "- | 1, 4, 6, 8, 2, 9, 7, 5, 3 | 111111111",
        "- | 0, 4, 6, 8, 2, 9, 7, 5, 3, 1 | 1111111111",
        "0 | 1, 2(8 3(5 7(9)) 4(6)) | 1111111110",
        "- | 0, 2(8 3(5 7*) 4(6)), 1 | 1111111110",
        "- | 0, 2(2 3(5 7*) 4(6)), 1 | 1111111110",
        "- | 0, 2(2 3(5 7*) 4(6)), 1 | 1111111110",
        "ValueError | 0, 2(2 3(5 7*) 4(6)), 1 | 1111111110",
        "- | 0(1), 2(2 3*(5) 4(6)) | 1101111110",
        "- | 0(1), 1, 10, 4, 2(2 3*(5) 4(6)) | 1101111110111",
        "0 | 1(1 4(10)), 2(2 3*(5) 4(6)) | 1101011110111",
        "- | 1, 2(2 3*(5) 4(6)), 4(10) | 1101011110101",
        "- | -1, 2(2 3*(5) 4(6)), 4, 1 | 1101011110101",
        "-1 | 1(4), 2(2 3*(5) 4(6)) | 1101011110100",
        "- | -2, 2(2 3*(5) 4*), 1(4) | 1101011110100",
        "- | -2, 2(2 3*(5)), 1(4) | 1101011100100",
        "-2 | 1(4), 2(2 3*(5)) | 1101011000100",
        "ValueError | 1(4), 2(2 3*(5)) | 1101011000100",
        "1 | 1(4), 2(2 3*(5)) | 1101011000100",
        "- | 1(4 2(2)), 3 | 0101011000100",
        "- | 1(4 2(2)), 3 | 0101011000100",
        "- | 1(4 2(2)), 1, 3 | 01010110001001",
        "1 | 1(4 2(2)), 3 | 01000110001001",
        "1 | 2(2 3(4)) | 01000110001000",
        "2 | 2, 3(4) | 01000010001000",
        "2 | 3(4) | 01000000001000",
        "3 | 4 | 00000000001000",
        "4 |  | 00000000000000",
        "IndexError |  | 00000000000000",
    ]

    def test_pinned_script(self):
        heap = FibonacciHeap()
        handles = []
        lines = []
        for op in self.PINNED_SCRIPT:
            result = "-"
            try:
                if op[0] == "insert":
                    handles.append(heap.insert(op[1]))
                elif op[0] == "extract":
                    result = str(heap.extract_min())
                elif op[0] == "peek":
                    result = str(heap.peek())
                elif op[0] == "decrease":
                    heap.decrease_key(handles[op[1]], op[2])
                elif op[0] == "delete":
                    heap.delete(handles[op[1]])
                else:
                    other = FibonacciHeap()
                    handles.extend(other.insert(k) for k in op[1])
                    heap.merge(other)
            except (IndexError, ValueError) as exc:
                result = type(exc).__name__
            live = "".join("1" if h.in_heap else "0" for h in handles)
            lines.append("%s | %s | %s" % (result, dump(heap), live))
            check_invariants(self, heap)
        self.assertEqual(lines, self.PINNED)

    # ---------- long random runs ----------

    def random_run(self, seed, steps, check_every_step):
        """Every operation against a lazy heapq reference; returns how many times it cleared."""
        rng = random.Random(seed)
        clears = 0
        heap = FibonacciHeap()
        live = {}            # handle -> key, for every node in the heap
        stale = []           # handles that left the heap
        ref = []             # heapq of (key, serial, handle); outdated entries are skipped
        serial = [0]

        def push(h, key):
            serial[0] += 1
            heapq.heappush(ref, (key, serial[0], h))

        def ref_min():
            while ref[0][2] not in live or live[ref[0][2]] != ref[0][0]:
                heapq.heappop(ref)
            return ref[0][0]

        def extract_and_check():
            expected = ref_min()
            before = list(live)
            got = heap.extract_min()
            self.assertEqual(got, expected)
            gone = [h for h in before if not h.in_heap]
            self.assertEqual(len(gone), 1)
            self.assertEqual(gone[0].key, got)
            del live[gone[0]]
            stale.append(gone[0])

        for _ in range(steps):
            r = rng.random()
            marks_before = marked_count(heap) if check_every_step else 0
            if r < 0.35 or not live:
                key = rng.randint(-1000, 1000)
                h = heap.insert(key)
                live[h] = key
                push(h, key)
            elif r < 0.55:
                h = rng.choice(list(live))
                key = live[h] - rng.randint(0, 300)
                heap.decrease_key(h, key)
                live[h] = key
                push(h, key)
            elif r < 0.65:
                h = rng.choice(list(live))
                heap.delete(h)
                self.assertFalse(h.in_heap)
                del live[h]
                stale.append(h)
            elif r < 0.85:
                extract_and_check()
            elif r < 0.93:
                other = FibonacciHeap()
                for _ in range(rng.randint(0, 6)):
                    key = rng.randint(-1000, 1000)
                    h = other.insert(key)
                    live[h] = key
                    push(h, key)
                heap.merge(other)
                self.assertTrue(other.is_empty())
            elif r < 0.97:
                h = rng.choice(list(live))
                with self.assertRaises(ValueError):
                    heap.decrease_key(h, live[h] + 1)
            elif r < 0.9995:
                if stale:
                    h = rng.choice(stale)
                    with self.assertRaises(ValueError):
                        heap.decrease_key(h, -10 ** 6)
                    with self.assertRaises(ValueError):
                        heap.delete(h)
            else:
                heap.clear()
                clears += 1
                self.assertTrue(heap.is_empty())
                self.assertTrue(all(not h.in_heap for h in live))
                stale.extend(live)
                live.clear()
                ref.clear()
            self.assertEqual(heap.size(), len(live))
            if live:
                self.assertEqual(heap.peek(), ref_min())
            if check_every_step:
                check_invariants(self, heap)
                # A decrease_key or delete marks at most one node; nothing else marks any.
                self.assertLessEqual(marked_count(heap), marks_before + 1)
                for h, key in live.items():
                    self.assertTrue(h.in_heap)
                    self.assertEqual(h.key, key)
        while live:
            extract_and_check()
        self.assertTrue(heap.is_empty())
        return clears

    def test_random_operations_with_invariants_after_each(self):
        clears = sum(self.random_run(seed, 1500, True) for seed in (1, 2, 3))
        self.assertGreater(clears, 0)

    def test_long_random_run_against_heapq(self):
        for seed in (20261122, 99):
            self.assertGreater(self.random_run(seed, 30000, False), 0)

    # ---------- amortized cost, counted ----------

    def test_amortized_cost_by_counting_links_and_cuts(self):
        for n in (1000, 4000, 16000):
            rng = random.Random(n)
            heap = FibonacciHeap()
            handles = [heap.insert(rng.randint(0, 10 ** 6)) for _ in range(n)]
            heap.extract_min()
            decreases = deletes = 0
            extracts = 1
            while not heap.is_empty():
                h = rng.choice(handles)
                if not h.in_heap:
                    continue
                r = rng.random()
                if r < 0.6:
                    heap.decrease_key(h, h.key - rng.randint(0, 1000))
                    decreases += 1
                elif r < 0.7:
                    heap.delete(h)
                    deletes += 1
                else:
                    heap.extract_min()
                    extracts += 1
            # Each decrease_key or delete cuts its own node and marks at most
            # one node, and the cascade cuts only marked nodes.
            self.assertLessEqual(heap.cut_count, 2 * (decreases + deletes))
            # A link removes one tree. Trees come from inserts, cuts and the
            # children an extraction promotes (at most log_phi(n) each).
            max_degree = int(math.log(n, PHI))
            self.assertLessEqual(heap.link_count, n + heap.cut_count + (extracts + deletes) * max_degree)

    # ---------- why decrease_key matters ----------

    def test_dijkstra_with_decrease_key(self):
        # The example of the topic README and the article.
        def dijkstra(graph, source):
            dist = {v: math.inf for v in graph}
            dist[source] = 0
            heap = FibonacciHeap()
            handle = {v: heap.insert((dist[v], v)) for v in graph}
            while not heap.is_empty():
                d, u = heap.extract_min()
                for v, w in graph[u]:
                    if d + w < dist[v]:
                        dist[v] = d + w
                        heap.decrease_key(handle[v], (dist[v], v))
            return dist

        graph = {
            "A": [("B", 4), ("C", 1)],
            "B": [("D", 1)],
            "C": [("B", 2), ("D", 5)],
            "D": [],
        }
        self.assertEqual(dijkstra(graph, "A"), {"A": 0, "B": 3, "C": 1, "D": 4})
        graph["E"] = []
        self.assertEqual(dijkstra(graph, "A")["E"], math.inf)


if __name__ == "__main__":
    unittest.main()
