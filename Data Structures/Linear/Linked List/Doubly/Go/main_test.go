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
