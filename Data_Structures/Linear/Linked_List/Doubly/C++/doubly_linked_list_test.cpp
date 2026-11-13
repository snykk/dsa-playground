#include "doubly_linked_list.cpp"
#include <cassert>
#include <iostream>
using namespace std;

int main() {
    DoublyLinkedList dll;

    // Insert at head
    dll.insertAtHead(10);
    assert(dll.head->data == 10);
    dll.insertAtHead(20);
    assert(dll.head->data == 20);

    // Insert at tail
    dll.insertAtTail(30);
    Node* temp = dll.head;
    while(temp->next) temp = temp->next;
    assert(temp->data == 30);

    // Delete a value
    dll.deleteValue(20);
    temp = dll.head;
    while(temp) {
        assert(temp->data != 20);
        temp = temp->next;
    }

    // Deleting keeps every prev link correct (checked walking backward)
    {
        DoublyLinkedList list;
        for(int v : {1, 2, 3, 4}) list.insertAtTail(v);
        list.deleteValue(2);
        list.deleteValue(1);
        assert(list.head->data == 3 && list.head->prev == nullptr);
        Node* last = list.head;
        while(last->next) last = last->next;
        assert(last->data == 4 && last->prev == list.head);
        list.deleteValue(4);
        assert(list.head->next == nullptr);
        list.deleteValue(3);
        assert(list.head == nullptr);
        list.deleteValue(3);  // empty list: no effect
    }

    // Regression: the destructor frees every node (checked with AddressSanitizer)
    for(int round = 0; round < 50; round++) {
        DoublyLinkedList big;
        for(int v = 0; v < 20; v++) big.insertAtTail(v);
        big.deleteValue(5);
    }

    cout << "All tests passed!" << endl;
    return 0;
}
