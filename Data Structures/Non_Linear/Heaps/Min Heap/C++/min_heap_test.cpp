#include <iostream>
#include <vector>
#include <cassert>
#include <algorithm>
#include <functional>
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

void test_duplicates_and_negatives() {
    MinHeap heap;
    vector<int> ref = {4, -2, 4, 0, -2, 9, 9, 4, -7};
    for (int v : ref) heap.insert(v);
    sort(ref.begin(), ref.end());
    for (int v : ref) {
        assert(heap.extract_min() == v);
    }
    assert(heap.is_empty());
    cout << "Duplicates test passed!" << endl;
}

void test_random_matches_sort() {
    vector<int> ref;
    unsigned s = 99;
    for (int i = 0; i < 1000; i++) {
        s = s * 1103515245u + 12345u;
        ref.push_back((int)((s >> 8) % 200) - 100);
    }
    const MinHeap built(ref);
    MinHeap heap(ref);
    assert(built.size() == 1000);
    sort(ref.begin(), ref.end());
    for (int v : ref) assert(heap.extract_min() == v);
    cout << "Random heapify test passed!" << endl;
}

void test_empty_throws() {
    MinHeap heap;
    bool thrown = false;
    try { heap.peek(); } catch (const runtime_error&) { thrown = true; }
    assert(thrown);
    thrown = false;
    try { heap.extract_min(); } catch (const runtime_error&) { thrown = true; }
    assert(thrown);
    cout << "Empty throws test passed!" << endl;
}

int main() {
    test_duplicates_and_negatives();
    test_random_matches_sort();
    test_empty_throws();
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

