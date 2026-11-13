#include <vector>
using namespace std;

class LazySegmentTree {
    int n;
    vector<long long> tree;
    vector<long long> lazy;

    void build(const vector<int>& arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
        } else {
            int mid = (start + end) / 2;
            build(arr, 2 * node, start, mid);
            build(arr, 2 * node + 1, mid + 1, end);
            tree[node] = tree[2 * node] + tree[2 * node + 1];
        }
    }

    void pushDown(int node, int start, int end) {
        if (lazy[node] != 0) {
            int mid = (start + end) / 2;
            int leftCount = mid - start + 1;
            int rightCount = end - mid;

            tree[2 * node] += lazy[node] * leftCount;
            lazy[2 * node] += lazy[node];

            tree[2 * node + 1] += lazy[node] * rightCount;
            lazy[2 * node + 1] += lazy[node];

            lazy[node] = 0;
        }
    }

    void updateRange(int node, int start, int end, int left, int right, long long val) {
        if (right < start || end < left) return;
        if (left <= start && end <= right) {
            tree[node] += val * (end - start + 1);
            lazy[node] += val;
            return;
        }
        pushDown(node, start, end);
        int mid = (start + end) / 2;
        updateRange(2 * node, start, mid, left, right, val);
        updateRange(2 * node + 1, mid + 1, end, left, right, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    long long query(int node, int start, int end, int left, int right) {
        if (right < start || end < left) return 0;
        if (left <= start && end <= right) return tree[node];
        pushDown(node, start, end);
        int mid = (start + end) / 2;
        long long leftSum = query(2 * node, start, mid, left, right);
        long long rightSum = query(2 * node + 1, mid + 1, end, left, right);
        return leftSum + rightSum;
    }

public:
    LazySegmentTree(const vector<int>& arr) {
        n = (int)arr.size();
        tree.resize(4 * n, 0);
        lazy.resize(4 * n, 0);
        if (n > 0) {
            build(arr, 1, 0, n - 1);
        }
    }

    /**
     * Add val to all elements in range [left, right] (inclusive, 0-indexed).
     */
    void updateRange(int left, int right, long long val) {
        updateRange(1, 0, n - 1, left, right, val);
    }

    /**
     * Query sum in range [left, right] (inclusive, 0-indexed).
     */
    long long query(int left, int right) {
        return query(1, 0, n - 1, left, right);
    }
};
