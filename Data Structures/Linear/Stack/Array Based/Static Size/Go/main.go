package main

import "fmt"

type ArrayStack struct {
	data []int
}

func NewStack() *ArrayStack {
	return &ArrayStack{data: []int{}}
}

func (s *ArrayStack) Push(value int) {
	s.data = append(s.data, value)
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
	fmt.Println(stack.Peek()) // 20
	fmt.Println(stack.Size()) // 2
}
