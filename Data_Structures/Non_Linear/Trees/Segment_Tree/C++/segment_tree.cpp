#include <iostream>
#include <stdexcept>
#include <vector>
using namespace std;

class SegmentTree {
    int n;
    int size;
    vector<long long> tree;

    void check(int index) const {
        if (index < 0 || index >= n) {
            throw out_of_range("SegmentTree: index out of range");
        }
    }

public:
    SegmentTree(const vector<int>& arr) {
        n = (int)arr.size();
        size = 1;
        while (size < n) size *= 2;
        tree.resize(2 * size, 0);
        
        for (int i = 0; i < n; i++) {
            tree[size + i] = arr[i];
        }
        for (int i = size - 1; i > 0; i--) {
            tree[i] = tree[2 * i] + tree[2 * i + 1];
        }
    }

    // Assigns value to element index. Throws std::out_of_range unless 0 <= index < n.
    void update(int index, long long value) {
        check(index);
        index += size;
        tree[index] = value;
        index /= 2;
        while (index) {
            tree[index] = tree[2 * index] + tree[2 * index + 1];
            index /= 2;
        }
    }

    // Sum of elements left..right, inclusive. Throws std::out_of_range unless 0 <= left <= right < n.
    long long query(int left, int right) const {
        check(left);
        check(right);
        if (left > right) {
            throw out_of_range("SegmentTree: left is greater than right");
        }
        left += size;
        right += size;
        long long result = 0;
        
        while (left <= right) {
            if (left % 2 == 1) {
                result += tree[left];
                left++;
            }
            if (right % 2 == 0) {
                result += tree[right];
                right--;
            }
            left /= 2;
            right /= 2;
        }
        
        return result;
    }

    long long get(int index) const {
        check(index);
        return tree[size + index];
    }
};

