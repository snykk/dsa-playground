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

func TestEmptyErrors(t *testing.T) {
	q := NewSimpleQueue()
	if _, err := q.Dequeue(); err == nil {
		t.Errorf("Dequeue on empty queue should fail")
	}
	if _, err := q.Peek(); err == nil {
		t.Errorf("Peek on empty queue should fail")
	}
}

func TestFIFOOrder(t *testing.T) {
	q := NewSimpleQueue()
	for i := 0; i < 50; i++ {
		q.Enqueue(i)
	}
	for i := 0; i < 50; i++ {
		if v, err := q.Dequeue(); err != nil || v != i {
			t.Errorf("Expected %d, got %d", i, v)
		}
	}
	if !q.IsEmpty() {
		t.Errorf("Queue should be empty")
	}
}
