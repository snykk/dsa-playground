package main

import "fmt"

type Node struct {
	data int
	next *Node
}

type CircularLinkedList struct {
	head *Node
}

func (cll *CircularLinkedList) InsertAtHead(val int) {
	newNode := &Node{data: val}
	if cll.head == nil {
		cll.head = newNode
		newNode.next = cll.head
		return
	}
	temp := cll.head
	for temp.next != cll.head {
		temp = temp.next
	}
	newNode.next = cll.head
	cll.head = newNode
	temp.next = cll.head
}

func (cll *CircularLinkedList) InsertAtTail(val int) {
	newNode := &Node{data: val}
	if cll.head == nil {
		cll.head = newNode
		newNode.next = cll.head
		return
	}
	temp := cll.head
	for temp.next != cll.head {
		temp = temp.next
	}
	temp.next = newNode
	newNode.next = cll.head
}

func (cll *CircularLinkedList) DeleteValue(key int) {
	if cll.head == nil {
		return
	}
	if cll.head.next == cll.head { // a single node: it is also the tail
		if cll.head.data == key {
			cll.head = nil
		}
		return
	}
	curr := cll.head
	var prev *Node
	for {
		if curr.data == key {
			if prev != nil {
				prev.next = curr.next
			} else {
				tail := cll.head
				for tail.next != cll.head {
					tail = tail.next
				}
				cll.head = curr.next
				tail.next = cll.head
			}
			return
		}
		prev = curr
		curr = curr.next
		if curr == cll.head {
			break
		}
	}
}

func (cll *CircularLinkedList) Traverse(limit int) {
	if cll.head == nil {
		return
	}
	temp := cll.head
	count := 0
	for {
		fmt.Print(temp.data, " ")
		temp = temp.next
		count++
		if temp == cll.head || count >= limit {
			break
		}
	}
	fmt.Println()
}

func main() {
	cll := &CircularLinkedList{}
	cll.InsertAtHead(10)
	cll.InsertAtHead(20)
	cll.InsertAtTail(30)
	cll.Traverse(5)
	cll.DeleteValue(10)
	cll.Traverse(5)
}
