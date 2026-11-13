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

    // Regression: a capacity below 1 used to divide by zero.
    for (int bad : {0, -2}) {
        try {
            CircularQueue broken(bad);
            assert(false);
        } catch (const std::invalid_argument&) {
        }
    }

    // Full queue rejects enqueue; wrap around over many laps.
    CircularQueue r(3);
    r.enqueue(1); r.enqueue(2); r.enqueue(3);
    try {
        r.enqueue(4);
        assert(false);
    } catch (const std::overflow_error&) {
    }
    for (int i = 0; i < 20; i++) {
        r.dequeue();
        r.enqueue(i);
    }
    assert(r.dequeue() == 17 && r.dequeue() == 18 && r.dequeue() == 19);

    std::cout << "All Circular Queue tests passed." << std::endl;
    return 0;
}
