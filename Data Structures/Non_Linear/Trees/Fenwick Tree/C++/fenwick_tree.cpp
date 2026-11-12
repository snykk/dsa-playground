#include <iostream>
#include <stdexcept>
#include <vector>
using namespace std;

class FenwickTree {
    int n;
    vector<long long> tree;

    int lsb(int index) const {
        return index & (-index);
    }

    void check(int index) const {
        if (index < 0 || index >= n) {
            throw out_of_range("FenwickTree: index out of range");
        }
    }

public:
    FenwickTree(const vector<int>& arr) {
        n = (int)arr.size();
        tree.assign(n + 1, 0);

        for (int i = 0; i < n; i++) {
            update(i, arr[i]);
        }
    }

    // Throws std::out_of_range unless 0 <= index < n.
    void update(int index, long long delta) {
        check(index);
        index++;
        while (index <= n) {
            tree[index] += delta;
            index += lsb(index);
        }
    }

    long long prefixSum(int index) const {
        check(index);
        index++;
        long long result = 0;
        while (index > 0) {
            result += tree[index];
            index -= lsb(index);
        }
        return result;
    }

    long long query(int left, int right) const {
        check(left);
        check(right);
        if (left > right) {
            throw out_of_range("FenwickTree: left is greater than right");
        }
        if (left == 0) {
            return prefixSum(right);
        }
        return prefixSum(right) - prefixSum(left - 1);
    }

    long long get(int index) const {
        return query(index, index);
    }
};
