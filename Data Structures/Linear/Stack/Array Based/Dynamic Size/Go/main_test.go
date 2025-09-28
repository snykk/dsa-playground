package main

import "testing"

func TestArrayStack(t *testing.T) {
	stack := ArrayStack{}
	stack.Push(10)
	stack.Push(20)
	stack.Push(30)

	if stack.Peek() != 30 {
		t.Errorf("Expected 30, got %d", stack.Peek())
	}

	if stack.Pop() != 30 {
		t.Errorf("Expected 30 on pop")
	}

	if stack.Pop() != 20 {
		t.Errorf("Expected 20 on pop")
	}

	if stack.IsEmpty() {
		t.Errorf("Stack should not be empty")
	}

	if stack.Pop() != 10 {
		t.Errorf("Expected 10 on pop")
	}

	if !stack.IsEmpty() {
		t.Errorf("Stack should be empty")
	}
}
