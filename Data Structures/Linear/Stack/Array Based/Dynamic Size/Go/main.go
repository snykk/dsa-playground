package main

import "fmt"

type ArrayStack struct {
	stack []int
}

func (s *ArrayStack) Push(value int) {
	s.stack = append(s.stack, value) // slice dynamically resizes
}

func (s *ArrayStack) Pop() int {
	if s.IsEmpty() {
		panic("Pop from empty stack")
	}
	value := s.stack[len(s.stack)-1]
	s.stack = s.stack[:len(s.stack)-1]
	return value
}

func (s *ArrayStack) Peek() int {
	if s.IsEmpty() {
		panic("Peek from empty stack")
	}
	return s.stack[len(s.stack)-1]
}

func (s *ArrayStack) IsEmpty() bool {
	return len(s.stack) == 0
}

func (s *ArrayStack) Size() int {
	return len(s.stack)
}

func main() {
	stack := ArrayStack{}
	stack.Push(10)
	stack.Push(20)
	stack.Push(30)

	fmt.Println(stack.Peek())    // 30
	fmt.Println(stack.Pop())     // 30
	fmt.Println(stack.Pop())     // 20
	fmt.Println(stack.IsEmpty()) // false
	fmt.Println(stack.Pop())     // 10
	fmt.Println(stack.IsEmpty()) // true
}
