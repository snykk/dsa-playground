#include <vector>
#include <stdexcept>
using namespace std;

class Deque {
    vector<int> deque;

public:
    void push_front(int item) {
        deque.insert(deque.begin(), item);
    }

    void push_back(int item) {
        deque.push_back(item);
    }

    int pop_front() {
        if (is_empty()) {
            throw runtime_error("Deque is empty");
        }
        int val = deque.front();
        deque.erase(deque.begin());
        return val;
    }

    int pop_back() {
        if (is_empty()) {
            throw runtime_error("Deque is empty");
        }
        int val = deque.back();
        deque.pop_back();
        return val;
    }

    int peek_front() {
        if (is_empty()) {
            throw runtime_error("Deque is empty");
        }
        return deque.front();
    }

    int peek_back() {
        if (is_empty()) {
            throw runtime_error("Deque is empty");
        }
        return deque.back();
    }

    bool is_empty() {
        return deque.empty();
    }

    int size() {
        return deque.size();
    }
};

