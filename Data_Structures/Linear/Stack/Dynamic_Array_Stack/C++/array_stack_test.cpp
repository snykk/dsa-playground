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

    try { stack.pop(); assert(false); } catch (const out_of_range&) {}
    try { stack.peek(); assert(false); } catch (const out_of_range&) {}

    for (int i = 0; i < 1000; i++) stack.push(i);
    assert(stack.size() == 1000);
    for (int i = 999; i >= 0; i--) assert(stack.pop() == i);
    assert(stack.is_empty());

    cout << "All tests passed!" << endl;
    return 0;
}
