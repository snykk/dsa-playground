package main

import "testing"

func TestQuery(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewSegmentTree(arr)
	if st.Query(0, 2) != 9 {
		t.Errorf("Expected 9, got %d", st.Query(0, 2))
	}
	if st.Query(1, 3) != 15 {
		t.Errorf("Expected 15, got %d", st.Query(1, 3))
	}
}

func TestUpdate(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewSegmentTree(arr)
	st.Update(2, 10)
	if st.Get(2) != 10 {
		t.Errorf("Expected 10, got %d", st.Get(2))
	}
	if st.Query(0, 2) != 14 {
		t.Errorf("Expected 14, got %d", st.Query(0, 2))
	}
}

