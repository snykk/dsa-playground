#include <iostream>
#include <cassert>
#include "priority_queue.cpp"

void test_enqueue_dequeue() {
    PriorityQueue pq;
    pq.enqueue(10, 3);
    pq.enqueue(20, 1);
    pq.enqueue(30, 2);
    // Should dequeue in order: 20 (1), 30 (2), 10 (3)
    assert(pq.dequeue() == 20);
    assert(pq.dequeue() == 30);
    assert(pq.dequeue() == 10);
    cout << "test_enqueue_dequeue passed" << endl;
}

void test_peek() {
    PriorityQueue pq;
    pq.enqueue(100, 1);
    pq.enqueue(200, 5);
    assert(pq.peek() == 100);
    // Peek should not remove the element
    assert(pq.size() == 2);
    cout << "test_peek passed" << endl;
}

void test_is_empty() {
    PriorityQueue pq;
    assert(pq.is_empty() == true);
    pq.enqueue(1, 1);
    assert(pq.is_empty() == false);
    pq.dequeue();
    assert(pq.is_empty() == true);
    cout << "test_is_empty passed" << endl;
}

void test_size() {
    PriorityQueue pq;
    assert(pq.size() == 0);
    pq.enqueue(1, 1);
    pq.enqueue(2, 2);
    assert(pq.size() == 2);
    pq.dequeue();
    assert(pq.size() == 1);
    cout << "test_size passed" << endl;
}

void test_same_priority() {
    PriorityQueue pq;
    // Items with same priority should maintain insertion order
    pq.enqueue(1, 1);
    pq.enqueue(2, 1);
    pq.enqueue(3, 1);
    assert(pq.dequeue() == 1);
    assert(pq.dequeue() == 2);
    assert(pq.dequeue() == 3);
    cout << "test_same_priority passed" << endl;
}

void test_mixed_priorities() {
    PriorityQueue pq;
    pq.enqueue(10, 10);
    pq.enqueue(1, 1);
    pq.enqueue(5, 5);
    pq.enqueue(20, 10);
    assert(pq.dequeue() == 1);
    assert(pq.dequeue() == 5);
    assert(pq.dequeue() == 10);
    assert(pq.dequeue() == 20);
    cout << "test_mixed_priorities passed" << endl;
}

void test_clear() {
    PriorityQueue pq;
    pq.enqueue(1, 1);
    pq.enqueue(2, 2);
    pq.clear();
    assert(pq.is_empty() == true);
    assert(pq.size() == 0);
    cout << "test_clear passed" << endl;
}

int main() {
    cout << "Running Priority Queue tests..." << endl;
    test_enqueue_dequeue();
    test_peek();
    test_is_empty();
    test_size();
    test_same_priority();
    test_mixed_priorities();
    test_clear();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

