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

    int peek() const {
        if (queue.empty()) throw runtime_error("Queue is empty");
        return queue.front();
    }

    bool is_empty() const { return queue.empty(); }

    int size() const { return queue.size(); }
};