#include <iostream>
#include <stdexcept>
using namespace std;

class CircularQueue {
    int* queue;
    int front, rear, capacity;
public:
    CircularQueue(int size) : capacity(size), front(-1), rear(-1) {
        queue = new int[capacity];
    }

    ~CircularQueue() { delete[] queue; }

    void enqueue(int x) {
        if (is_full()) throw overflow_error("Queue is full");
        if (is_empty()) front = 0;
        rear = (rear + 1) % capacity;
        queue[rear] = x;
    }

    int dequeue() {
        if (is_empty()) throw runtime_error("Queue is empty");
        int val = queue[front];
        if (front == rear) front = rear = -1;
        else front = (front + 1) % capacity;
        return val;
    }

    int peek() {
        if (is_empty()) throw runtime_error("Queue is empty");
        return queue[front];
    }

    bool is_empty() { return front == -1; }

    bool is_full() { return (rear + 1) % capacity == front; }

    int size() {
        if (is_empty()) return 0;
        if (rear >= front) return rear - front + 1;
        return capacity - front + rear + 1;
    }
};