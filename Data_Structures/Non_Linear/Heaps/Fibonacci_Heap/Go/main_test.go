package main

import (
	"math"
	"math/rand"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"testing"
)

func TestInsertAndPeek(t *testing.T) {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Insert(7)
	if heap.Peek() != 3 {
		t.Errorf("Expected 3, got %d", heap.Peek())
	}
}

func TestExtractMin(t *testing.T) {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Insert(7)
	heap.Insert(1)

	if heap.ExtractMin() != 1 {
		t.Errorf("Expected 1, got %d", heap.ExtractMin())
	}
	if heap.ExtractMin() != 3 {
		t.Errorf("Expected 3, got %d", heap.ExtractMin())
	}
	if heap.ExtractMin() != 5 {
		t.Errorf("Expected 5, got %d", heap.ExtractMin())
	}
	if heap.ExtractMin() != 7 {
		t.Errorf("Expected 7, got %d", heap.ExtractMin())
	}
}

func TestIsEmpty(t *testing.T) {
	heap := NewFibonacciHeap()
	if !heap.IsEmpty() {
		t.Error("Expected empty heap")
	}
	heap.Insert(5)
	if heap.IsEmpty() {
		t.Error("Expected non-empty heap")
	}
}

func TestSize(t *testing.T) {
	heap := NewFibonacciHeap()
	if heap.Size() != 0 {
		t.Errorf("Expected size 0, got %d", heap.Size())
	}
	heap.Insert(5)
	heap.Insert(3)
	if heap.Size() != 2 {
		t.Errorf("Expected size 2, got %d", heap.Size())
	}
}

func TestClear(t *testing.T) {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Clear()
	if !heap.IsEmpty() {
		t.Error("Expected empty heap after clear")
	}
	if heap.Size() != 0 {
		t.Errorf("Expected size 0, got %d", heap.Size())
	}
}

func TestSingleElement(t *testing.T) {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	if heap.Peek() != 5 {
		t.Errorf("Expected 5, got %d", heap.Peek())
	}
	if heap.ExtractMin() != 5 {
		t.Errorf("Expected 5, got %d", heap.ExtractMin())
	}
	if !heap.IsEmpty() {
		t.Error("Expected empty heap")
	}
}

func TestMultipleExtracts(t *testing.T) {
	heap := NewFibonacciHeap()
	arr := []int{5, 3, 7, 1, 9, 2}
	for _, val := range arr {
		heap.Insert(val)
	}

	result := []int{}
	for !heap.IsEmpty() {
		result = append(result, heap.ExtractMin())
	}

	expected := []int{1, 2, 3, 5, 7, 9}
	if len(result) != len(expected) {
		t.Errorf("Expected length %d, got %d", len(expected), len(result))
	}
	for i := range expected {
		if result[i] != expected[i] {
			t.Errorf("Expected %d, got %d", expected[i], result[i])
		}
	}
}

func TestScaleWithDuplicatesAndNegatives(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	heap := NewFibonacciHeap()
	vals := make([]int, 2000)
	for i := range vals {
		vals[i] = rng.Intn(501) - 250
		heap.Insert(vals[i])
	}
	sort.Ints(vals)
	for i, want := range vals {
		if got := heap.ExtractMin(); got != want {
			t.Fatalf("extract %d: expected %d, got %d", i, want, got)
		}
	}
	if !heap.IsEmpty() {
		t.Error("expected empty heap")
	}
}

func TestEmptyHeapPanics(t *testing.T) {
	heap := NewFibonacciHeap()
	for name, f := range map[string]func(){"Peek": func() { heap.Peek() }, "ExtractMin": func() { heap.ExtractMin() }} {
		func() {
			defer func() {
				if recover() == nil {
					t.Errorf("%s on empty heap should panic", name)
				}
			}()
			f()
		}()
	}
}

// Regression: after consolidation the new minimum is the first smallest root in
// Python's degree_table insertion order, where a degree that is deleted and stored
// again moves to the end. Here degree 0 holds 3, is deleted when 3 is linked under
// the second 2 (degree 1 is stored), then holds the first 2 again: the order is
// {1, 0}, so Python picks the 2 of degree 1. Ranging over the Go map picked either
// 2 at random, so the test repeats the run.
func TestConsolidateTieFollowsPythonOrder(t *testing.T) {
	for run := 0; run < 200; run++ {
		heap := NewFibonacciHeap()
		for _, k := range []int{1, 2, 2, 3} {
			heap.Insert(k)
		}
		if got := heap.ExtractMin(); got != 1 {
			t.Fatalf("run %d: expected 1, got %d", run, got)
		}
		// Python: root list from min_node is [(2, degree 1, child 3), (2, degree 0)]
		m := heap.minNode
		if m.key != 2 || m.degree != 1 || m.child == nil || m.child.key != 3 {
			t.Fatalf("run %d: min_node should be the 2 of degree 1 with child 3, got key %d degree %d", run, m.key, m.degree)
		}
		if r := m.right; r.key != 2 || r.degree != 0 || r.right != m {
			t.Fatalf("run %d: the next root should be the 2 of degree 0, got key %d degree %d", run, r.key, r.degree)
		}
	}
}

/* ---------- helpers: the dump format and the invariants of the Python tests ---------- */

func ringOf(start *FibonacciHeapNode) []*FibonacciHeapNode {
	out := []*FibonacciHeapNode{}
	if start == nil {
		return out
	}
	for current := start; ; {
		out = append(out, current)
		current = current.right
		if current == start {
			return out
		}
	}
}

// show writes a tree as text: key, * when marked, then the children in ring order.
func show(node *FibonacciHeapNode) string {
	text := strconv.Itoa(node.key)
	if node.marked {
		text += "*"
	}
	children := ringOf(node.child)
	if len(children) > 0 {
		parts := make([]string, len(children))
		for i, c := range children {
			parts[i] = show(c)
		}
		text += "(" + strings.Join(parts, " ") + ")"
	}
	return text
}

// dump writes the root list from minNode, one tree per entry.
func dump(h *FibonacciHeap) string {
	roots := ringOf(h.minNode)
	parts := make([]string, len(roots))
	for i, r := range roots {
		parts[i] = show(r)
	}
	return strings.Join(parts, ", ")
}

func fib(n int) int {
	a, b := 0, 1
	for i := 0; i < n; i++ {
		a, b = b, a+b
	}
	return a
}

func markedCount(h *FibonacciHeap) int {
	total := 0
	rings := []*FibonacciHeapNode{}
	if h.minNode != nil {
		rings = append(rings, h.minNode)
	}
	for len(rings) > 0 {
		start := rings[len(rings)-1]
		rings = rings[:len(rings)-1]
		for _, n := range ringOf(start) {
			if n.marked {
				total++
			}
			if n.child != nil {
				rings = append(rings, n.child)
			}
		}
	}
	return total
}

// checkTree returns the subtree size; it checks heap order, degrees and the F(d + 2) bound.
func checkTree(t *testing.T, node *FibonacciHeapNode, count int) int {
	t.Helper()
	if !node.inHeap {
		t.Fatalf("node %d in the heap is flagged as gone", node.key)
	}
	size := 1
	children := ringOf(node.child)
	if node.degree != len(children) {
		t.Fatalf("node %d: degree %d but %d children", node.key, node.degree, len(children))
	}
	for _, c := range children {
		if c.parent != node || c.right.left != c || c.key < node.key {
			t.Fatalf("child %d of %d breaks a link or the heap order", c.key, node.key)
		}
		size += checkTree(t, c, count)
	}
	if size < fib(node.degree+2) {
		t.Fatalf("node %d of degree %d has only %d nodes", node.key, node.degree, size)
	}
	phi := (1 + math.Sqrt(5)) / 2
	if float64(node.degree) > math.Log(float64(count))/math.Log(phi)+1e-9 {
		t.Fatalf("node %d: degree %d above log_phi(%d)", node.key, node.degree, count)
	}
	return size
}

func checkInvariants(t *testing.T, h *FibonacciHeap) {
	t.Helper()
	if h.minNode == nil {
		if h.count != 0 {
			t.Fatalf("empty root list but count %d", h.count)
		}
		return
	}
	total := 0
	for _, root := range ringOf(h.minNode) {
		if root.right.left != root || root.left.right != root || root.parent != nil {
			t.Fatalf("root %d: broken root list", root.key)
		}
		if root.marked {
			t.Fatalf("root %d is marked", root.key)
		}
		if h.minNode.key > root.key {
			t.Fatalf("min_node %d above root %d", h.minNode.key, root.key)
		}
		total += checkTree(t, root, h.count)
	}
	if total != h.count {
		t.Fatalf("%d nodes but count %d", total, h.count)
	}
}

// panicOf runs f and returns its panic message, or "" when it did not panic.
func panicOf(f func()) (msg string) {
	defer func() {
		if r := recover(); r != nil {
			msg = r.(string)
		}
	}()
	f()
	return ""
}

const stale = "stale handle: the node is no longer in a heap"

func expectDump(t *testing.T, h *FibonacciHeap, want string) {
	t.Helper()
	if got := dump(h); got != want {
		t.Fatalf("root list %q, want %q", got, want)
	}
}

func insertAll(h *FibonacciHeap, keys ...int) []*FibonacciHeapNode {
	out := make([]*FibonacciHeapNode, len(keys))
	for i, k := range keys {
		out[i] = h.Insert(k)
	}
	return out
}

func zeroToN(n int) []int {
	out := make([]int, n)
	for i := range out {
		out[i] = i
	}
	return out
}

func drain(h *FibonacciHeap) []int {
	out := []int{}
	for !h.IsEmpty() {
		out = append(out, h.ExtractMin())
	}
	return out
}

/* ---------- handles ---------- */

func TestHandles(t *testing.T) {
	heap := NewFibonacciHeap()
	h := heap.Insert(1)
	heap.Insert(2)
	if h.Key() != 1 || !h.InHeap() {
		t.Fatal("a fresh handle holds its key and is in the heap")
	}
	if heap.ExtractMin() != 1 || h.InHeap() {
		t.Fatal("an extracted handle is stale")
	}
	if panicOf(func() { heap.DecreaseKey(h, 0) }) != stale || panicOf(func() { heap.Delete(h) }) != stale {
		t.Fatal("a stale handle must be rejected")
	}
	if heap.Size() != 1 || heap.Peek() != 2 {
		t.Fatal("rejected calls must change nothing")
	}
	d := heap.Insert(4)
	heap.Delete(d)
	if d.InHeap() || panicOf(func() { heap.Delete(d) }) != stale {
		t.Fatal("a deleted handle is stale")
	}
	var empty *FibonacciHeapNode
	if empty.InHeap() || panicOf(func() { heap.DecreaseKey(empty, 0) }) != stale || panicOf(func() { empty.Key() }) != "empty handle" {
		t.Fatal("a nil handle is rejected like a stale one")
	}
}

func TestClearMakesEveryHandleStale(t *testing.T) {
	heap := NewFibonacciHeap()
	hs := insertAll(heap, zeroToN(10)...)
	heap.ExtractMin()
	heap.DecreaseKey(hs[9], -1)
	heap.Clear()
	for _, h := range hs {
		if h.InHeap() {
			t.Fatalf("handle %d survived Clear", h.Key())
		}
	}
	if panicOf(func() { heap.DecreaseKey(hs[5], 0) }) != stale {
		t.Fatal("a cleared handle is stale")
	}
	heap.Insert(3)
	if heap.Peek() != 3 {
		t.Fatal("the heap is usable after Clear")
	}
}

/* ---------- DecreaseKey ---------- */

func TestDecreaseKeyErrorsAndEqualKey(t *testing.T) {
	heap := NewFibonacciHeap()
	hs := insertAll(heap, 5, 3, 7)
	before := dump(heap)
	if panicOf(func() { heap.DecreaseKey(hs[1], 4) }) != "new key is greater than the current key" {
		t.Fatal("a larger key must panic")
	}
	if hs[1].Key() != 3 || dump(heap) != before {
		t.Fatal("a rejected DecreaseKey must change nothing")
	}
	heap.DecreaseKey(hs[2], 1)
	if heap.minNode != hs[2] || heap.CutCount() != 0 {
		t.Fatal("a decreased root becomes minNode without a cut")
	}
	heap.DecreaseKey(hs[0], 1)
	if heap.minNode != hs[2] {
		t.Fatal("on a tie the earlier minimum stays")
	}

	tree := NewFibonacciHeap()
	ts := insertAll(tree, zeroToN(9)...)
	tree.ExtractMin()
	tree.DecreaseKey(ts[8], 8)
	expectDump(t, tree, "1(2 5(6 7(8)) 3(4))")
	tree.DecreaseKey(ts[8], 7)
	expectDump(t, tree, "1(2 5(6 7(7)) 3(4))")
	if tree.CutCount() != 0 {
		t.Fatal("heap order held, so nothing is cut")
	}
}

func TestCascadingCutOnAHandBuiltTree(t *testing.T) {
	heap := NewFibonacciHeap()
	hs := insertAll(heap, zeroToN(9)...)
	if heap.ExtractMin() != 0 {
		t.Fatal("expected 0")
	}
	expectDump(t, heap, "1(2 5(6 7(8)) 3(4))")
	heap.DecreaseKey(hs[8], 0)
	expectDump(t, heap, "0, 1(2 5(6 7*) 3(4))")
	heap.DecreaseKey(hs[6], 3)
	expectDump(t, heap, "0, 3, 1(2 5*(7*) 3(4))")
	heap.DecreaseKey(hs[7], 1)
	expectDump(t, heap, "0, 5, 1, 3, 1(2 3(4))")
	if heap.CutCount() != 4 {
		t.Fatalf("expected 4 cuts, got %d", heap.CutCount())
	}
	checkInvariants(t, heap)
	if got := drain(heap); !reflect.DeepEqual(got, []int{0, 1, 1, 2, 3, 3, 4, 5}) {
		t.Fatalf("drained %v", got)
	}

	deep := NewFibonacciHeap()
	ds := insertAll(deep, zeroToN(17)...)
	deep.ExtractMin()
	deep.DecreaseKey(ds[16], 0)
	deep.DecreaseKey(ds[14], 0)
	deep.DecreaseKey(ds[10], 0)
	expectDump(t, deep, "0, 0, 0, 1(2 9*(13*(15*) 11(12)) 5(6 7(8)) 3(4))")
	deep.DecreaseKey(ds[15], 0)
	expectDump(t, deep, "0, 9(11(12)), 13, 0, 0, 0, 1(2 5(6 7(8)) 3(4))")
	if deep.CutCount() != 6 || markedCount(deep) != 0 {
		t.Fatalf("expected 6 cuts and no marks, got %d and %d", deep.CutCount(), markedCount(deep))
	}
	checkInvariants(t, deep)
}

func TestANodeThatBecomesARootLosesItsMark(t *testing.T) {
	heap := NewFibonacciHeap()
	hs := insertAll(heap, zeroToN(9)...)
	heap.ExtractMin()
	heap.DecreaseKey(hs[6], -1)
	if !hs[5].marked || heap.ExtractMin() != -1 {
		t.Fatal("5 is marked once 6 is cut")
	}
	expectDump(t, heap, "1(2 5*(7(8)) 3(4))")
	if heap.ExtractMin() != 1 {
		t.Fatal("expected 1")
	}
	expectDump(t, heap, "2, 3(4 5(7(8)))")
	if hs[5].marked {
		t.Fatal("a promoted node loses its mark")
	}
	checkInvariants(t, heap)
}

/* ---------- Delete ---------- */

func TestDelete(t *testing.T) {
	heap := NewFibonacciHeap()
	hs := insertAll(heap, zeroToN(9)...)
	heap.ExtractMin()
	heap.Delete(hs[4])
	expectDump(t, heap, "1(2 5(6 7(8)) 3*)")
	heap.Delete(hs[1])
	expectDump(t, heap, "2(3), 5(6 7(8))")
	heap.Delete(hs[7])
	expectDump(t, heap, "2(3 5(6)), 8")
	checkInvariants(t, heap)

	cascade := NewFibonacciHeap()
	cs := insertAll(cascade, zeroToN(9)...)
	cascade.ExtractMin()
	cascade.DecreaseKey(cs[6], 0)
	expectDump(t, cascade, "0, 1(2 5*(7(8)) 3(4))")
	cascade.Delete(cs[7])
	expectDump(t, cascade, "0(8), 5, 1(2 3(4))")
	if cascade.CutCount() != 3 {
		t.Fatalf("expected 3 cuts, got %d", cascade.CutCount())
	}
	checkInvariants(t, cascade)

	one := NewFibonacciHeap()
	one.Delete(one.Insert(42))
	if !one.IsEmpty() || one.Size() != 0 {
		t.Fatal("deleting the only node empties the heap")
	}

	dup := NewFibonacciHeap()
	d := insertAll(dup, 4, 4, 4)
	dup.Delete(d[1])
	expectDump(t, dup, "4(4)")
	if dup.minNode != d[2] || dup.ExtractMin() != 4 || d[2].InHeap() || !d[0].InHeap() {
		t.Fatal("with equal keys the tie rules decide which node is extracted")
	}
}

/* ---------- Merge ---------- */

func TestMerge(t *testing.T) {
	heap, other := NewFibonacciHeap(), NewFibonacciHeap()
	mine := insertAll(heap, 5, 3, 7)
	theirs := insertAll(other, 4, 1, 6)
	heap.Merge(other)
	expectDump(t, heap, "1, 6, 4, 7, 5, 3")
	if heap.Size() != 6 || !other.IsEmpty() || other.Size() != 0 {
		t.Fatal("Merge moves every node and empties other")
	}
	heap.DecreaseKey(theirs[2], 0)
	heap.Delete(mine[0])
	if got := drain(heap); !reflect.DeepEqual(got, []int{0, 1, 3, 4, 7}) {
		t.Fatalf("drained %v", got)
	}
	other.Insert(9)
	if other.Peek() != 9 {
		t.Fatal("other is usable after Merge")
	}

	tie, tie2 := NewFibonacciHeap(), NewFibonacciHeap()
	first := tie.Insert(2)
	tie2.Insert(2)
	tie.Merge(tie2)
	if tie.minNode != first {
		t.Fatal("on a tie the earlier minimum stays")
	}

	e1, e2 := NewFibonacciHeap(), NewFibonacciHeap()
	e1.Merge(e2)
	if !e1.IsEmpty() {
		t.Fatal("two empty heaps make an empty heap")
	}
	h := e2.Insert(3)
	e1.Merge(e2)
	if e1.minNode != h || e1.Size() != 1 {
		t.Fatal("merging into an empty heap takes other's minimum")
	}
	if panicOf(func() { e1.Merge(e1) }) != "cannot merge a heap with itself" || e1.Size() != 1 {
		t.Fatal("merging a heap with itself must panic and change nothing")
	}
}

/* ---------- the same results in all three languages ---------- */

type scriptOp struct {
	kind string
	a, b int
	keys []int
}

// The script and the strings of the Python test test_pinned_script.
func TestPinnedScript(t *testing.T) {
	script := []scriptOp{}
	for _, k := range []int{5, 3, 7, 1, 9, 2, 8, 6, 4, 0} {
		script = append(script, scriptOp{kind: "insert", a: k})
	}
	script = append(script,
		scriptOp{kind: "extract"}, scriptOp{kind: "decrease", a: 4, b: 0}, scriptOp{kind: "decrease", a: 6, b: 2},
		scriptOp{kind: "decrease", a: 0, b: 5}, scriptOp{kind: "decrease", a: 1, b: 4}, scriptOp{kind: "delete", a: 2},
		scriptOp{kind: "merge", keys: []int{4, 1, 10}}, scriptOp{kind: "extract"}, scriptOp{kind: "delete", a: 11},
		scriptOp{kind: "decrease", a: 12, b: -1}, scriptOp{kind: "extract"}, scriptOp{kind: "decrease", a: 7, b: -2},
		scriptOp{kind: "delete", a: 8}, scriptOp{kind: "extract"}, scriptOp{kind: "delete", a: 9}, scriptOp{kind: "peek"},
		scriptOp{kind: "delete", a: 0}, scriptOp{kind: "merge"}, scriptOp{kind: "merge", keys: []int{1}},
	)
	for i := 0; i < 7; i++ {
		script = append(script, scriptOp{kind: "extract"})
	}
	pinned := []string{
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
	}
	if len(script) != len(pinned) {
		t.Fatalf("%d steps but %d pinned lines", len(script), len(pinned))
	}
	heap := NewFibonacciHeap()
	handles := []*FibonacciHeapNode{}
	for i, op := range script {
		result := "-"
		msg := panicOf(func() {
			switch op.kind {
			case "insert":
				handles = append(handles, heap.Insert(op.a))
			case "extract":
				result = strconv.Itoa(heap.ExtractMin())
			case "peek":
				result = strconv.Itoa(heap.Peek())
			case "decrease":
				heap.DecreaseKey(handles[op.a], op.b)
			case "delete":
				heap.Delete(handles[op.a])
			default:
				other := NewFibonacciHeap()
				handles = append(handles, insertAll(other, op.keys...)...)
				heap.Merge(other)
			}
		})
		if msg == "Heap is empty" {
			result = "IndexError" // Python's name for the same error
		} else if msg != "" {
			result = "ValueError"
		}
		live := ""
		for _, h := range handles {
			if h.InHeap() {
				live += "1"
			} else {
				live += "0"
			}
		}
		if line := result + " | " + dump(heap) + " | " + live; line != pinned[i] {
			t.Fatalf("step %d: %q, want %q", i, line, pinned[i])
		}
		checkInvariants(t, heap)
	}
}

/* ---------- long random runs ---------- */

// randomRun runs every operation against a sorted slice of the live keys and returns how many
// times it cleared.
func randomRun(t *testing.T, seed int64, steps int, checkEveryStep bool) int {
	rng := rand.New(rand.NewSource(seed))
	clears := 0
	heap := NewFibonacciHeap()
	live := []*FibonacciHeapNode{}
	staleHandles := []*FibonacciHeapNode{}
	ref := []int{}
	refInsert := func(k int) {
		i := sort.SearchInts(ref, k)
		ref = append(ref, 0)
		copy(ref[i+1:], ref[i:])
		ref[i] = k
	}
	refRemove := func(k int) {
		i := sort.SearchInts(ref, k)
		ref = append(ref[:i], ref[i+1:]...)
	}
	extractAndCheck := func() {
		want := ref[0]
		got := heap.ExtractMin()
		if got != want {
			t.Fatalf("ExtractMin %d, want %d", got, want)
		}
		refRemove(got)
		gone := -1
		for i, h := range live {
			if !h.InHeap() {
				if gone != -1 {
					t.Fatal("two handles left the heap")
				}
				gone = i
			}
		}
		if gone < 0 || live[gone].Key() != got {
			t.Fatal("the extracted handle must hold the returned key")
		}
		staleHandles = append(staleHandles, live[gone])
		live = append(live[:gone], live[gone+1:]...)
	}
	for step := 0; step < steps; step++ {
		r := rng.Float64()
		marksBefore := 0
		if checkEveryStep {
			marksBefore = markedCount(heap)
		}
		switch {
		case r < 0.35 || len(live) == 0:
			k := rng.Intn(2001) - 1000
			live = append(live, heap.Insert(k))
			refInsert(k)
		case r < 0.55:
			h := live[rng.Intn(len(live))]
			old := h.Key()
			k := old - rng.Intn(301)
			heap.DecreaseKey(h, k)
			refRemove(old)
			refInsert(k)
		case r < 0.65:
			i := rng.Intn(len(live))
			refRemove(live[i].Key())
			heap.Delete(live[i])
			if live[i].InHeap() {
				t.Fatal("a deleted handle is stale")
			}
			staleHandles = append(staleHandles, live[i])
			live = append(live[:i], live[i+1:]...)
		case r < 0.85:
			extractAndCheck()
		case r < 0.93:
			other := NewFibonacciHeap()
			for n := rng.Intn(7); n > 0; n-- {
				k := rng.Intn(2001) - 1000
				live = append(live, other.Insert(k))
				refInsert(k)
			}
			heap.Merge(other)
			if !other.IsEmpty() {
				t.Fatal("Merge empties other")
			}
		case r < 0.97:
			h := live[rng.Intn(len(live))]
			if panicOf(func() { heap.DecreaseKey(h, h.Key()+1) }) != "new key is greater than the current key" {
				t.Fatal("a larger key must panic")
			}
		case r < 0.9995:
			if len(staleHandles) > 0 {
				h := staleHandles[rng.Intn(len(staleHandles))]
				if panicOf(func() { heap.DecreaseKey(h, -1000000) }) != stale || panicOf(func() { heap.Delete(h) }) != stale {
					t.Fatal("a stale handle must panic")
				}
			}
		default:
			heap.Clear()
			clears++
			if !heap.IsEmpty() {
				t.Fatal("Clear empties the heap")
			}
			for _, h := range live {
				if h.InHeap() {
					t.Fatal("Clear makes every handle stale")
				}
			}
			staleHandles = append(staleHandles, live...)
			live = []*FibonacciHeapNode{}
			ref = []int{}
		}
		if heap.Size() != len(ref) {
			t.Fatalf("size %d, want %d", heap.Size(), len(ref))
		}
		if len(ref) > 0 && heap.Peek() != ref[0] {
			t.Fatalf("peek %d, want %d", heap.Peek(), ref[0])
		}
		if checkEveryStep {
			checkInvariants(t, heap)
			if markedCount(heap) > marksBefore+1 {
				t.Fatal("one operation marks at most one node")
			}
		}
	}
	for len(ref) > 0 {
		extractAndCheck()
	}
	if !heap.IsEmpty() {
		t.Fatal("expected an empty heap")
	}
	return clears
}

func TestRandomOperationsWithInvariantsAfterEach(t *testing.T) {
	clears := 0
	for _, seed := range []int64{1, 2, 3} {
		clears += randomRun(t, seed, 1500, true)
	}
	if clears == 0 {
		t.Fatal("the runs never called Clear")
	}
}

func TestLongRandomRun(t *testing.T) {
	for _, seed := range []int64{20261122, 99} {
		if randomRun(t, seed, 30000, false) == 0 {
			t.Fatalf("seed %d never called Clear", seed)
		}
	}
}

/* ---------- amortized cost, counted ---------- */

func TestAmortizedCostByCountingLinksAndCuts(t *testing.T) {
	phi := (1 + math.Sqrt(5)) / 2
	for _, n := range []int{1000, 4000, 16000} {
		rng := rand.New(rand.NewSource(int64(n)))
		heap := NewFibonacciHeap()
		hs := make([]*FibonacciHeapNode, n)
		for i := range hs {
			hs[i] = heap.Insert(rng.Intn(1000001))
		}
		heap.ExtractMin()
		decreases, deletes, extracts := 0, 0, 1
		for !heap.IsEmpty() {
			h := hs[rng.Intn(n)]
			if !h.InHeap() {
				continue
			}
			r := rng.Float64()
			switch {
			case r < 0.6:
				heap.DecreaseKey(h, h.Key()-rng.Intn(1001))
				decreases++
			case r < 0.7:
				heap.Delete(h)
				deletes++
			default:
				heap.ExtractMin()
				extracts++
			}
		}
		if heap.CutCount() > 2*(decreases+deletes) {
			t.Fatalf("n=%d: %d cuts for %d decreases and deletes", n, heap.CutCount(), decreases+deletes)
		}
		maxDegree := int(math.Log(float64(n)) / math.Log(phi))
		if heap.LinkCount() > n+heap.CutCount()+(extracts+deletes)*maxDegree {
			t.Fatalf("n=%d: %d links above the bound", n, heap.LinkCount())
		}
	}
}
