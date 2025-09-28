package main

import "testing"

func TestSimpleQueue(t *testing.T) {
	q := NewSimpleQueue()

	q.Enqueue(1)
	q.Enqueue(2)

	val, err := q.Dequeue()
	if err != nil || val != 1 {
		t.Errorf("Expected 1, got %d", val)
	}

	peek, err := q.Peek()
	if err != nil || peek != 2 {
		t.Errorf("Expected 2, got %d", peek)
	}

	if q.IsEmpty() {
		t.Errorf("Queue should not be empty")
	}

	if q.Size() != 1 {
		t.Errorf("Expected size 1, got %d", q.Size())
	}
}
