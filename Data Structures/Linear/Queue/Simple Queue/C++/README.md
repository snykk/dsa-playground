# Simple Queue - C++

C++ implementation of a **Simple Queue** (FIFO) using a vector.

## Usage

```cpp
#include "simple_queue.cpp"
#include <iostream>
using namespace std;

int main() {
    SimpleQueue q;
    q.enqueue(1);
    q.enqueue(2);
    cout << q.dequeue() << endl;  // Output: 1
    cout << q.peek() << endl;     // Output: 2
    return 0;
}
```

## Compile and Run

```bash
g++ simple_queue_test.cpp -o simple_queue_test
./simple_queue_test
```
