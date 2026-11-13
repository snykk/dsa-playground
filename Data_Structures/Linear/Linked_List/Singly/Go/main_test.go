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

func TestDeleteCases(t *testing.T) {
	ll := &SinglyLinkedList{}
	ll.Delete(5) // empty list: no effect
	for _, v := range []int{1, 2, 3, 4} {
		ll.InsertAtTail(v)
	}
	steps := []struct {
		del  int
		want []int
	}{
		{1, []int{2, 3, 4}}, // head
		{3, []int{2, 4}},    // middle
		{4, []int{2}},       // tail
		{99, []int{2}},      // missing key
		{2, nil},            // only node
	}
	for _, s := range steps {
		ll.Delete(s.del)
		if got := ll.Display(); !reflect.DeepEqual(got, s.want) {
			t.Errorf("after Delete(%d): got %v, want %v", s.del, got, s.want)
		}
	}
	ll.InsertAtTail(7)
	if got := ll.Display(); !reflect.DeepEqual(got, []int{7}) {
		t.Errorf("list unusable after emptying: %v", got)
	}
}

func TestDeleteFirstDuplicateOnly(t *testing.T) {
	ll := &SinglyLinkedList{}
	for _, v := range []int{5, 5, 6} {
		ll.InsertAtTail(v)
	}
	ll.Delete(5)
	if got := ll.Display(); !reflect.DeepEqual(got, []int{5, 6}) {
		t.Errorf("got %v, want [5 6]", got)
	}
}
