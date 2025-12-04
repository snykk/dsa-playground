#include <iostream>
#include <vector>
#include <cassert>
#include "min_heap.cpp"
using namespace std;

void test_insert_and_peek() {
    MinHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    assert(heap.peek() == 3);
    cout << "Insert and peek test passed!" << endl;
}

void test_extract_min() {
    MinHeap heap;
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

void test_heapify() {
    vector<int> arr = {5, 3, 7, 1, 9, 2};
    MinHeap heap(arr);
    
    vector<int> result;
    while (!heap.is_empty()) {
        result.push_back(heap.extract_min());
    }
    
    vector<int> expected = {1, 2, 3, 5, 7, 9};
    assert(result == expected);
    cout << "Heapify test passed!" << endl;
}

void test_is_empty() {
    MinHeap heap;
    assert(heap.is_empty());
    heap.insert(5);
    assert(!heap.is_empty());
    cout << "Is empty test passed!" << endl;
}

void test_size() {
    MinHeap heap;
    assert(heap.size() == 0);
    heap.insert(5);
    heap.insert(3);
    assert(heap.size() == 2);
    cout << "Size test passed!" << endl;
}

void test_clear() {
    MinHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.clear();
    assert(heap.is_empty());
    assert(heap.size() == 0);
    cout << "Clear test passed!" << endl;
}

void test_single_element() {
    MinHeap heap;
    heap.insert(5);
    assert(heap.peek() == 5);
    assert(heap.extract_min() == 5);
    assert(heap.is_empty());
    cout << "Single element test passed!" << endl;
}

int main() {
    test_insert_and_peek();
    test_extract_min();
    test_heapify();
    test_is_empty();
    test_size();
    test_clear();
    test_single_element();
    cout << "All tests passed!" << endl;
    return 0;
}

