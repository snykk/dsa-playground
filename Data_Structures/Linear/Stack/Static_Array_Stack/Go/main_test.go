package main

import "testing"

func TestArrayStack(t *testing.T) {
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

func TestOverflow(t *testing.T) {
	s, err := NewArrayStack(3)
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 3; i++ {
		if err := s.Push(i); err != nil {
			t.Fatalf("Push %d failed: %v", i, err)
		}
	}
	if err := s.Push(3); err == nil {
		t.Errorf("Push on a full stack should fail")
	}
	if s.Size() != 3 {
		t.Errorf("Expected size 3, got %d", s.Size())
	}
	if val, _ := s.Pop(); val != 2 {
		t.Errorf("Expected 2, got %d", val)
	}
	if err := s.Push(9); err != nil {
		t.Errorf("Push after a pop should succeed: %v", err)
	}
}

func TestInvalidCapacity(t *testing.T) {
	for _, bad := range []int{0, -1} {
		if _, err := NewArrayStack(bad); err == nil {
			t.Errorf("NewArrayStack(%d) should fail", bad)
		}
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

func TestDefaultCapacityIsBounded(t *testing.T) {
	s := NewStack()
	for i := 0; i < DefaultCapacity; i++ {
		if err := s.Push(i); err != nil {
			t.Fatal(err)
		}
	}
	if err := s.Push(1); err == nil {
		t.Errorf("Push past the default capacity should fail")
	}
}
