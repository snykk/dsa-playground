/**
 * Test cases for Bucket Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include "bucket_sort.cpp"

void testBasicSort() {
    std::vector<double> arr = {0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434};
    std::vector<double> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    bucketSort(arr);
    assert(arr == expected);
    
    std::cout << "✓ Basic sort test passed" << std::endl;
}

int main() {
    std::cout << "Running Bucket Sort tests..." << std::endl;
    testBasicSort();
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

