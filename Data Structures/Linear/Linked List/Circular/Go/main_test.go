package main

import "testing"

func TestCircularLinkedList(t *testing.T) {
	cll := &CircularLinkedList{}
	cll.InsertAtHead(10)
	cll.InsertAtHead(20)
	cll.InsertAtTail(30)

	expected := []int{20, 10, 30}
	temp := cll.head
	for i := 0; i < len(expected); i++ {
		if temp.data != expected[i] {
			t.Errorf("Expected %d, got %d", expected[i], temp.data)
		}
		temp = temp.next
	}

	cll.DeleteValue(10)
	expected2 := []int{20, 30}
	temp = cll.head
	for i := 0; i < len(expected2); i++ {
		if temp.data != expected2[i] {
			t.Errorf("Expected %d, got %d", expected2[i], temp.data)
		}
		temp = temp.next
	}
}
