#include <vector>
#include <stdexcept>
#include <algorithm>
using namespace std;

class MinHeap {
    vector<int> heap;

    int parent(int index) {
        return (index - 1) / 2;
    }

    int left_child(int index) {
        return 2 * index + 1;
    }

    int right_child(int index) {
        return 2 * index + 2;
    }

    void heapify_up(int index) {
        while (index > 0) {
            int p = parent(index);
            if (heap[p] <= heap[index]) {
                break;
            }
            swap(heap[p], heap[index]);
            index = p;
        }
    }

    void heapify_down(int index) {
        while (true) {
            int smallest = index;
            int left = left_child(index);
            int right = right_child(index);

            if (left < heap.size() && heap[left] < heap[smallest]) {
                smallest = left;
            }
            if (right < heap.size() && heap[right] < heap[smallest]) {
                smallest = right;
            }

            if (smallest == index) {
                break;
            }

            swap(heap[index], heap[smallest]);
            index = smallest;
        }
    }

    void build_heap() {
        int n = heap.size();
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify_down(i);
        }
    }

public:
    MinHeap() {}

    MinHeap(vector<int>& arr) {
        heap = arr;
        build_heap();
    }

    void insert(int value) {
        heap.push_back(value);
        heapify_up(heap.size() - 1);
    }

    int extract_min() {
        if (is_empty()) {
            throw runtime_error("Heap is empty");
        }
        if (heap.size() == 1) {
            int min_val = heap[0];
            heap.pop_back();
            return min_val;
        }
        int min_val = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        heapify_down(0);
        return min_val;
    }

    int peek() {
        if (is_empty()) {
            throw runtime_error("Heap is empty");
        }
        return heap[0];
    }

    bool is_empty() {
        return heap.empty();
    }

    int size() {
        return heap.size();
    }

    void clear() {
        heap.clear();
    }
};

