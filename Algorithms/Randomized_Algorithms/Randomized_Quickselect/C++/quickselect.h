// Randomized Quickselect: k-th smallest element in O(n) expected time.
// Uses Lomuto partition; mutates the input vector.

#ifndef QUICKSELECT_H
#define QUICKSELECT_H

#include <algorithm>
#include <random>
#include <stdexcept>
#include <vector>

namespace detail {
inline int partition(std::vector<int>& arr, int lo, int hi, int pivotIdx) {
    std::swap(arr[pivotIdx], arr[hi]);
    int pivot = arr[hi];
    int store = lo;
    for (int i = lo; i < hi; ++i) {
        if (arr[i] < pivot) {
            std::swap(arr[i], arr[store]);
            ++store;
        }
    }
    std::swap(arr[store], arr[hi]);
    return store;
}
}  // namespace detail

// Return the k-th smallest element (0-indexed) of `arr`. Mutates `arr`.
inline int quickselect(std::vector<int>& arr, int k,
                       std::mt19937& rng) {
    if (arr.empty()) {
        throw std::invalid_argument("arr must be non-empty");
    }
    if (k < 0 || k >= static_cast<int>(arr.size())) {
        throw std::out_of_range("k out of range");
    }
    int lo = 0, hi = static_cast<int>(arr.size()) - 1;
    while (lo < hi) {
        std::uniform_int_distribution<int> dist(lo, hi);
        int pivotIdx = detail::partition(arr, lo, hi, dist(rng));
        if (k == pivotIdx) return arr[k];
        if (k < pivotIdx) hi = pivotIdx - 1;
        else lo = pivotIdx + 1;
    }
    return arr[lo];
}

// Convenience overload with default-seeded RNG.
inline int quickselect(std::vector<int>& arr, int k) {
    std::mt19937 rng(std::random_device{}());
    return quickselect(arr, k, rng);
}

#endif  // QUICKSELECT_H
