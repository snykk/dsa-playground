package main

import "testing"

func TestDynamicArray(t *testing.T) {
	arr := NewDynamicArray(2)

	// Test appends
	for i := 0; i < 10; i++ {
		arr.Append(i)
	}

	if arr.size != 10 {
		t.Errorf("Expected size 10, got %d", arr.size)
	}
	if arr.capacity < 10 {
		t.Errorf("Expected capacity >= 10, got %d", arr.capacity)
	}

	// Test access
	if arr.Get(0) != 0 {
		t.Error("Expected 0")
	}
	if arr.Get(9) != 9 {
		t.Error("Expected 9")
	}

	// Test index error
	defer func() {
		if r := recover(); r == nil {
			t.Error("Expected panic for index out of range")
		}
	}()
	arr.Get(10)
}

func TestBinaryCounter(t *testing.T) {
	counter := NewBinaryCounter(4)

	// Test increments
	for i := 0; i < 5; i++ {
		counter.Increment()
	}

	if counter.GetValue() != 5 {
		t.Errorf("Expected 5, got %d", counter.GetValue())
	}

	// Test more increments
	for i := 0; i < 10; i++ {
		counter.Increment()
	}

	// Value should wrap around for 4-bit counter
	value := counter.GetValue()
	if value < 0 || value >= 16 {
		t.Errorf("Expected value between 0 and 15, got %d", value)
	}
}
