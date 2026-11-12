#include <iostream>
#include <vector>
#include <cassert>
#include <type_traits>
#include <algorithm>
#include "fibonacci_heap.cpp"
using namespace std;

void test_insert_and_peek() {
    FibonacciHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    assert(heap.peek() == 3);
    cout << "Insert and peek test passed!" << endl;
}

void test_extract_min() {
    FibonacciHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);
    
    assert(heap.extract_min() == 1);
    assert(heap.extract_min() == 3);
    assert(heap.extract_min() == 5);
    assert(heap.extract_min() == 7);
    cout << "Extract min test passed!" << endl;
}

void test_is_empty() {
    FibonacciHeap heap;
    assert(heap.is_empty());
    heap.insert(5);
    assert(!heap.is_empty());
    cout << "Is empty test passed!" << endl;
}

void test_size() {
    FibonacciHeap heap;
    assert(heap.size() == 0);
    heap.insert(5);
    heap.insert(3);
    assert(heap.size() == 2);
    cout << "Size test passed!" << endl;
}

void test_clear() {
    FibonacciHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.clear();
    assert(heap.is_empty());
    assert(heap.size() == 0);
    cout << "Clear test passed!" << endl;
}

void test_single_element() {
    FibonacciHeap heap;
    heap.insert(5);
    assert(heap.peek() == 5);
    assert(heap.extract_min() == 5);
    assert(heap.is_empty());
    cout << "Single element test passed!" << endl;
}

void test_multiple_extracts() {
    FibonacciHeap heap;
    vector<int> arr = {5, 3, 7, 1, 9, 2};
    for (int val : arr) {
        heap.insert(val);
    }
    
    vector<int> result;
    while (!heap.is_empty()) {
        result.push_back(heap.extract_min());
    }
    
    vector<int> expected = {1, 2, 3, 5, 7, 9};
    assert(result == expected);
    cout << "Multiple extracts test passed!" << endl;
}

void test_not_copyable() {
    // Regression: copying used to share nodes and double free them.
    static_assert(!is_copy_constructible<FibonacciHeap>::value, "no copy ctor");
    static_assert(!is_copy_assignable<FibonacciHeap>::value, "no copy assignment");
    cout << "Not copyable test passed!" << endl;
}

void test_consolidation_at_scale() {
    FibonacciHeap heap;
    vector<int> vals;
    unsigned s = 12345;
    for (int i = 0; i < 2000; i++) {
        s = s * 1103515245u + 12345u;
        vals.push_back((int)((s >> 8) % 500) - 250);  // duplicates, negatives
    }
    for (int v : vals) heap.insert(v);
    sort(vals.begin(), vals.end());
    for (int v : vals) {
        assert(heap.extract_min() == v);
    }
    assert(heap.is_empty());
    cout << "Consolidation at scale test passed!" << endl;
}

int main() {
    test_not_copyable();
    test_consolidation_at_scale();
    test_insert_and_peek();
    test_extract_min();
    test_is_empty();
    test_size();
    test_clear();
    test_single_element();
    test_multiple_extracts();
    cout << "All tests passed!" << endl;
    return 0;
}

