#include <iostream>
#include <vector>
#include <stdexcept>
using namespace std;

class ArrayStack {
private:
    vector<int> stack;

public:
    void push(int value) {
        stack.push_back(value); // vector dynamically resizes
    }

    int pop() {
        if (stack.empty())
            throw out_of_range("Pop from empty stack");
        int value = stack.back();
        stack.pop_back();
        return value;
    }

    int peek() {
        if (stack.empty())
            throw out_of_range("Peek from empty stack");
        return stack.back();
    }

    bool is_empty() {
        return stack.empty();
    }

    int size() {
        return stack.size();
    }
};
