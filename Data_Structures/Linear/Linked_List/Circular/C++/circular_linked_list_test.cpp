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

    // Regression: deleting the only node empties the list (used to leave head dangling)
    {
        CircularLinkedList one;
        one.insertAtHead(42);
        one.deleteValue(42);
        assert(one.head == nullptr);
        assert(listToVector(one).empty());
        one.insertAtTail(7);
        assert((listToVector(one) == std::vector<int>{7}));
        one.deleteValue(99);  // missing key leaves a single node alone
        assert((listToVector(one) == std::vector<int>{7}));
    }

    // Deleting the head and the tail keeps the ring closed
    {
        CircularLinkedList three;
        for(int v : {1, 2, 3}) three.insertAtTail(v);
        three.deleteValue(1);
        assert((listToVector(three) == std::vector<int>{2, 3}));
        three.deleteValue(3);
        assert((listToVector(three) == std::vector<int>{2}));
        assert(three.head->next == three.head);
    }

    // Many lists are freed by the destructor (checked with AddressSanitizer)
    for(int round = 0; round < 50; round++) {
        CircularLinkedList big;
        for(int v = 0; v < 20; v++) big.insertAtTail(v);
    }

    std::cout << "All Circular Linked List tests passed!" << std::endl;
    return 0;
}
