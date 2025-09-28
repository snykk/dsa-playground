package main

import "testing"

func TestCircularQueue(t *testing.T) {
	q := NewCircularQueue(3)

	if !q.IsEmpty() {
		t.Errorf("Queue should be empty initially")
	}

	// Enqueue elements
	q.Enqueue(1)
	q.Enqueue(2)
	q.Enqueue(3)

	if !q.IsFull() {
		t.Errorf("Queue should be full")
	}

	val, _ := q.Dequeue()
	if val != 1 {
		t.Errorf("Expected 1, got %d", val)
	}

	q.Enqueue(4)
	peek, _ := q.Peek()
	if peek != 2 {
		t.Errorf("Expected front 2, got %d", peek)
	}

	if q.Size() != 3 {
		t.Errorf("Expected size 3, got %d", q.Size())
	}
}
