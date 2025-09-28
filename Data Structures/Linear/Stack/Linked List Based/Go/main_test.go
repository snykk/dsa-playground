package main

import "testing"

func TestLinkedListStack(t *testing.T) {
	s := NewStack()

	s.Push(10)
	s.Push(20)

	if val, _ := s.Peek(); val != 20 {
		t.Errorf("Expected 20, got %d", val)
	}

	if val, _ := s.Pop(); val != 20 {
		t.Errorf("Expected 20, got %d", val)
	}

	if val, _ := s.Pop(); val != 10 {
		t.Errorf("Expected 10, got %d", val)
	}

	if !s.IsEmpty() {
		t.Errorf("Expected stack to be empty")
	}
}
