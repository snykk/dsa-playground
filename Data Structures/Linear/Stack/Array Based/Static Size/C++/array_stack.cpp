
#include <iostream>
using namespace std;

class ArrayStack {
private:
    int* arr;
    int capacity;
    int topIndex;

public:
    ArrayStack(int size = 100) {
        capacity = size;
        arr = new int[capacity];
        topIndex = -1;
    }

    ~ArrayStack() {
        delete[] arr;
    }

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
