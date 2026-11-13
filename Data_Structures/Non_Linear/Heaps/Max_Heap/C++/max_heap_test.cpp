#include <iostream>
#include <vector>
#include <cassert>
#include <algorithm>
#include <functional>
#include "max_heap.cpp"
using namespace std;

void test_insert_and_peek() {
    MaxHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    assert(heap.peek() == 7);
    cout << "Insert and peek test passed!" << endl;
}

void test_extract_max() {
    MaxHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);
    
    assert(heap.extract_max() == 7);
    assert(heap.extract_max() == 5);
    assert(heap.extract_max() == 3);
    assert(heap.extract_max() == 1);
    cout << "Extract max test passed!" << endl;
}

void test_heapify() {
    vector<int> arr = {5, 3, 7, 1, 9, 2};
    MaxHeap heap(arr);
    
    vector<int> result;
    while (!heap.is_empty()) {
        result.push_back(heap.extract_max());
    }
    
    vector<int> expected = {9, 7, 5, 3, 2, 1};
    assert(result == expected);
    cout << "Heapify test passed!" << endl;
}

void test_is_empty() {
    MaxHeap heap;
    assert(heap.is_empty());
    heap.insert(5);
    assert(!heap.is_empty());
    cout << "Is empty test passed!" << endl;
}

void test_size() {
    MaxHeap heap;
    assert(heap.size() == 0);
    heap.insert(5);
    heap.insert(3);
    assert(heap.size() == 2);
    cout << "Size test passed!" << endl;
}

void test_clear() {
    MaxHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.clear();
    assert(heap.is_empty());
    assert(heap.size() == 0);
    cout << "Clear test passed!" << endl;
}

void test_single_element() {
    MaxHeap heap;
    heap.insert(5);
    assert(heap.peek() == 5);
    assert(heap.extract_max() == 5);
    assert(heap.is_empty());
    cout << "Single element test passed!" << endl;
}

void test_duplicates_and_negatives() {
    MaxHeap heap;
    vector<int> ref = {4, -2, 4, 0, -2, 9, 9, 4, -7};
    for (int v : ref) heap.insert(v);
    sort(ref.begin(), ref.end(), greater<int>());
    for (int v : ref) {
        assert(heap.extract_max() == v);
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
    const MaxHeap built(ref);
    MaxHeap heap(ref);
    assert(built.size() == 1000);
    sort(ref.begin(), ref.end(), greater<int>());
    for (int v : ref) assert(heap.extract_max() == v);
    cout << "Random heapify test passed!" << endl;
}

void test_empty_throws() {
    MaxHeap heap;
    bool thrown = false;
    try { heap.peek(); } catch (const runtime_error&) { thrown = true; }
    assert(thrown);
    thrown = false;
    try { heap.extract_max(); } catch (const runtime_error&) { thrown = true; }
    assert(thrown);
    cout << "Empty throws test passed!" << endl;
}

int main() {
    test_duplicates_and_negatives();
    test_random_matches_sort();
    test_empty_throws();
    test_insert_and_peek();
    test_extract_max();
    test_heapify();
    test_is_empty();
    test_size();
    test_clear();
    test_single_element();
    cout << "All tests passed!" << endl;
    return 0;
}

