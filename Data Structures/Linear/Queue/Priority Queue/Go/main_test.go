package main

import "testing"

func TestEnqueueDequeue(t *testing.T) {
	pq := NewPriorityQueueWrapper()
	pq.Enqueue(10, 3)
	pq.Enqueue(20, 1)
	pq.Enqueue(30, 2)
	// Should dequeue in order: 20 (1), 30 (2), 10 (3)
	val1, _ := pq.Dequeue()
	val2, _ := pq.Dequeue()
	val3, _ := pq.Dequeue()
	if val1 != 20 || val2 != 30 || val3 != 10 {
		t.Errorf("Expected 20, 30, 10 but got %d, %d, %d", val1, val2, val3)
	}
}

func TestPeek(t *testing.T) {
	pq := NewPriorityQueueWrapper()
	pq.Enqueue(100, 1)
	pq.Enqueue(200, 5)
	val, _ := pq.Peek()
	if val != 100 {
		t.Errorf("Expected 100 but got %d", val)
	}
	// Peek should not remove the element
	if pq.Size() != 2 {
		t.Errorf("Expected size 2 but got %d", pq.Size())
	}
}

func TestIsEmpty(t *testing.T) {
	pq := NewPriorityQueueWrapper()
	if !pq.IsEmpty() {
		t.Error("Expected queue to be empty")
	}
	pq.Enqueue(1, 1)
	if pq.IsEmpty() {
		t.Error("Expected queue to not be empty")
	}
	pq.Dequeue()
	if !pq.IsEmpty() {
		t.Error("Expected queue to be empty after dequeue")
	}
}

func TestSize(t *testing.T) {
	pq := NewPriorityQueueWrapper()
	if pq.Size() != 0 {
		t.Errorf("Expected size 0 but got %d", pq.Size())
	}
	pq.Enqueue(1, 1)
	pq.Enqueue(2, 2)
	if pq.Size() != 2 {
		t.Errorf("Expected size 2 but got %d", pq.Size())
	}
	pq.Dequeue()
	if pq.Size() != 1 {
		t.Errorf("Expected size 1 but got %d", pq.Size())
	}
}

func TestSamePriority(t *testing.T) {
	pq := NewPriorityQueueWrapper()
	// Items with same priority should maintain insertion order
	pq.Enqueue(1, 1)
	pq.Enqueue(2, 1)
	pq.Enqueue(3, 1)
	val1, _ := pq.Dequeue()
	val2, _ := pq.Dequeue()
	val3, _ := pq.Dequeue()
	if val1 != 1 || val2 != 2 || val3 != 3 {
		t.Errorf("Expected 1, 2, 3 but got %d, %d, %d", val1, val2, val3)
	}
}

func TestMixedPriorities(t *testing.T) {
	pq := NewPriorityQueueWrapper()
	pq.Enqueue(10, 10)
	pq.Enqueue(1, 1)
	pq.Enqueue(5, 5)
	pq.Enqueue(20, 10)
	val1, _ := pq.Dequeue()
	val2, _ := pq.Dequeue()
	val3, _ := pq.Dequeue()
	val4, _ := pq.Dequeue()
	if val1 != 1 || val2 != 5 || val3 != 10 || val4 != 20 {
		t.Errorf("Expected 1, 5, 10, 20 but got %d, %d, %d, %d", val1, val2, val3, val4)
	}
}

func TestClear(t *testing.T) {
	pq := NewPriorityQueueWrapper()
	pq.Enqueue(1, 1)
	pq.Enqueue(2, 2)
	pq.Clear()
	if !pq.IsEmpty() {
		t.Error("Expected queue to be empty after clear")
	}
	if pq.Size() != 0 {
		t.Errorf("Expected size 0 but got %d", pq.Size())
	}
}

func TestDequeueEmpty(t *testing.T) {
	pq := NewPriorityQueueWrapper()
	_, err := pq.Dequeue()
	if err == nil {
		t.Error("Expected error when dequeuing from empty queue")
	}
}

func TestPeekEmpty(t *testing.T) {
	pq := NewPriorityQueueWrapper()
	_, err := pq.Peek()
	if err == nil {
		t.Error("Expected error when peeking empty queue")
	}
}

