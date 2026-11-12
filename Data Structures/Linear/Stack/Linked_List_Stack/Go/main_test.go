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

func TestEmptyPopAndPeek(t *testing.T) {
	s := NewStack()
	if _, err := s.Pop(); err == nil {
		t.Errorf("Pop on an empty stack should fail")
	}
	if _, err := s.Peek(); err == nil {
		t.Errorf("Peek on an empty stack should fail")
	}
}

func TestLIFOOrderAndSize(t *testing.T) {
	s := NewStack()
	for i := 0; i < 100; i++ {
		s.Push(i)
	}
	if s.Size() != 100 {
		t.Errorf("Expected size 100, got %d", s.Size())
	}
	for i := 99; i >= 0; i-- {
		if v, err := s.Pop(); err != nil || v != i {
			t.Errorf("Expected %d, got %d", i, v)
		}
	}
	if !s.IsEmpty() || s.Size() != 0 {
		t.Errorf("Stack should be empty")
	}
}
