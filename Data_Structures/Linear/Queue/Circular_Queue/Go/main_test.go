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

func TestFullAndEmptyErrors(t *testing.T) {
	q := NewCircularQueue(2)
	if _, err := q.Dequeue(); err == nil {
		t.Errorf("Dequeue on empty queue should fail")
	}
	if _, err := q.Peek(); err == nil {
		t.Errorf("Peek on empty queue should fail")
	}
	q.Enqueue(1)
	q.Enqueue(2)
	if err := q.Enqueue(3); err == nil {
		t.Errorf("Enqueue on full queue should fail")
	}
}

func TestWrapAroundManyLaps(t *testing.T) {
	q := NewCircularQueue(3)
	for i := 0; i < 20; i++ {
		if err := q.Enqueue(i); err != nil {
			t.Fatal(err)
		}
		if v, _ := q.Dequeue(); v != i {
			t.Errorf("Expected %d, got %d", i, v)
		}
	}
	for i := 0; i < 3; i++ {
		q.Enqueue(i)
	}
	for i := 0; i < 3; i++ {
		if v, _ := q.Dequeue(); v != i {
			t.Errorf("Expected %d, got %d", i, v)
		}
	}
}
