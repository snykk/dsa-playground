#include "linked_list_stack.cpp"
#include <cassert>
#include <iostream>
using namespace std;

int main() {
    LinkedListStack s;

    s.push(10);
    s.push(20);
    assert(s.peek() == 20);
    assert(s.pop() == 20);
    assert(s.pop() == 10);
    assert(s.isEmpty());

    cout << "All C++ linked list stack tests passed!" << endl;
    return 0;
}
