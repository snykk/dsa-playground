#include "circular_queue.cpp"
#include <cassert>
#include <iostream>

int main() {
    CircularQueue q(3);

    // Test enqueue and dequeue
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    assert(q.is_full());
    assert(q.dequeue() == 1);
    q.enqueue(4);
    assert(q.peek() == 2);
    assert(q.size() == 3);

    // Test empty queue
    q.dequeue(); q.dequeue(); q.dequeue();
    assert(q.is_empty());

    try {
        q.dequeue();
        assert(false);
    } catch (const std::runtime_error&) {
        std::cout << "Empty queue test passed." << std::endl;
    }

    std::cout << "All Circular Queue tests passed." << std::endl;
    return 0;
}
