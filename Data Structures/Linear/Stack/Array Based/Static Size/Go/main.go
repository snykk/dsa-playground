package main

import "fmt"

// DefaultCapacity is the capacity NewStack uses.
const DefaultCapacity = 100

// ArrayStack is a stack with a fixed capacity: the backing array is allocated once.
type ArrayStack struct {
	data     []int
	capacity int
}

// NewStack returns a stack with DefaultCapacity.
func NewStack() *ArrayStack {
	s, _ := NewArrayStack(DefaultCapacity)
	return s
}

// NewArrayStack returns a stack that holds at most capacity items.
func NewArrayStack(capacity int) (*ArrayStack, error) {
	if capacity < 1 {
		return nil, fmt.Errorf("capacity must be at least 1")
	}
	return &ArrayStack{data: make([]int, 0, capacity), capacity: capacity}, nil
}

// Push adds value on top, or returns an error if the stack is full.
func (s *ArrayStack) Push(value int) error {
	if len(s.data) == s.capacity {
		return fmt.Errorf("stack overflow")
	}
	s.data = append(s.data, value)
	return nil
}

func (s *ArrayStack) Pop() (int, error) {
	if s.IsEmpty() {
		return 0, fmt.Errorf("pop from empty stack")
	}
	val := s.data[len(s.data)-1]
	s.data = s.data[:len(s.data)-1]
	return val, nil
}

func (s *ArrayStack) Peek() (int, error) {
	if s.IsEmpty() {
		return 0, fmt.Errorf("peek from empty stack")
	}
	return s.data[len(s.data)-1], nil
}

func (s *ArrayStack) IsEmpty() bool {
	return len(s.data) == 0
}

func (s *ArrayStack) Size() int {
	return len(s.data)
}

func main() {
	stack := NewStack()
	stack.Push(10)
	stack.Push(20)
	top, _ := stack.Peek()
	fmt.Println(top)          // 20
	fmt.Println(stack.Size()) // 2
}
