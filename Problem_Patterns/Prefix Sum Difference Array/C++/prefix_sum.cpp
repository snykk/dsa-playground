#include <iostream>
#include <vector>

using namespace std;

class PrefixSum {
    vector<int> prefix;
public:
    PrefixSum(const vector<int>& arr) {
        prefix.push_back(0);
        for (int num : arr) {
            prefix.push_back(prefix.back() + num);
        }
    }
    
    int query(int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
};

class DifferenceArray {
    vector<int> diff;
    int size;
public:
    DifferenceArray(int n) : size(n) {
        diff.assign(n + 1, 0);
    }
    
    void update(int left, int right, int value) {
        diff[left] += value;
        if (right + 1 < diff.size()) {
            diff[right + 1] -= value;
        }
    }
    
    vector<int> getArray() {
        vector<int> result;
        int current = 0;
        for (int i = 0; i < size; i++) {
            current += diff[i];
            result.push_back(current);
        }
        return result;
    }
};

#ifndef TESTING
int main() {
    vector<int> arr = {1, 2, 3, 4, 5};
    PrefixSum ps(arr);
    cout << "Sum[0, 4]: " << ps.query(0, 4) << endl;
    return 0;
}
#endif

