#include <vector>
#include <stdexcept>
using namespace std;

class SimpleQueue {
    vector<int> queue;
public:
    void enqueue(int x) { queue.push_back(x); }

    int dequeue() {
        if (queue.empty()) throw runtime_error("Queue is empty");
        int val = queue.front();
        queue.erase(queue.begin());
        return val;
    }

    int peek() {
        if (queue.empty()) throw runtime_error("Queue is empty");
        return queue.front();
    }

    bool is_empty() { return queue.empty(); }

    int size() { return queue.size(); }
};