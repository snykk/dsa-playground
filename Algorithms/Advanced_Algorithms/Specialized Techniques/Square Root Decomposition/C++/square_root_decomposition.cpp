#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

class SqrtDecomposition {
private:
    vector<int> arr;
    int n;
    int blockSize;
    int blockCount;
    vector<int> blocks;
    
public:
    SqrtDecomposition(const vector<int>& arr) : arr(arr) {
        n = arr.size();
        blockSize = ceil(sqrt(n));
        blockCount = (n + blockSize - 1) / blockSize;
        blocks.assign(blockCount, 0);
        
        // Precompute block sums
        for (int i = 0; i < n; i++) {
            int blockIdx = i / blockSize;
            blocks[blockIdx] += arr[i];
        }
    }
    
    void update(int index, int value) {
        int blockIdx = index / blockSize;
        blocks[blockIdx] += value - arr[index];
        arr[index] = value;
    }
    
    int query(int left, int right) {
        int result = 0;
        int leftBlock = left / blockSize;
        int rightBlock = right / blockSize;
        
        if (leftBlock == rightBlock) {
            // Same block
            for (int i = left; i <= right; i++) {
                result += arr[i];
            }
        } else {
            // Left partial block
            for (int i = left; i < (leftBlock + 1) * blockSize; i++) {
                result += arr[i];
            }
            
            // Middle complete blocks
            for (int i = leftBlock + 1; i < rightBlock; i++) {
                result += blocks[i];
            }
            
            // Right partial block
            for (int i = rightBlock * blockSize; i <= right; i++) {
                result += arr[i];
            }
        }
        
        return result;
    }
};

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    cout << "Square Root Decomposition Examples:" << endl;
    cout << endl;
    
    vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    SqrtDecomposition sd(arr);
    
    cout << "Array: ";
    for (int val : arr) {
        cout << val << " ";
    }
    cout << endl;
    
    int result = sd.query(2, 7);
    cout << "Sum of range [2, 7]: " << result << endl;
    
    sd.update(5, 20);
    result = sd.query(2, 7);
    cout << "Sum of range [2, 7] after update: " << result << endl;
    
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
