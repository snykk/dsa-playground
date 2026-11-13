#include "array_stack.cpp"
#include <cassert>
#include <iostream>
using namespace std;

int main() {
    ArrayStack s(10);

    s.push(10);
    s.push(20);
    assert(s.peek() == 20);
    assert(s.pop() == 20);
    assert(s.pop() == 10);
    assert(s.isEmpty());

    // Overflow: the stack holds exactly `capacity` items.
    ArrayStack small(3);
    small.push(1); small.push(2); small.push(3);
    assert(small.size() == 3);
    try { small.push(4); assert(false); } catch (const overflow_error&) {}
    assert(small.pop() == 3);
    small.push(9);
    assert(small.peek() == 9);

    // Underflow.
    ArrayStack empty(2);
    try { empty.pop(); assert(false); } catch (const underflow_error&) {}
    try { empty.peek(); assert(false); } catch (const underflow_error&) {}

    // Invalid capacity.
    for (int bad : {0, -1}) {
        try { ArrayStack broken(bad); assert(false); } catch (const invalid_argument&) {}
    }

    cout << "All C++ array stack tests passed!" << endl;
    return 0;
}
