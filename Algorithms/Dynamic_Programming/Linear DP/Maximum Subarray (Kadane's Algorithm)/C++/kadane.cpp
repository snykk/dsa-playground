/**
 * Kadane's Algorithm (C++)
 * Time Complexity: O(n)
 */

#include <vector>
#include <algorithm>
#include <climits>

int kadaneAlgorithm(const std::vector<int>& arr) {
    if (arr.empty()) {
        return 0;
    }
    
    int maxSum = arr[0];
    int currentSum = arr[0];
    
    for (size_t i = 1; i < arr.size(); ++i) {
        currentSum = std::max(arr[i], currentSum + arr[i]);
        maxSum = std::max(maxSum, currentSum);
    }
    
    return maxSum;
}

