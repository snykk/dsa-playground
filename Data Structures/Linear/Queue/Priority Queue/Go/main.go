package main

import (
	"container/heap"
	"errors"
)

type PQItem struct {
	item     int
	priority int
	count    int
}

type PriorityQueue []PQItem

func NewPriorityQueue() *PriorityQueue {
	pq := make(PriorityQueue, 0)
	heap.Init(&pq)
	return &pq
}

func (pq PriorityQueue) Len() int {
	return len(pq)
}

func (pq PriorityQueue) Less(i, j int) bool {
	if pq[i].priority != pq[j].priority {
		return pq[i].priority < pq[j].priority
	}
	return pq[i].count < pq[j].count
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
}

func (pq *PriorityQueue) Push(x interface{}) {
	*pq = append(*pq, x.(PQItem))
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

type PriorityQueueWrapper struct {
	pq     *PriorityQueue
	count  int
}

func NewPriorityQueueWrapper() *PriorityQueueWrapper {
	return &PriorityQueueWrapper{
		pq:    NewPriorityQueue(),
		count: 0,
	}
}

func (pqw *PriorityQueueWrapper) Enqueue(item int, priority int) {
	pqItem := PQItem{
		item:     item,
		priority: priority,
		count:    pqw.count,
	}
	heap.Push(pqw.pq, pqItem)
	pqw.count++
}

func (pqw *PriorityQueueWrapper) Dequeue() (int, error) {
	if pqw.IsEmpty() {
		return 0, errors.New("priority queue is empty")
	}
	item := heap.Pop(pqw.pq).(PQItem)
	return item.item, nil
}

func (pqw *PriorityQueueWrapper) Peek() (int, error) {
	if pqw.IsEmpty() {
		return 0, errors.New("priority queue is empty")
	}
	return (*pqw.pq)[0].item, nil
}

func (pqw *PriorityQueueWrapper) IsEmpty() bool {
	return pqw.pq.Len() == 0
}

func (pqw *PriorityQueueWrapper) Size() int {
	return pqw.pq.Len()
}

func (pqw *PriorityQueueWrapper) Clear() {
	pqw.pq = NewPriorityQueue()
	pqw.count = 0
}

func main() {
	// Example usage
	pq := NewPriorityQueueWrapper()
	pq.Enqueue(10, 1)
	pq.Enqueue(20, 5)
	pq.Enqueue(30, 2)

	val, _ := pq.Peek()
	println("Peek:", val) // 10

	val1, _ := pq.Dequeue()
	println("Dequeue:", val1) // 10
}

