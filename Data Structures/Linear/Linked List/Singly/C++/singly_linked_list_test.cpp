#include "singly_linked_list.cpp"
#include <cassert>

int main() {
    SinglyLinkedList ll;
    ll.insert_at_head(1);
    ll.insert_at_tail(2);
    ll.display(); // 1 2

    ll.delete_node(1);
    ll.display(); // 2

    return 0;
}
