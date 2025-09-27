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

    cout << "All tests passed!" << endl;
    return 0;
}
