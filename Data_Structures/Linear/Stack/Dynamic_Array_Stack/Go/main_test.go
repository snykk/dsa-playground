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

func mustPanic(t *testing.T, name string, f func()) {
	t.Helper()
	defer func() {
		if recover() == nil {
			t.Errorf("%s on an empty stack should panic", name)
		}
	}()
	f()
}

func TestEmptyPopAndPeekPanic(t *testing.T) {
	stack := ArrayStack{}
	mustPanic(t, "Pop", func() { stack.Pop() })
	mustPanic(t, "Peek", func() { stack.Peek() })
}

func TestGrowthAndLIFOOrder(t *testing.T) {
	stack := ArrayStack{}
	for i := 0; i < 1000; i++ {
		stack.Push(i)
	}
	if stack.Size() != 1000 {
		t.Errorf("Expected size 1000, got %d", stack.Size())
	}
	for i := 999; i >= 0; i-- {
		if v := stack.Pop(); v != i {
			t.Errorf("Expected %d, got %d", i, v)
		}
	}
}
