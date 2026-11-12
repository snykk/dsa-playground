package main

import (
	"math"
	"math/rand"
	"reflect"
	"sort"
	"testing"
)

func TestEmptyTreap(t *testing.T) {
	tr := NewTreap()
	if tr.Len() != 0 || tr.Contains(1) {
		t.Errorf("empty treap invariants violated")
	}
	if len(tr.Inorder()) != 0 {
		t.Errorf("inorder of empty treap should be empty")
	}
}

func TestSingleInsert(t *testing.T) {
	tr := NewTreap()
	if !tr.Insert(5) || !tr.Contains(5) || tr.Len() != 1 {
		t.Errorf("single insert broken")
	}
}

func TestDuplicateInsert(t *testing.T) {
	tr := NewTreap()
	tr.Insert(5)
	if tr.Insert(5) || tr.Len() != 1 {
		t.Errorf("duplicate insert should be rejected")
	}
}

func TestInorderSorted(t *testing.T) {
	tr := NewTreap()
	keys := []int{5, 3, 7, 1, 9, 4, 6, 2, 8}
	for _, k := range keys {
		tr.Insert(k)
	}
	got := tr.Inorder()
	want := append([]int(nil), keys...)
	sort.Ints(want)
	if !reflect.DeepEqual(got, want) {
		t.Errorf("inorder = %v, want %v", got, want)
	}
}

func TestDeleteExisting(t *testing.T) {
	tr := NewTreap()
	for _, k := range []int{5, 3, 7} {
		tr.Insert(k)
	}
	if !tr.Delete(3) || tr.Contains(3) || tr.Len() != 2 {
		t.Errorf("delete broken")
	}
}

func TestDeleteNonexistent(t *testing.T) {
	tr := NewTreap()
	tr.Insert(5)
	if tr.Delete(99) || tr.Len() != 1 {
		t.Errorf("deleting missing should return false")
	}
}

func TestDeleteAll(t *testing.T) {
	tr := NewTreap()
	keys := []int{10, 20, 5, 15, 25, 3, 8}
	for _, k := range keys {
		tr.Insert(k)
	}
	for _, k := range keys {
		if !tr.Delete(k) {
			t.Errorf("delete(%d) failed", k)
		}
	}
	if tr.Len() != 0 {
		t.Errorf("size = %d, want 0", tr.Len())
	}
}

func TestRandomizedStress(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	tr := NewTreap()
	ref := map[int]bool{}
	for i := 0; i < 1000; i++ {
		k := rng.Intn(500)
		if rng.Intn(2) == 0 {
			_, was := ref[k]
			if tr.Insert(k) == was {
				t.Errorf("insert(%d) expected new=%v", k, !was)
			}
			ref[k] = true
		} else {
			_, was := ref[k]
			if tr.Delete(k) != was {
				t.Errorf("delete(%d) expected had=%v", k, was)
			}
			delete(ref, k)
		}
	}
	want := make([]int, 0, len(ref))
	for k := range ref {
		want = append(want, k)
	}
	sort.Ints(want)
	got := tr.Inorder()
	if got == nil && len(want) == 0 {
		// treat nil and empty slice as equal
	} else if !reflect.DeepEqual(got, want) {
		t.Errorf("inorder = %v, want %v", got, want)
	}
	if !tr.CheckHeapProperty() {
		t.Errorf("heap property violated after stress")
	}
}

func TestHeapPropertyInvariant(t *testing.T) {
	tr := NewTreap()
	for _, k := range []int{50, 25, 75, 10, 40, 60, 90, 5, 15, 35, 55} {
		tr.Insert(k)
	}
	if !tr.CheckHeapProperty() {
		t.Errorf("heap property violated")
	}
}

// Regression: Delete used key+1, which wraps at math.MaxInt and left the key behind.
func TestDeleteExtremeKeys(t *testing.T) {
	tr := NewTreap()
	tr.Insert(1)
	tr.Insert(math.MaxInt)
	tr.Insert(math.MinInt)
	if !tr.Delete(math.MaxInt) {
		t.Fatal("Delete(MaxInt) should succeed")
	}
	if tr.Contains(math.MaxInt) || tr.Len() != 2 {
		t.Fatalf("MaxInt still present, len=%d", tr.Len())
	}
	if got := tr.Inorder(); !reflect.DeepEqual(got, []int{math.MinInt, 1}) {
		t.Fatalf("inorder = %v", got)
	}
}
