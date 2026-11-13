// Randomized Quickselect: k-th smallest element in O(n) expected time.
// Uses a three-way (Dutch flag) partition, so duplicates cannot cause
// quadratic time. Mutates the input vector.

#ifndef QUICKSELECT_H
#define QUICKSELECT_H

#include <algorithm>
#include <random>
#include <stdexcept>
#include <utility>
#include <vector>

namespace detail {
// Reorders arr[lo..hi] into  < pivot | == pivot | > pivot  around arr[pivotIdx].
// Returns {lt, gt}: arr[lt..gt] holds exactly the keys equal to the pivot.
inline std::pair<int, int> partition3(std::vector<int>& arr, int lo, int hi,
                                      int pivotIdx) {
    int pivot = arr[pivotIdx];
    int lt = lo, i = lo, gt = hi;
    while (i <= gt) {
        if (arr[i] < pivot) {
            std::swap(arr[lt++], arr[i++]);
        } else if (arr[i] > pivot) {
            std::swap(arr[i], arr[gt--]);
        } else {
            ++i;
        }
    }
    return {lt, gt};
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
        std::pair<int, int> band = detail::partition3(arr, lo, hi, dist(rng));
        if (k < band.first) hi = band.first - 1;
        else if (k > band.second) lo = band.second + 1;
        else return arr[k];  // k falls inside the band of keys equal to the pivot
    }
    return arr[lo];
}

// Convenience overload with default-seeded RNG.
inline int quickselect(std::vector<int>& arr, int k) {
    std::mt19937 rng(std::random_device{}());
    return quickselect(arr, k, rng);
}

#endif  // QUICKSELECT_H
