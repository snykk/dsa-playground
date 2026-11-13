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

// walk follows next pointers from head and stops when it returns to head.
func walk(cll *CircularLinkedList) []int {
	var out []int
	if cll.head == nil {
		return out
	}
	temp := cll.head
	for {
		out = append(out, temp.data)
		temp = temp.next
		if temp == cll.head {
			return out
		}
	}
}

func equal(a, b []int) bool {
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

func TestDeleteOnlyNode(t *testing.T) {
	cll := &CircularLinkedList{}
	cll.InsertAtHead(42)
	cll.DeleteValue(42)
	if cll.head != nil {
		t.Fatalf("expected an empty list, walk = %v", walk(cll))
	}
	cll.InsertAtTail(7)
	if got := walk(cll); !equal(got, []int{7}) {
		t.Errorf("got %v, want [7]", got)
	}
	cll.DeleteValue(99)
	if got := walk(cll); !equal(got, []int{7}) {
		t.Errorf("missing key changed the list: %v", got)
	}
}

func TestDeleteHeadAndTailKeepsRing(t *testing.T) {
	cll := &CircularLinkedList{}
	for _, v := range []int{1, 2, 3} {
		cll.InsertAtTail(v)
	}
	cll.DeleteValue(1)
	if got := walk(cll); !equal(got, []int{2, 3}) {
		t.Errorf("got %v, want [2 3]", got)
	}
	cll.DeleteValue(3)
	if got := walk(cll); !equal(got, []int{2}) || cll.head.next != cll.head {
		t.Errorf("got %v, ring not closed", got)
	}
}
