package main_test

import "testing"

func TestStaticArray(t *testing.T) {
	arr := [5]int{1, 2, 3, 4, 5}

	if arr[0] != 1 {
		t.Errorf("Expected arr[0]=1, got %d", arr[0])
	}
	if arr[4] != 5 {
		t.Errorf("Expected arr[4]=5, got %d", arr[4])
	}

	arr[2] = 10
	if arr[2] != 10 {
		t.Errorf("Expected arr[2]=10 after update, got %d", arr[2])
	}
}
