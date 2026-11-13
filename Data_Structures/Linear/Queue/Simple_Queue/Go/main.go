package main

import "errors"

type SimpleQueue struct {
	queue []int
}

func NewSimpleQueue() *SimpleQueue {
	return &SimpleQueue{queue: []int{}}
}

func (q *SimpleQueue) Enqueue(x int) {
	q.queue = append(q.queue, x)
}

func (q *SimpleQueue) Dequeue() (int, error) {
	if len(q.queue) == 0 {
		return 0, errors.New("queue is empty")
	}
	val := q.queue[0]
	q.queue = q.queue[1:]
	return val, nil
}

func (q *SimpleQueue) Peek() (int, error) {
	if len(q.queue) == 0 {
		return 0, errors.New("queue is empty")
	}
	return q.queue[0], nil
}

func (q *SimpleQueue) IsEmpty() bool {
	return len(q.queue) == 0
}

func (q *SimpleQueue) Size() int {
	return len(q.queue)
}

func main() {
	// Example usage
	q := NewSimpleQueue()
	q.Enqueue(1)
	q.Enqueue(2)
	val, _ := q.Dequeue()
	println(val) // 1
}
