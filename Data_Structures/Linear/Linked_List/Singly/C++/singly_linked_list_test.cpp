#include "singly_linked_list.cpp"
#include <cassert>
#include <vector>

int main() {
    SinglyLinkedList ll;
    assert(ll.to_vector().empty());

    ll.insert_at_head(1);
    ll.insert_at_tail(2);
    ll.display(); // 1 2
    assert((ll.to_vector() == vector<int>{1, 2}));

    ll.delete_node(1);
    ll.display(); // 2
    assert((ll.to_vector() == vector<int>{2}));

    // Delete: head, middle, tail, only node, missing key, empty list
    SinglyLinkedList list;
    list.delete_node(5);  // empty list: no effect
    for(int v : {1, 2, 3, 4}) list.insert_at_tail(v);
    list.delete_node(1);
    assert((list.to_vector() == vector<int>{2, 3, 4}));
    list.delete_node(3);
    assert((list.to_vector() == vector<int>{2, 4}));
    list.delete_node(4);
    assert((list.to_vector() == vector<int>{2}));
    list.delete_node(99);
    assert((list.to_vector() == vector<int>{2}));
    list.delete_node(2);
    assert(list.to_vector().empty());
    list.insert_at_tail(7);  // still usable after emptying
    assert((list.to_vector() == vector<int>{7}));

    // Duplicates: only the first match is removed
    SinglyLinkedList dup;
    for(int v : {5, 5, 6}) dup.insert_at_tail(v);
    dup.delete_node(5);
    assert((dup.to_vector() == vector<int>{5, 6}));

    // Regression: the destructor frees every node (checked with AddressSanitizer)
    for(int round = 0; round < 50; round++) {
        SinglyLinkedList big;
        for(int v = 0; v < 20; v++) big.insert_at_tail(v);
        big.delete_node(7);
    }

    cout << "All Singly Linked List tests passed!" << endl;
    return 0;
}
