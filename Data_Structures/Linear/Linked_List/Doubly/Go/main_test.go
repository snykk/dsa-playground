package main

import (
	"testing"
)

func TestDoublyLinkedList(t *testing.T) {
	dll := &DoublyLinkedList{}

	dll.InsertAtHead(10)
	if dll.head.data != 10 {
		t.Errorf("Expected head data 10, got %d", dll.head.data)
	}

	dll.InsertAtHead(20)
	if dll.head.data != 20 {
		t.Errorf("Expected head data 20, got %d", dll.head.data)
	}

	dll.InsertAtTail(30)
	temp := dll.head
	for temp.next != nil {
		temp = temp.next
	}
	if temp.data != 30 {
		t.Errorf("Expected tail data 30, got %d", temp.data)
	}

	dll.DeleteValue(20)
	temp = dll.head
	for temp != nil {
		if temp.data == 20 {
			t.Errorf("Value 20 should have been deleted")
		}
		temp = temp.next
	}
}

func forward(dll *DoublyLinkedList) []int {
	var out []int
	for n := dll.head; n != nil; n = n.next {
		out = append(out, n.data)
	}
	return out
}

func backward(dll *DoublyLinkedList) []int {
	var out []int
	n := dll.head
	for n != nil && n.next != nil {
		n = n.next
	}
	for ; n != nil; n = n.prev {
		out = append(out, n.data)
	}
	return out
}

func sameInts(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func TestDeleteKeepsPrevLinks(t *testing.T) {
	dll := &DoublyLinkedList{}
	for _, v := range []int{1, 2, 3, 4} {
		dll.InsertAtTail(v)
	}
	dll.DeleteValue(2)
	if f, b := forward(dll), backward(dll); !sameInts(f, []int{1, 3, 4}) || !sameInts(b, []int{4, 3, 1}) {
		t.Fatalf("after deleting 2: forward %v backward %v", f, b)
	}
	dll.DeleteValue(1)
	if dll.head.prev != nil || !sameInts(backward(dll), []int{4, 3}) {
		t.Fatalf("after deleting head: backward %v", backward(dll))
	}
	dll.DeleteValue(4)
	if !sameInts(forward(dll), []int{3}) || !sameInts(backward(dll), []int{3}) {
		t.Fatalf("after deleting tail: %v %v", forward(dll), backward(dll))
	}
	dll.DeleteValue(3)
	if dll.head != nil {
		t.Fatalf("expected an empty list")
	}
	dll.DeleteValue(3) // empty list: no effect
}

func TestDeleteMissingAndDuplicate(t *testing.T) {
	dll := &DoublyLinkedList{}
	for _, v := range []int{7, 7, 8} {
		dll.InsertAtTail(v)
	}
	dll.DeleteValue(99)
	dll.DeleteValue(7)
	if !sameInts(forward(dll), []int{7, 8}) || !sameInts(backward(dll), []int{8, 7}) {
		t.Fatalf("got %v %v", forward(dll), backward(dll))
	}
}
