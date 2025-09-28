#include "simple_queue.cpp"
#include <cassert>
#include <iostream>

int main() {
    SimpleQueue q;

    q.enqueue(1);
    q.enqueue(2);
    assert(q.dequeue() == 1);
    assert(q.peek() == 2);
    assert(!q.is_empty());
    assert(q.size() == 1);

    q.dequeue();
    assert(q.is_empty());

    try {
        q.dequeue();
        assert(false); // should not reach here
    } catch (const std::runtime_error&) {
        std::cout << "Empty queue test passed." << std::endl;
    }

    std::cout << "All Simple Queue tests passed." << std::endl;
    return 0;
}
