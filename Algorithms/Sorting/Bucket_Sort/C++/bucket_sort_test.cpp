/**
 * Test cases for Bucket Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include <cmath>
#include "bucket_sort.cpp"

void testBasicSort() {
    std::vector<double> arr = {0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434};
    std::vector<double> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    bucketSort(arr);
    assert(arr == expected);
    
    std::cout << "[PASS] Basic sort test" << std::endl;
}

// Regression: 1.0 was not clamped and wrote to buckets[n] (heap-buffer-overflow).
void testOneAndZero() {
    std::vector<double> arr = {0.5, 1.0, 0.25};
    bucketSort(arr);
    assert(arr == std::vector<double>({0.25, 0.5, 1.0}));

    std::vector<double> edges = {1.0, 0.0, 1.0, 0.0};
    bucketSort(edges);
    assert(edges == std::vector<double>({0.0, 0.0, 1.0, 1.0}));

    std::vector<double> empty;
    bucketSort(empty);
    assert(empty.empty());
    std::cout << "[PASS] 1.0, 0.0 and empty input test" << std::endl;
}

// Regression: negative values (and values above 1.0) indexed outside the buckets.
void testOutOfRangeThrows() {
    const std::vector<std::vector<double>> bad = {{-0.9, 0.1, 0.5}, {1.5, 0.2}, {0.3, std::nan("")}};
    for (std::vector<double> arr : bad) {
        bool threw = false;
        try {
            bucketSort(arr);
        } catch (const std::invalid_argument&) {
            threw = true;
        }
        assert(threw);
    }
    std::cout << "[PASS] Out-of-range values test" << std::endl;
}

int main() {
    std::cout << "Running Bucket Sort tests..." << std::endl;
    testBasicSort();
    testOneAndZero();
    testOutOfRangeThrows();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

