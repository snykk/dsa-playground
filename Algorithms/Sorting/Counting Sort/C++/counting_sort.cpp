/**
 * Counting Sort Implementation (C++)
 *
 * Stable counting sort. Negative values are supported: a value x is counted
 * in count[x - minVal], so the count array has maxVal - minVal + 1 slots.
 * Throws std::invalid_argument if a value is larger than maxVal.
 */

#include <vector>
#include <algorithm>
#include <cstddef>
#include <stdexcept>

std::vector<int> countingSort(const std::vector<int>& arr, int maxVal) {
    if (arr.empty()) {
        return arr;
    }
    
    if (*std::max_element(arr.begin(), arr.end()) > maxVal) {
        throw std::invalid_argument("countingSort: maxVal is smaller than the largest value");
    }
    const int minVal = *std::min_element(arr.begin(), arr.end());
    // Slot of a value; 64-bit math because x - minVal can exceed INT_MAX.
    auto slot = [minVal](int x) { return static_cast<std::size_t>(static_cast<long long>(x) - minVal); };
    
    std::vector<int> count(slot(maxVal) + 1, 0);
    
    for (int num : arr) {
        count[slot(num)]++;
    }
    
    for (size_t i = 1; i < count.size(); ++i) {
        count[i] += count[i - 1];
    }
    
    std::vector<int> output(arr.size());
    
    for (int i = arr.size() - 1; i >= 0; --i) {
        output[count[slot(arr[i])] - 1] = arr[i];
        count[slot(arr[i])]--;
    }
    
    return output;
}

