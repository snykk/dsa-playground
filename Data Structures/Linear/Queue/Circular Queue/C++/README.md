# Circular Queue - C++

C++ implementation of a **Circular Queue** using a fixed-size array.

## Usage

```cpp
#include "circular_queue.cpp"
#include <iostream>
using namespace std;

int main() {
    CircularQueue q(3);
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    cout << q.dequeue() << endl; // 10
    q.enqueue(40);
    cout << q.peek() << endl;    // 20
    return 0;
}
```

---

## Compile & Run Test

```bash
g++ circular_queue_test.cpp -o circular_queue_test
./circular_queue_test
```
