package main

import "testing"

func TestQuery(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	ft := NewFenwickTree(arr)
	if ft.Query(0, 2) != 9 {
		t.Errorf("Expected 9, got %d", ft.Query(0, 2))
	}
	if ft.Query(1, 3) != 15 {
		t.Errorf("Expected 15, got %d", ft.Query(1, 3))
	}
}

func TestUpdate(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	ft := NewFenwickTree(arr)
	ft.Update(2, 5)
	if ft.Get(2) != 10 {
		t.Errorf("Expected 10, got %d", ft.Get(2))
	}
	if ft.Query(0, 2) != 14 {
		t.Errorf("Expected 14, got %d", ft.Query(0, 2))
	}
}

