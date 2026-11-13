#include "linked_list_stack.cpp"
#include <cassert>
#include <iostream>
#include <cstdlib>
#include <new>
using namespace std;

// Count live heap allocations so the test can detect leaked nodes.
static long live_allocations = 0;
void* operator new(size_t n) {
    void* p = malloc(n);
    if (!p) throw bad_alloc();
    live_allocations++;
    return p;
}
void operator delete(void* p) noexcept {
    if (p) live_allocations--;
    free(p);
}
void operator delete(void* p, size_t) noexcept { operator delete(p); }

int main() {
    LinkedListStack s;

    s.push(10);
    s.push(20);
    assert(s.peek() == 20);
    assert(s.pop() == 20);
    assert(s.pop() == 10);
    assert(s.isEmpty());

    // Regression: nodes left on the stack must be freed by the destructor.
    long before = live_allocations;
    {
        LinkedListStack big;
        for (int i = 0; i < 999; i++) big.push(i);
        assert(big.size() == 999);
    }
    assert(live_allocations == before);

    // Underflow.
    try { s.pop(); assert(false); } catch (const underflow_error&) {}
    try { s.peek(); assert(false); } catch (const underflow_error&) {}

    cout << "All C++ linked list stack tests passed!" << endl;
    return 0;
}
