#include <iostream>
#include <stdexcept>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedListStack {
private:
    Node* topNode;
    int count;

public:
    LinkedListStack() : topNode(nullptr), count(0) {}

    void push(int value) {
        Node* newNode = new Node(value);
        newNode->next = topNode;
        topNode = newNode;
        count++;
    }

    int pop() {
        if (isEmpty()) throw underflow_error("Pop from empty stack");
        int val = topNode->data;
        Node* temp = topNode;
        topNode = topNode->next;
        delete temp;
        count--;
        return val;
    }

    int peek() {
        if (isEmpty()) throw underflow_error("Peek from empty stack");
        return topNode->data;
    }

    bool isEmpty() {
        return topNode == nullptr;
    }

    int size() {
        return count;
    }
};
