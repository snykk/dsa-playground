#include <iostream>
#include <vector>
using namespace std;

class SegmentTree {
    int n;
    int size;
    vector<int> tree;

public:
    SegmentTree(vector<int>& arr) {
        n = arr.size();
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

    void update(int index, int value) {
        index += size;
        tree[index] = value;
        index /= 2;
        while (index) {
            tree[index] = tree[2 * index] + tree[2 * index + 1];
            index /= 2;
        }
    }

    int query(int left, int right) {
        left += size;
        right += size;
        int result = 0;
        
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

    int get(int index) {
        return tree[size + index];
    }
};

