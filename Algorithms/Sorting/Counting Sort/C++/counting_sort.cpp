/**
 * Counting Sort Implementation (C++)
 */

#include <vector>
#include <algorithm>

std::vector<int> countingSort(const std::vector<int>& arr, int maxVal) {
    if (arr.empty()) {
        return arr;
    }
    
    std::vector<int> count(maxVal + 1, 0);
    
    for (int num : arr) {
        count[num]++;
    }
    
    for (size_t i = 1; i < count.size(); ++i) {
        count[i] += count[i - 1];
    }
    
    std::vector<int> output(arr.size());
    
    for (int i = arr.size() - 1; i >= 0; --i) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    
    return output;
}

