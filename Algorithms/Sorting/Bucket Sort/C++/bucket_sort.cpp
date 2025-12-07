/**
 * Bucket Sort Implementation (C++)
 */

#include <vector>
#include <algorithm>

void bucketSort(std::vector<double>& arr) {
    if (arr.empty()) {
        return;
    }
    
    int n = arr.size();
    std::vector<std::vector<double>> buckets(n);
    
    // Insert elements into buckets
    for (double num : arr) {
        int bucketIndex = n * num;
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

