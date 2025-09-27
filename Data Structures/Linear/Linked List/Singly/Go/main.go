package main

import "fmt"

type Node struct {
	data int
	next *Node
}

type SinglyLinkedList struct {
	head *Node
}

func (ll *SinglyLinkedList) InsertAtHead(data int) {
	node := &Node{data: data, next: ll.head}
	ll.head = node
}

func (ll *SinglyLinkedList) InsertAtTail(data int) {
	node := &Node{data: data}
	if ll.head == nil {
		ll.head = node
		return
	}
	curr := ll.head
	for curr.next != nil {
		curr = curr.next
	}
	curr.next = node
}

func (ll *SinglyLinkedList) Delete(key int) {
	curr := ll.head
	var prev *Node
	for curr != nil && curr.data != key {
		prev = curr
		curr = curr.next
	}
	if curr == nil {
		return
	}
	if prev != nil {
		prev.next = curr.next
	} else {
		ll.head = curr.next
	}
}

func (ll *SinglyLinkedList) Display() []int {
	var elems []int
	curr := ll.head
	for curr != nil {
		elems = append(elems, curr.data)
		curr = curr.next
	}
	return elems
}

func main() {
	ll := &SinglyLinkedList{}
	ll.InsertAtHead(1)
	ll.InsertAtTail(2)
	fmt.Println(ll.Display()) // [1 2]
	ll.Delete(1)
	fmt.Println(ll.Display()) // [2]
}
