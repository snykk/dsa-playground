package main

import "fmt"

type Node struct {
	data int
	prev *Node
	next *Node
}

type DoublyLinkedList struct {
	head *Node
}

func (dll *DoublyLinkedList) InsertAtHead(data int) {
	newNode := &Node{data: data}
	if dll.head != nil {
		dll.head.prev = newNode
		newNode.next = dll.head
	}
	dll.head = newNode
}

func (dll *DoublyLinkedList) InsertAtTail(data int) {
	newNode := &Node{data: data}
	if dll.head == nil {
		dll.head = newNode
		return
	}
	temp := dll.head
	for temp.next != nil {
		temp = temp.next
	}
	temp.next = newNode
	newNode.prev = temp
}

func (dll *DoublyLinkedList) DeleteValue(data int) {
	temp := dll.head
	for temp != nil {
		if temp.data == data {
			if temp.prev != nil {
				temp.prev.next = temp.next
			} else {
				dll.head = temp.next
			}
			if temp.next != nil {
				temp.next.prev = temp.prev
			}
			return
		}
		temp = temp.next
	}
}

func (dll *DoublyLinkedList) TraverseForward() {
	temp := dll.head
	for temp != nil {
		fmt.Print(temp.data, " <-> ")
		temp = temp.next
	}
	fmt.Println("nil")
}

func (dll *DoublyLinkedList) TraverseBackward() {
	temp := dll.head
	if temp == nil {
		fmt.Println("nil")
		return
	}
	for temp.next != nil {
		temp = temp.next
	}
	for temp != nil {
		fmt.Print(temp.data, " <-> ")
		temp = temp.prev
	}
	fmt.Println("nil")
}

func main() {
	dll := &DoublyLinkedList{}
	dll.InsertAtHead(10)
	dll.InsertAtTail(20)
	dll.InsertAtTail(30)
	dll.TraverseForward()
	dll.TraverseBackward()
	dll.DeleteValue(20)
	dll.TraverseForward()
}
