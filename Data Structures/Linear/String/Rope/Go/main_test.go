package main

import (
	"math"
	"math/rand"
	"strings"
	"testing"
)

func TestCreateFromString(t *testing.T) {
	r := NewRope("Hello, World!")
	if r.ToString() != "Hello, World!" {
		t.Errorf("expected 'Hello, World!', got '%s'", r.ToString())
	}
	if r.Len() != 13 {
		t.Errorf("expected length 13, got %d", r.Len())
	}
}

func TestEmptyRope(t *testing.T) {
	r := NewRope("")
	if r.ToString() != "" {
		t.Errorf("expected empty string, got '%s'", r.ToString())
	}
	if r.Len() != 0 {
		t.Errorf("expected length 0, got %d", r.Len())
	}
}

func TestSingleChar(t *testing.T) {
	r := NewRope("A")
	if r.ToString() != "A" {
		t.Errorf("expected 'A', got '%s'", r.ToString())
	}
	ch, err := r.Index(0)
	if err != nil || ch != 'A' {
		t.Errorf("expected 'A' at index 0")
	}
}

func TestIndexAccess(t *testing.T) {
	r := NewRope("Hello, World!")
	tests := []struct {
		i    int
		want byte
	}{
		{0, 'H'}, {4, 'o'}, {7, 'W'}, {12, '!'},
	}
	for _, tt := range tests {
		ch, err := r.Index(tt.i)
		if err != nil || ch != tt.want {
			t.Errorf("Index(%d): expected '%c', got '%c' (err=%v)", tt.i, tt.want, ch, err)
		}
	}
}

func TestIndexOutOfBounds(t *testing.T) {
	r := NewRope("abc")
	_, err := r.Index(3)
	if err == nil {
		t.Errorf("expected error for index 3")
	}
	_, err = r.Index(-1)
	if err == nil {
		t.Errorf("expected error for index -1")
	}
}

func TestConcat(t *testing.T) {
	r1 := NewRope("Hello, ")
	r2 := NewRope("World!")
	r3 := r1.Concat(r2)
	if r3.ToString() != "Hello, World!" {
		t.Errorf("expected 'Hello, World!', got '%s'", r3.ToString())
	}
	if r3.Len() != 13 {
		t.Errorf("expected length 13, got %d", r3.Len())
	}
}

func TestConcatWithEmpty(t *testing.T) {
	r1 := NewRope("Hello")
	r2 := NewRope("")
	if r1.Concat(r2).ToString() != "Hello" {
		t.Errorf("concat with empty right failed")
	}
	if r2.Concat(r1).ToString() != "Hello" {
		t.Errorf("concat with empty left failed")
	}
}

func TestSplit(t *testing.T) {
	r := NewRope("Hello, World!")
	left, right := r.Split(7)
	if left.ToString() != "Hello, " {
		t.Errorf("split left: expected 'Hello, ', got '%s'", left.ToString())
	}
	if right.ToString() != "World!" {
		t.Errorf("split right: expected 'World!', got '%s'", right.ToString())
	}
}

func TestSplitAtBoundaries(t *testing.T) {
	r := NewRope("Hello")
	l1, r1 := r.Split(0)
	if l1.ToString() != "" || r1.ToString() != "Hello" {
		t.Errorf("split at 0 failed: '%s' | '%s'", l1.ToString(), r1.ToString())
	}
	l2, r2 := r.Split(5)
	if l2.ToString() != "Hello" || r2.ToString() != "" {
		t.Errorf("split at end failed: '%s' | '%s'", l2.ToString(), r2.ToString())
	}
}

func TestInsertInMiddle(t *testing.T) {
	r := NewRope("Hello World!")
	r.Insert(5, ",")
	if r.ToString() != "Hello, World!" {
		t.Errorf("expected 'Hello, World!', got '%s'", r.ToString())
	}
}

func TestInsertAtStartAndEnd(t *testing.T) {
	r := NewRope("World!")
	r.Insert(0, "Hello, ")
	if r.ToString() != "Hello, World!" {
		t.Errorf("insert at start: expected 'Hello, World!', got '%s'", r.ToString())
	}

	r2 := NewRope("Hello, ")
	r2.Insert(7, "World!")
	if r2.ToString() != "Hello, World!" {
		t.Errorf("insert at end: expected 'Hello, World!', got '%s'", r2.ToString())
	}
}

func TestDeleteSubstring(t *testing.T) {
	r := NewRope("Hello, World!")
	r.Delete(5, 2)
	if r.ToString() != "HelloWorld!" {
		t.Errorf("expected 'HelloWorld!', got '%s'", r.ToString())
	}
}

func TestDeleteFromStartAndEnd(t *testing.T) {
	r1 := NewRope("Hello, World!")
	r1.Delete(0, 7)
	if r1.ToString() != "World!" {
		t.Errorf("delete from start: expected 'World!', got '%s'", r1.ToString())
	}

	r2 := NewRope("Hello, World!")
	r2.Delete(5, 8)
	if r2.ToString() != "Hello" {
		t.Errorf("delete to end: expected 'Hello', got '%s'", r2.ToString())
	}
}

func TestLongString(t *testing.T) {
	text := ""
	for i := 0; i < 100; i++ {
		text += "abcdefghij"
	}
	r := NewRope(text)
	if r.Len() != 1000 {
		t.Errorf("expected length 1000, got %d", r.Len())
	}
	if r.ToString() != text {
		t.Errorf("long string mismatch")
	}
	ch, _ := r.Index(0)
	if ch != 'a' {
		t.Errorf("expected 'a' at 0, got '%c'", ch)
	}
	ch, _ = r.Index(999)
	if ch != 'j' {
		t.Errorf("expected 'j' at 999, got '%c'", ch)
	}
}

func TestMultipleOperations(t *testing.T) {
	r := NewRope("Hello")
	r.Insert(5, " World")
	r.Insert(11, "!")
	if r.ToString() != "Hello World!" {
		t.Errorf("expected 'Hello World!', got '%s'", r.ToString())
	}
	r.Delete(5, 6)
	if r.ToString() != "Hello!" {
		t.Errorf("expected 'Hello!', got '%s'", r.ToString())
	}
}

// checkTree verifies the cached fields and that sibling heights differ by at most 1.
func checkTree(t *testing.T, n *RopeNode) {
	t.Helper()
	if n == nil {
		return
	}
	if n.Data != "" {
		if n.length != len(n.Data) || n.height != 0 {
			t.Fatalf("bad leaf %q: length %d height %d", n.Data, n.length, n.height)
		}
		return
	}
	checkTree(t, n.Left)
	checkTree(t, n.Right)
	if n.Weight != n.Left.length || n.length != n.Left.length+n.Right.length {
		t.Fatalf("bad cached length at node")
	}
	h := n.Left.height
	if n.Right.height > h {
		h = n.Right.height
	}
	if n.height != h+1 {
		t.Fatalf("bad cached height")
	}
	d := n.Left.height - n.Right.height
	if d < -1 || d > 1 {
		t.Fatalf("unbalanced node: child heights %d and %d", n.Left.height, n.Right.height)
	}
}

// Regression: appending at the end used to build a chain (height n), so Index
// became O(n); the tree is now rebalanced.
func TestHeightStaysLogarithmicForAppends(t *testing.T) {
	r := NewRope("")
	const n = 20000
	for i := 0; i < n; i++ {
		r.Insert(r.Len(), "x")
	}
	if r.Len() != n {
		t.Fatalf("length %d, want %d", r.Len(), n)
	}
	if float64(r.Height()) > 2*math.Log2(n) {
		t.Fatalf("height %d is not logarithmic for %d appends", r.Height(), n)
	}
	if r.ToString() != strings.Repeat("x", n) {
		t.Fatalf("content changed")
	}
	checkTree(t, r.Root)
}

func TestHeightStaysLogarithmicForPrepends(t *testing.T) {
	r := NewRope("")
	for i := 0; i < 3000; i++ {
		r.Insert(0, "a")
	}
	if float64(r.Height()) > 2*math.Log2(3000) {
		t.Fatalf("height %d is not logarithmic", r.Height())
	}
	checkTree(t, r.Root)
}

func TestRandomEditsMatchPlainString(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	r := NewRope("seed text")
	model := "seed text"
	clamp := func(p int) int {
		if p < 0 {
			return 0
		}
		if p > len(model) {
			return len(model)
		}
		return p
	}
	for step := 0; step < 3000; step++ {
		pos := rng.Intn(len(model)+7) - 3
		switch rng.Intn(4) {
		case 0:
			var sb strings.Builder
			for k := rng.Intn(13); k > 0; k-- {
				sb.WriteByte(byte('a' + rng.Intn(3)))
			}
			r.Insert(pos, sb.String())
			p := clamp(pos)
			model = model[:p] + sb.String() + model[p:]
		case 1:
			n := rng.Intn(16)
			r.Delete(pos, n)
			p := clamp(pos)
			end := p + n
			if end > len(model) {
				end = len(model)
			}
			model = model[:p] + model[end:]
		case 2:
			left, right := r.Split(pos)
			p := clamp(pos)
			if left.ToString() != model[:p] || right.ToString() != model[p:] {
				t.Fatalf("split at %d disagrees with the plain string", pos)
			}
			r = left.Concat(right)
		default:
			other := NewRope(strings.Repeat("-", rng.Intn(21)))
			r = r.Concat(other)
			model += other.ToString()
		}
		if r.Len() != len(model) {
			t.Fatalf("step %d: length %d, want %d", step, r.Len(), len(model))
		}
	}
	if r.ToString() != model {
		t.Fatalf("final content differs")
	}
	checkTree(t, r.Root)
	for i := 0; i < len(model); i += 7 {
		if ch, err := r.Index(i); err != nil || ch != model[i] {
			t.Fatalf("Index(%d) = %q, %v; want %q", i, ch, err, model[i])
		}
	}
}

func TestSplitAndConcatLeaveSourcesUnchanged(t *testing.T) {
	r := NewRope("abcdefghijklmnopqrstuvwxyz")
	before := r.ToString()
	left, right := r.Split(10)
	joined := left.Concat(right)
	if r.ToString() != before || left.ToString() != before[:10] ||
		right.ToString() != before[10:] || joined.ToString() != before {
		t.Fatalf("a source rope was modified")
	}
}
