#include <cstdint>
#include <vector>
#include <stdexcept>
#include <algorithm>
using namespace std;

struct PQItem {
    int priority;
    uint64_t count;  // insertion order; 64-bit so it cannot overflow in practice
    int item;
    
    bool operator<(const PQItem& other) const {
        if (priority != other.priority) {
            return priority < other.priority;
        }
        return count < other.count;
    }
};

class PriorityQueue {
    vector<PQItem> heap;
    uint64_t count;

    void heapify_up(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (heap[index] < heap[parent]) {
                swap(heap[parent], heap[index]);
                index = parent;
            } else {
                break;
            }
        }
    }

    void heapify_down(int index) {
        int n = heap.size();
        while (true) {
            int smallest = index;
            int left = 2 * index + 1;
            int right = 2 * index + 2;

            if (left < n && heap[left] < heap[smallest]) {
                smallest = left;
            }
            if (right < n && heap[right] < heap[smallest]) {
                smallest = right;
            }

            if (smallest != index) {
                swap(heap[index], heap[smallest]);
                index = smallest;
            } else {
                break;
            }
        }
    }

public:
    PriorityQueue() : count(0) {}

    void enqueue(int item, int priority) {
        PQItem pq_item;
        pq_item.item = item;
        pq_item.priority = priority;
        pq_item.count = count++;
        heap.push_back(pq_item);
        heapify_up(heap.size() - 1);
    }

    int dequeue() {
        if (is_empty()) {
            throw runtime_error("Priority queue is empty");
        }
        int item = heap[0].item;
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) {
            heapify_down(0);
        }
        return item;
    }

    int peek() {
        if (is_empty()) {
            throw runtime_error("Priority queue is empty");
        }
        return heap[0].item;
    }

    bool is_empty() {
        return heap.empty();
    }

    int size() {
        return heap.size();
    }

    void clear() {
        heap.clear();
        count = 0;
    }
};

