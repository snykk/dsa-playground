package main

import "fmt"

type Node struct {
	value int
	next  *Node
}

type LinkedListStack struct {
	top  *Node
	size int
}

func NewStack() *LinkedListStack {
	return &LinkedListStack{nil, 0}
}

func (s *LinkedListStack) Push(value int) {
	newNode := &Node{value: value, next: s.top}
	s.top = newNode
	s.size++
}

func (s *LinkedListStack) Pop() (int, error) {
	if s.IsEmpty() {
		return 0, fmt.Errorf("pop from empty stack")
	}
	val := s.top.value
	s.top = s.top.next
	s.size--
	return val, nil
}

func (s *LinkedListStack) Peek() (int, error) {
	if s.IsEmpty() {
		return 0, fmt.Errorf("peek from empty stack")
	}
	return s.top.value, nil
}

func (s *LinkedListStack) IsEmpty() bool {
	return s.top == nil
}

func (s *LinkedListStack) Size() int {
	return s.size
}

func main() {
	stack := NewStack()
	stack.Push(10)
	stack.Push(20)
	fmt.Println(stack.Peek()) // 20
	fmt.Println(stack.Size()) // 2
}
