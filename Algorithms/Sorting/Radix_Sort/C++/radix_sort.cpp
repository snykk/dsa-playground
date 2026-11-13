/**
 * Radix Sort Implementation (C++)
 *
 * LSD radix sort, base 10. Negative values are supported: when the minimum is
 * negative, the digits are taken from the shifted key value - minimum, which is
 * never negative and has the same order as the values. Keys and exponents are
 * 64-bit, so the whole int range works (a 32-bit exp would overflow once the
 * maximum reaches 1e9).
 */

#include <vector>
#include <algorithm>

// Stable counting sort of arr by the digit (key / exp) % 10, key = value - offset >= 0.
void countingSortByDigit(std::vector<int>& arr, long long exp, long long offset = 0) {
    int n = arr.size();
    std::vector<int> output(n);
    std::vector<int> count(10, 0);
    auto digit = [exp, offset](int value) { return static_cast<int>(((value - offset) / exp) % 10); };
    
    for (int i = 0; i < n; ++i) {
        count[digit(arr[i])]++;
    }
    
    for (int i = 1; i < 10; ++i) {
        count[i] += count[i - 1];
    }
    
    for (int i = n - 1; i >= 0; --i) {
        output[count[digit(arr[i])] - 1] = arr[i];
        count[digit(arr[i])]--;
    }
    
    for (int i = 0; i < n; ++i) {
        arr[i] = output[i];
    }
}

void radixSort(std::vector<int>& arr) {
    if (arr.empty()) {
        return;
    }
    
    // Shift negative input so that every key (value - offset) is >= 0
    long long offset = std::min(0, *std::min_element(arr.begin(), arr.end()));
    long long maxKey = *std::max_element(arr.begin(), arr.end()) - offset;
    
    for (long long exp = 1; maxKey / exp > 0; exp *= 10) {
        countingSortByDigit(arr, exp, offset);
    }
}

