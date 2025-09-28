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

    cout << "All C++ array stack tests passed!" << endl;
    return 0;
}
