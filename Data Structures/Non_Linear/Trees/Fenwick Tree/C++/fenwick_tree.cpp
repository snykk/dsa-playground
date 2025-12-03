#include <iostream>
#include <vector>
using namespace std;

class FenwickTree {
    int n;
    vector<int> tree;

    int lsb(int index) {
        return index & (-index);
    }

public:
    FenwickTree(vector<int>& arr) {
        n = arr.size();
        tree.resize(n + 1, 0);
        
        for (int i = 0; i < n; i++) {
            update(i, arr[i]);
        }
    }

    void update(int index, int delta) {
        index++;
        while (index <= n) {
            tree[index] += delta;
            index += lsb(index);
        }
    }

    int prefixSum(int index) {
        index++;
        int result = 0;
        while (index > 0) {
            result += tree[index];
            index -= lsb(index);
        }
        return result;
    }

    int query(int left, int right) {
        if (left == 0) {
            return prefixSum(right);
        }
        return prefixSum(right) - prefixSum(left - 1);
    }

    int get(int index) {
        return query(index, index);
    }
};

