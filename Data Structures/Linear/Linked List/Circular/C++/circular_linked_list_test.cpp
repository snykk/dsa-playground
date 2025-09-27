#include "circular_linked_list.cpp"
#include <cassert>
#include <vector>
#include <iostream>

std::vector<int> listToVector(CircularLinkedList& cll, int limit=10) {
    std::vector<int> result;
    if(!cll.head) return result;
    Node* temp = cll.head;
    int count = 0;
    do {
        result.push_back(temp->data);
        temp = temp->next;
        count++;
    } while(temp != cll.head && count < limit);
    return result;
}

int main() {
    CircularLinkedList cll;

    // Insert at head
    cll.insertAtHead(10);
    cll.insertAtHead(20);
    cll.insertAtTail(30);

    // Expected: 20 -> 10 -> 30
    std::vector<int> expected1 = {20, 10, 30};
    assert(listToVector(cll, 10) == expected1);

    // Delete a value
    cll.deleteValue(10);

    // Expected: 20 -> 30
    std::vector<int> expected2 = {20, 30};
    assert(listToVector(cll, 10) == expected2);

    std::cout << "All Circular Linked List tests passed!" << std::endl;
    return 0;
}
