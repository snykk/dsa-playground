package main

import "testing"

func TestPushFrontPopFront(t *testing.T) {
	dq := NewDeque()
	dq.PushFront(1)
	dq.PushFront(2)
	val1, _ := dq.PopFront()
	val2, _ := dq.PopFront()
	if val1 != 2 || val2 != 1 {
		t.Errorf("Expected 2, 1 but got %d, %d", val1, val2)
	}
}

func TestPushBackPopBack(t *testing.T) {
	dq := NewDeque()
	dq.PushBack(1)
	dq.PushBack(2)
	val1, _ := dq.PopBack()
	val2, _ := dq.PopBack()
	if val1 != 2 || val2 != 1 {
		t.Errorf("Expected 2, 1 but got %d, %d", val1, val2)
	}
}

func TestMixedOperations(t *testing.T) {
	dq := NewDeque()
	dq.PushFront(1)
	dq.PushBack(2)
	dq.PushFront(3)
	dq.PushBack(4)
	// Deque should be: [3, 1, 2, 4]
	front, _ := dq.PeekFront()
	back, _ := dq.PeekBack()
	if front != 3 || back != 4 || dq.Size() != 4 {
		t.Errorf("Expected front=3, back=4, size=4 but got front=%d, back=%d, size=%d", front, back, dq.Size())
	}
}

func TestPopFront(t *testing.T) {
	dq := NewDeque()
	dq.PushBack(1)
	dq.PushBack(2)
	val1, _ := dq.PopFront()
	val2, _ := dq.PopFront()
	if val1 != 1 || val2 != 2 {
		t.Errorf("Expected 1, 2 but got %d, %d", val1, val2)
	}
}

func TestPopBack(t *testing.T) {
	dq := NewDeque()
	dq.PushFront(1)
	dq.PushFront(2)
	val1, _ := dq.PopBack()
	val2, _ := dq.PopBack()
	if val1 != 1 || val2 != 2 {
		t.Errorf("Expected 1, 2 but got %d, %d", val1, val2)
	}
}

func TestIsEmpty(t *testing.T) {
	dq := NewDeque()
	if !dq.IsEmpty() {
		t.Error("Expected deque to be empty")
	}
	dq.PushFront(1)
	if dq.IsEmpty() {
		t.Error("Expected deque to not be empty")
	}
	dq.PopFront()
	if !dq.IsEmpty() {
		t.Error("Expected deque to be empty after pop")
	}
}

func TestSize(t *testing.T) {
	dq := NewDeque()
	if dq.Size() != 0 {
		t.Errorf("Expected size 0 but got %d", dq.Size())
	}
	dq.PushFront(1)
	dq.PushBack(2)
	if dq.Size() != 2 {
		t.Errorf("Expected size 2 but got %d", dq.Size())
	}
	dq.PopFront()
	if dq.Size() != 1 {
		t.Errorf("Expected size 1 but got %d", dq.Size())
	}
}

func TestPeekFrontEmpty(t *testing.T) {
	dq := NewDeque()
	_, err := dq.PeekFront()
	if err == nil {
		t.Error("Expected error when peeking empty deque")
	}
}

func TestPeekBackEmpty(t *testing.T) {
	dq := NewDeque()
	_, err := dq.PeekBack()
	if err == nil {
		t.Error("Expected error when peeking empty deque")
	}
}

func TestPopFrontEmpty(t *testing.T) {
	dq := NewDeque()
	_, err := dq.PopFront()
	if err == nil {
		t.Error("Expected error when popping from empty deque")
	}
}

func TestPopBackEmpty(t *testing.T) {
	dq := NewDeque()
	_, err := dq.PopBack()
	if err == nil {
		t.Error("Expected error when popping from empty deque")
	}
}
