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

void test_empty_errors() {
    PriorityQueue pq;
    try { pq.dequeue(); assert(false); } catch (const runtime_error&) {}
    try { pq.peek(); assert(false); } catch (const runtime_error&) {}
    cout << "test_empty_errors passed" << endl;
}

void test_heap_order_random() {
    PriorityQueue pq;
    unsigned seed = 12345;
    for (int i = 0; i < 200; i++) {
        seed = seed * 1103515245u + 12345u;
        pq.enqueue(i, (int)((seed >> 16) % 10));
    }
    // Priority never decreases, and equal priorities leave in insertion order.
    int last_priority = -1, last_item = -1;
    int priority_of[200];
    seed = 12345;
    for (int i = 0; i < 200; i++) {
        seed = seed * 1103515245u + 12345u;
        priority_of[i] = (int)((seed >> 16) % 10);
    }
    while (!pq.is_empty()) {
        int item = pq.dequeue();
        int pr = priority_of[item];
        assert(pr > last_priority || (pr == last_priority && item > last_item));
        last_priority = pr;
        last_item = item;
    }
    cout << "test_heap_order_random passed" << endl;
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
    test_empty_errors();
    test_heap_order_random();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

