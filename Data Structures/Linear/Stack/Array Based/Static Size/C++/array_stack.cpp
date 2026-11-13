
#include <iostream>
#include <stdexcept>
using namespace std;

class ArrayStack {
private:
    int* arr;
    int capacity;
    int topIndex;

public:
    explicit ArrayStack(int size = 100) : arr(nullptr), capacity(size), topIndex(-1) {
        if (size < 1) {
            throw invalid_argument("Capacity must be at least 1");
        }
        arr = new int[capacity];
    }

    ~ArrayStack() {
        delete[] arr;
    }

    // The stack owns a raw array, so a copy would free it twice.
    ArrayStack(const ArrayStack&) = delete;
    ArrayStack& operator=(const ArrayStack&) = delete;

    void push(int value) {
        if (topIndex == capacity - 1) {
            throw overflow_error("Stack overflow");
        }
        arr[++topIndex] = value;
    }

    int pop() {
        if (isEmpty()) {
            throw underflow_error("Stack underflow");
        }
        return arr[topIndex--];
    }

    int peek() {
        if (isEmpty()) {
            throw underflow_error("Stack is empty");
        }
        return arr[topIndex];
    }

    bool isEmpty() {
        return topIndex == -1;
    }

    int size() {
        return topIndex + 1;
    }
};
