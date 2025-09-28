package main

import "errors"

type CircularQueue struct {
	queue    []int
	front    int
	rear     int
	capacity int
	size     int
}

func NewCircularQueue(cap int) *CircularQueue {
	return &CircularQueue{
		queue:    make([]int, cap),
		front:    0,
		rear:     -1,
		capacity: cap,
		size:     0,
	}
}

func (q *CircularQueue) Enqueue(x int) error {
	if q.IsFull() {
		return errors.New("queue is full")
	}
	q.rear = (q.rear + 1) % q.capacity
	q.queue[q.rear] = x
	q.size++
	return nil
}

func (q *CircularQueue) Dequeue() (int, error) {
	if q.IsEmpty() {
		return 0, errors.New("queue is empty")
	}
	val := q.queue[q.front]
	q.front = (q.front + 1) % q.capacity
	q.size--
	return val, nil
}

func (q *CircularQueue) Peek() (int, error) {
	if q.IsEmpty() {
		return 0, errors.New("queue is empty")
	}
	return q.queue[q.front], nil
}

func (q *CircularQueue) IsEmpty() bool {
	return q.size == 0
}

func (q *CircularQueue) IsFull() bool {
	return q.size == q.capacity
}

func (q *CircularQueue) Size() int {
	return q.size
}
