/**
 * Shell Sort Implementation (C++)
 *
 * Insertion sort over shrinking gaps. A pass with gap h insertion-sorts each
 * of the h interleaved subsequences arr[r], arr[r + h], arr[r + 2h], ..., so
 * that arr[i] <= arr[i + h] for every i; the last pass, with gap 1, is a plain
 * insertion sort of a nearly sorted array. The gaps come from one of three
 * sequences, each using its terms below n, largest first:
 *
 *   Sequence::Shell  n / 2, n / 4, ..., 1
 *   Sequence::Knuth  1, 4, 13, 40, ...: (3^k - 1) / 2, each 3h + 1
 *   Sequence::Ciura  1, 4, 10, 23, 57, 132, 301, 701, then 2h + h / 4
 *                    (floor(2.25 h)): 1577, 3548, 7983, ... (the default)
 */

#include <algorithm>
#include <cstddef>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

enum class Sequence { Shell, Knuth, Ciura };

// Shell's gaps for n elements: n / 2, n / 4, ..., 1. Empty for n < 2.
std::vector<std::size_t> shellGaps(std::size_t n) {
    std::vector<std::size_t> gaps;
    for (std::size_t gap = n / 2; gap > 0; gap /= 2) gaps.push_back(gap);
    return gaps;
}

// Knuth's gaps (3^k - 1) / 2 below n, largest first. Empty for n < 2.
std::vector<std::size_t> knuthGaps(std::size_t n) {
    std::vector<std::size_t> gaps;
    for (std::size_t h = 1; h < n; h = 3 * h + 1) {
        gaps.push_back(h);
        // The next gap 3h + 1 is below n only if h <= (n - 2) / 3; stopping here never
        // computes a number above n.
        if (h > (n - 2) / 3) break;
    }
    std::reverse(gaps.begin(), gaps.end());
    return gaps;
}

// Ciura's gaps below n, largest first, extended past 701 by 2h + h / 4 = floor(2.25 h).
std::vector<std::size_t> ciuraGaps(std::size_t n) {
    static const std::size_t kCiura[] = {1, 4, 10, 23, 57, 132, 301, 701};
    std::vector<std::size_t> gaps;
    for (std::size_t g : kCiura) {
        if (g < n) gaps.push_back(g);
    }
    std::size_t h = 701;
    while (h < n) {
        // The next gap 2h + h / 4 is below n only if 2h < n and h / 4 < n - 2h. Testing it
        // this way never computes a number above n, so nothing overflows.
        if (h > (n - 1) / 2 || h / 4 >= n - 2 * h) break;
        h = 2 * h + h / 4;
        gaps.push_back(h);
    }
    std::reverse(gaps.begin(), gaps.end());
    return gaps;
}

// The gaps Shell Sort uses on n elements, largest first. Throws std::invalid_argument for a
// value outside the enum (only reachable through a cast).
std::vector<std::size_t> gapSequence(std::size_t n, Sequence seq = Sequence::Ciura) {
    switch (seq) {
        case Sequence::Shell:
            return shellGaps(n);
        case Sequence::Knuth:
            return knuthGaps(n);
        case Sequence::Ciura:
            return ciuraGaps(n);
    }
    throw std::invalid_argument("unknown gap sequence " + std::to_string(static_cast<int>(seq)));
}

// One pass: insertion sort with stride gap, so that arr[i] <= arr[i + gap] afterwards.
// T needs operator>. Throws std::invalid_argument when gap is 0.
template <typename T>
void hSort(std::vector<T>& arr, std::size_t gap) {
    if (gap == 0) throw std::invalid_argument("gap must be at least 1, got 0");
    for (std::size_t i = gap; i < arr.size(); ++i) {
        T key = arr[i];
        std::size_t j = i;
        // j is the free slot; j >= gap keeps j - gap from wrapping around (size_t).
        while (j >= gap && arr[j - gap] > key) {
            arr[j] = arr[j - gap];
            j -= gap;
        }
        arr[j] = key;
    }
}

// Sorts arr in place with the given gap sequence (Ciura's by default). Not stable.
template <typename T>
void shellSort(std::vector<T>& arr, Sequence seq = Sequence::Ciura) {
    for (std::size_t gap : gapSequence(arr.size(), seq)) hSort(arr, gap);
}

template void hSort<int>(std::vector<int>&, std::size_t);
template void hSort<double>(std::vector<double>&, std::size_t);
template void shellSort<int>(std::vector<int>&, Sequence);
template void shellSort<double>(std::vector<double>&, Sequence);

#ifndef IS_TEST_BUILD
int main() {
    const std::vector<int> example = {98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38};
    const char* names[] = {"shell", "knuth", "ciura"};
    const Sequence seqs[] = {Sequence::Shell, Sequence::Knuth, Sequence::Ciura};
    for (int s = 0; s < 3; ++s) {
        std::vector<int> arr = example;
        std::cout << names[s] << ":";
        for (std::size_t gap : gapSequence(arr.size(), seqs[s])) {
            hSort(arr, gap);
            std::cout << "\n  after gap " << gap << ":";
            for (int v : arr) std::cout << ' ' << v;
        }
        std::cout << '\n';
    }
    return 0;
}
#endif  // !IS_TEST_BUILD
