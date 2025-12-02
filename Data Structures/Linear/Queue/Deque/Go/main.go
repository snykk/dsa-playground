package main

import "errors"

type Deque struct {
	deque []int
}

func NewDeque() *Deque {
	return &Deque{deque: []int{}}
}

func (dq *Deque) PushFront(item int) {
	// Insert at the beginning
	dq.deque = append([]int{item}, dq.deque...)
}

func (dq *Deque) PushBack(item int) {
	dq.deque = append(dq.deque, item)
}

func (dq *Deque) PopFront() (int, error) {
	if dq.IsEmpty() {
		return 0, errors.New("deque is empty")
	}
	val := dq.deque[0]
	dq.deque = dq.deque[1:]
	return val, nil
}

func (dq *Deque) PopBack() (int, error) {
	if dq.IsEmpty() {
		return 0, errors.New("deque is empty")
	}
	val := dq.deque[len(dq.deque)-1]
	dq.deque = dq.deque[:len(dq.deque)-1]
	return val, nil
}

func (dq *Deque) PeekFront() (int, error) {
	if dq.IsEmpty() {
		return 0, errors.New("deque is empty")
	}
	return dq.deque[0], nil
}

func (dq *Deque) PeekBack() (int, error) {
	if dq.IsEmpty() {
		return 0, errors.New("deque is empty")
	}
	return dq.deque[len(dq.deque)-1], nil
}

func (dq *Deque) IsEmpty() bool {
	return len(dq.deque) == 0
}

func (dq *Deque) Size() int {
	return len(dq.deque)
}

func main() {
	// Example usage
	dq := NewDeque()
	dq.PushFront(1)
	dq.PushBack(2)
	dq.PushFront(3)
	dq.PushBack(4)
	// Deque: [3, 1, 2, 4]

	front, _ := dq.PeekFront()
	back, _ := dq.PeekBack()
	println("Front:", front) // 3
	println("Back:", back)   // 4
	println("Size:", dq.Size()) // 4
}

