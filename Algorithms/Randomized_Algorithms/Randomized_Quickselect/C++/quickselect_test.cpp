#include "quickselect.h"

#include <algorithm>
#include <cassert>
#include <iostream>
#include <random>
#include <vector>

void testSingleElement() {
    std::vector<int> arr = {42};
    std::mt19937 rng(42);
    assert(quickselect(arr, 0, rng) == 42);
}

void testSmallest() {
    std::vector<int> arr = {3, 1, 4, 1, 5, 9, 2, 6};
    std::mt19937 rng(42);
    assert(quickselect(arr, 0, rng) == 1);
}

void testLargest() {
    std::vector<int> arr = {3, 1, 4, 1, 5, 9, 2, 6};
    std::mt19937 rng(42);
    assert(quickselect(arr, arr.size() - 1, rng) == 9);
}

void testMedian() {
    std::vector<int> arr = {7, 2, 1, 8, 6, 3, 5, 4};
    std::mt19937 rng(42);
    assert(quickselect(arr, 3, rng) == 4);
}

void testDuplicates() {
    for (int k = 0; k < 5; ++k) {
        std::vector<int> arr(5, 5);
        std::mt19937 rng(42);
        assert(quickselect(arr, k, rng) == 5);
    }
}

void testAlreadySorted() {
    for (int k = 0; k < 20; ++k) {
        std::vector<int> arr(20);
        for (int i = 0; i < 20; ++i) arr[i] = i;
        std::mt19937 rng(42);
        assert(quickselect(arr, k, rng) == k);
    }
}

void testReverseSorted() {
    for (int k = 0; k < 20; ++k) {
        std::vector<int> arr(20);
        for (int i = 0; i < 20; ++i) arr[i] = 19 - i;
        std::mt19937 rng(42);
        assert(quickselect(arr, k, rng) == k);
    }
}

void testMatchesSortOnRandomData() {
    std::mt19937 rng(123);
    for (int trial = 0; trial < 20; ++trial) {
        int n = 1 + (rng() % 200);
        std::vector<int> arr(n);
        std::uniform_int_distribution<int> dist(-1000, 1000);
        for (int i = 0; i < n; ++i) arr[i] = dist(rng);
        std::vector<int> sorted_arr = arr;
        std::sort(sorted_arr.begin(), sorted_arr.end());
        for (int k = 0; k < n; ++k) {
            std::vector<int> work = arr;
            assert(quickselect(work, k, rng) == sorted_arr[k]);
        }
    }
}

void testOutOfRangeThrows() {
    std::vector<int> arr = {1, 2, 3};
    std::mt19937 rng(42);
    bool threw = false;
    try { quickselect(arr, -1, rng); }
    catch (const std::out_of_range&) { threw = true; }
    assert(threw);

    threw = false;
    try { quickselect(arr, 3, rng); }
    catch (const std::out_of_range&) { threw = true; }
    assert(threw);
}

void testEmptyThrows() {
    std::vector<int> arr;
    std::mt19937 rng(42);
    bool threw = false;
    try { quickselect(arr, 0, rng); }
    catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
}

int main() {
    testSingleElement();
    testSmallest();
    testLargest();
    testMedian();
    testDuplicates();
    testAlreadySorted();
    testReverseSorted();
    testMatchesSortOnRandomData();
    testOutOfRangeThrows();
    testEmptyThrows();
    std::cout << "All 10 tests passed!" << std::endl;
    return 0;
}
