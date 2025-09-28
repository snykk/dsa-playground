#include "array_stack.cpp"
#include <cassert>

int main() {
    ArrayStack stack;
    stack.push(10);
    stack.push(20);
    stack.push(30);

    assert(stack.peek() == 30);
    assert(stack.pop() == 30);
    assert(stack.pop() == 20);
    assert(!stack.is_empty());
    assert(stack.pop() == 10);
    assert(stack.is_empty());

    cout << "All tests passed!" << endl;
    return 0;
}
