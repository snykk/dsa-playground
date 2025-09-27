package main

import (
	"reflect"
	"testing"
)

func TestSinglyLinkedList(t *testing.T) {
	ll := &SinglyLinkedList{}
	ll.InsertAtHead(1)
	ll.InsertAtTail(2)
	if !reflect.DeepEqual(ll.Display(), []int{1, 2}) {
		t.Errorf("expected [1 2], got %v", ll.Display())
	}
	ll.Delete(1)
	if !reflect.DeepEqual(ll.Display(), []int{2}) {
		t.Errorf("expected [2], got %v", ll.Display())
	}
}
