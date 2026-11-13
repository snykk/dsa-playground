package main

import (
	"math/rand"
	"testing"
)

func TestMinQuery(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11, 2, 4, 6, 8}
	st := NewSparseTable(arr, "min")

	if st.Query(0, 2) != 1 {
		t.Errorf("Expected 1, got %d", st.Query(0, 2))
	}
	if st.Query(1, 3) != 3 {
		t.Errorf("Expected 3, got %d", st.Query(1, 3))
	}
	if st.Query(0, 5) != 1 {
		t.Errorf("Expected 1, got %d", st.Query(0, 5))
	}
	if st.Query(6, 9) != 2 {
		t.Errorf("Expected 2, got %d", st.Query(6, 9))
	}
}

func TestMaxQuery(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11, 2, 4, 6, 8}
	st := NewSparseTable(arr, "max")

	if st.Query(0, 2) != 5 {
		t.Errorf("Expected 5, got %d", st.Query(0, 2))
	}
	if st.Query(1, 3) != 7 {
		t.Errorf("Expected 7, got %d", st.Query(1, 3))
	}
	if st.Query(0, 5) != 11 {
		t.Errorf("Expected 11, got %d", st.Query(0, 5))
	}
	if st.Query(6, 9) != 8 {
		t.Errorf("Expected 8, got %d", st.Query(6, 9))
	}
}

func TestSingleElement(t *testing.T) {
	arr := []int{5}
	stMin := NewSparseTable(arr, "min")
	stMax := NewSparseTable(arr, "max")

	if stMin.Query(0, 0) != 5 {
		t.Errorf("Expected 5, got %d", stMin.Query(0, 0))
	}
	if stMax.Query(0, 0) != 5 {
		t.Errorf("Expected 5, got %d", stMax.Query(0, 0))
	}
}

func TestRangeQueries(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11, 2, 4, 6, 8}
	stMin := NewSparseTable(arr, "min")
	stMax := NewSparseTable(arr, "max")

	if stMin.Query(0, 0) != 1 {
		t.Errorf("Expected 1, got %d", stMin.Query(0, 0))
	}
	if stMin.Query(5, 5) != 11 {
		t.Errorf("Expected 11, got %d", stMin.Query(5, 5))
	}
	if stMin.Query(2, 4) != 5 {
		t.Errorf("Expected 5, got %d", stMin.Query(2, 4))
	}

	if stMax.Query(0, 0) != 1 {
		t.Errorf("Expected 1, got %d", stMax.Query(0, 0))
	}
	if stMax.Query(5, 5) != 11 {
		t.Errorf("Expected 11, got %d", stMax.Query(5, 5))
	}
	if stMax.Query(2, 4) != 9 {
		t.Errorf("Expected 9, got %d", stMax.Query(2, 4))
	}
}

func TestFullRange(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11, 2, 4, 6, 8}
	stMin := NewSparseTable(arr, "min")
	stMax := NewSparseTable(arr, "max")

	if stMin.Query(0, 9) != 1 {
		t.Errorf("Expected 1, got %d", stMin.Query(0, 9))
	}
	if stMax.Query(0, 9) != 11 {
		t.Errorf("Expected 11, got %d", stMax.Query(0, 9))
	}
}

func TestGet(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11, 2, 4, 6, 8}
	st := NewSparseTable(arr, "min")

	if st.Get(0) != 1 {
		t.Errorf("Expected 1, got %d", st.Get(0))
	}
	if st.Get(5) != 11 {
		t.Errorf("Expected 11, got %d", st.Get(5))
	}
}

func mustPanic(t *testing.T, name string, f func()) {
	t.Helper()
	defer func() {
		if recover() == nil {
			t.Errorf("%s: expected a panic", name)
		}
	}()
	f()
}

// Regression: an empty input used to build a garbage table (logN near -2^63).
func TestEmptyInput(t *testing.T) {
	st := NewSparseTable([]int{}, "min")
	mustPanic(t, "query on empty", func() { st.Query(0, 0) })
	mustPanic(t, "get on empty", func() { st.Get(0) })
}

// Regression: any type other than "min" silently meant max.
func TestInvalidQueryType(t *testing.T) {
	mustPanic(t, "sum", func() { NewSparseTable([]int{5, 1, 9}, "sum") })
}

func TestOutOfRangePanics(t *testing.T) {
	st := NewSparseTable([]int{1, 2, 3}, "min")
	mustPanic(t, "left < 0", func() { st.Query(-1, 1) })
	mustPanic(t, "right >= n", func() { st.Query(0, 3) })
	if st.Query(2, 0) != st.Query(0, 2) {
		t.Error("swapped bounds should be reordered")
	}
}

func TestDoesNotAliasInput(t *testing.T) {
	arr := []int{4, 2, 7}
	st := NewSparseTable(arr, "min")
	arr[1] = 100
	if st.Query(0, 2) != 2 {
		t.Error("table must not see later changes to the input")
	}
}

func TestRandomAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(11))
	for n := 1; n < 70; n++ {
		arr := make([]int, n)
		for i := range arr {
			arr[i] = rng.Intn(201) - 100
		}
		lo, hi := NewSparseTable(arr, "min"), NewSparseTable(arr, "max")
		for l := 0; l < n; l++ {
			wantMin, wantMax := arr[l], arr[l]
			for r := l; r < n; r++ {
				wantMin, wantMax = min(wantMin, arr[r]), max(wantMax, arr[r])
				if lo.Query(l, r) != wantMin || hi.Query(l, r) != wantMax {
					t.Fatalf("n=%d query(%d,%d) mismatch", n, l, r)
				}
			}
		}
	}
}
