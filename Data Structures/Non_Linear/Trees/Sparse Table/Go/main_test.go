package main

import "testing"

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

