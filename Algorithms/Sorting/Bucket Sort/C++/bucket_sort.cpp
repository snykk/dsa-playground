/**
 * Bucket Sort Implementation (C++)
 *
 * Sorts values in [0.0, 1.0] using n buckets: x goes to bucket floor(n * x) and
 * 1.0 goes to the last bucket. Throws std::invalid_argument for any other value
 * (negative, above 1.0 or NaN), which would have no bucket.
 */

#include <vector>
#include <algorithm>
#include <stdexcept>

void bucketSort(std::vector<double>& arr) {
    if (arr.empty()) {
        return;
    }
    
    for (double num : arr) {
        if (!(num >= 0.0 && num <= 1.0)) {  // written this way to also reject NaN
            throw std::invalid_argument("bucketSort expects values in [0.0, 1.0]");
        }
    }
    
    int n = arr.size();
    std::vector<std::vector<double>> buckets(n);
    
    // Insert elements into buckets
    for (double num : arr) {
        int bucketIndex = std::min(static_cast<int>(n * num), n - 1);  // 1.0 -> last bucket
        buckets[bucketIndex].push_back(num);
    }
    
    // Sort individual buckets
    for (auto& bucket : buckets) {
        std::sort(bucket.begin(), bucket.end());
    }
    
    // Concatenate all buckets
    int index = 0;
    for (const auto& bucket : buckets) {
        for (double num : bucket) {
            arr[index++] = num;
        }
    }
}

