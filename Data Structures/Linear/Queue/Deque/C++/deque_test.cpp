#include <iostream>
#include <cassert>
#include "deque.cpp"

void test_push_front_pop_front() {
    Deque dq;
    dq.push_front(1);
    dq.push_front(2);
    assert(dq.pop_front() == 2);
    assert(dq.pop_front() == 1);
    cout << "test_push_front_pop_front passed" << endl;
}

void test_push_back_pop_back() {
    Deque dq;
    dq.push_back(1);
    dq.push_back(2);
    assert(dq.pop_back() == 2);
    assert(dq.pop_back() == 1);
    cout << "test_push_back_pop_back passed" << endl;
}

void test_mixed_operations() {
    Deque dq;
    dq.push_front(1);
    dq.push_back(2);
    dq.push_front(3);
    dq.push_back(4);
    assert(dq.peek_front() == 3);
    assert(dq.peek_back() == 4);
    assert(dq.size() == 4);
    cout << "test_mixed_operations passed" << endl;
}

void test_pop_front() {
    Deque dq;
    dq.push_back(1);
    dq.push_back(2);
    assert(dq.pop_front() == 1);
    assert(dq.pop_front() == 2);
    cout << "test_pop_front passed" << endl;
}

void test_pop_back() {
    Deque dq;
    dq.push_front(1);
    dq.push_front(2);
    assert(dq.pop_back() == 1);
    assert(dq.pop_back() == 2);
    cout << "test_pop_back passed" << endl;
}

void test_is_empty() {
    Deque dq;
    assert(dq.is_empty() == true);
    dq.push_front(1);
    assert(dq.is_empty() == false);
    dq.pop_front();
    assert(dq.is_empty() == true);
    cout << "test_is_empty passed" << endl;
}

void test_size() {
    Deque dq;
    assert(dq.size() == 0);
    dq.push_front(1);
    dq.push_back(2);
    assert(dq.size() == 2);
    dq.pop_front();
    assert(dq.size() == 1);
    cout << "test_size passed" << endl;
}

int main() {
    cout << "Running Deque tests..." << endl;
    test_push_front_pop_front();
    test_push_back_pop_back();
    test_mixed_operations();
    test_pop_front();
    test_pop_back();
    test_is_empty();
    test_size();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

