package main

import "testing"

func TestBuildAndQuery(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewLazySegmentTree(arr)
	if st.Query(0, 5) != 36 {
		t.Errorf("Expected 36, got %d", st.Query(0, 5))
	}
	if st.Query(0, 2) != 9 {
		t.Errorf("Expected 9, got %d", st.Query(0, 2))
	}
	if st.Query(1, 3) != 15 {
		t.Errorf("Expected 15, got %d", st.Query(1, 3))
	}
	if st.Query(3, 5) != 27 {
		t.Errorf("Expected 27, got %d", st.Query(3, 5))
	}
}

func TestSingleElementQuery(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewLazySegmentTree(arr)
	if st.Query(0, 0) != 1 {
		t.Errorf("Expected 1, got %d", st.Query(0, 0))
	}
	if st.Query(2, 2) != 5 {
		t.Errorf("Expected 5, got %d", st.Query(2, 2))
	}
	if st.Query(5, 5) != 11 {
		t.Errorf("Expected 11, got %d", st.Query(5, 5))
	}
}

func TestSingleElementUpdate(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewLazySegmentTree(arr)
	st.UpdateRange(2, 2, 5)
	if st.Query(2, 2) != 10 {
		t.Errorf("Expected 10, got %d", st.Query(2, 2))
	}
	if st.Query(0, 2) != 14 {
		t.Errorf("Expected 14, got %d", st.Query(0, 2))
	}
	if st.Query(0, 5) != 41 {
		t.Errorf("Expected 41, got %d", st.Query(0, 5))
	}
}

func TestRangeUpdateThenQuery(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewLazySegmentTree(arr)
	st.UpdateRange(1, 4, 10)
	if st.Query(0, 5) != 76 {
		t.Errorf("Expected 76, got %d", st.Query(0, 5))
	}
	if st.Query(1, 4) != 64 {
		t.Errorf("Expected 64, got %d", st.Query(1, 4))
	}
	if st.Query(0, 0) != 1 {
		t.Errorf("Expected 1, got %d", st.Query(0, 0))
	}
	if st.Query(5, 5) != 11 {
		t.Errorf("Expected 11, got %d", st.Query(5, 5))
	}
}

func TestMultipleOverlappingUpdates(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewLazySegmentTree(arr)
	st.UpdateRange(0, 3, 2)
	st.UpdateRange(2, 5, 3)
	if st.Query(0, 0) != 3 {
		t.Errorf("Expected 3, got %d", st.Query(0, 0))
	}
	if st.Query(1, 1) != 5 {
		t.Errorf("Expected 5, got %d", st.Query(1, 1))
	}
	if st.Query(2, 2) != 10 {
		t.Errorf("Expected 10, got %d", st.Query(2, 2))
	}
	if st.Query(3, 3) != 12 {
		t.Errorf("Expected 12, got %d", st.Query(3, 3))
	}
	if st.Query(4, 4) != 12 {
		t.Errorf("Expected 12, got %d", st.Query(4, 4))
	}
	if st.Query(5, 5) != 14 {
		t.Errorf("Expected 14, got %d", st.Query(5, 5))
	}
	if st.Query(0, 5) != 56 {
		t.Errorf("Expected 56, got %d", st.Query(0, 5))
	}
}

func TestFullRangeUpdate(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewLazySegmentTree(arr)
	st.UpdateRange(0, 5, 1)
	if st.Query(0, 5) != 42 {
		t.Errorf("Expected 42, got %d", st.Query(0, 5))
	}
}

func TestSingleElementArray(t *testing.T) {
	arr := []int{42}
	st := NewLazySegmentTree(arr)
	if st.Query(0, 0) != 42 {
		t.Errorf("Expected 42, got %d", st.Query(0, 0))
	}
	st.UpdateRange(0, 0, 8)
	if st.Query(0, 0) != 50 {
		t.Errorf("Expected 50, got %d", st.Query(0, 0))
	}
}

func TestNegativeValues(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewLazySegmentTree(arr)
	st.UpdateRange(0, 5, -1)
	if st.Query(0, 5) != 30 {
		t.Errorf("Expected 30, got %d", st.Query(0, 5))
	}
}
