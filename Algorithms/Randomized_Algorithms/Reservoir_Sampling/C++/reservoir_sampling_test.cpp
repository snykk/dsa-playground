#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <map>
#include <random>
#include <stdexcept>
#include <vector>

// White-box access: the overflow regression test sets the private counter
// directly instead of offering 2^31 items.
#define private public
#include "reservoir_sampling.h"
#undef private

void testEmptyStream() {
    std::vector<int> empty;
    auto result = reservoirSample(empty, 5, 42);
    assert(result.empty());
}

void testKZero() {
    auto result = reservoirSample(std::vector<int>{1, 2, 3}, 0, 42);
    assert(result.empty());
}

void testStreamSmallerThanK() {
    std::vector<int> stream = {1, 2, 3};
    auto result = reservoirSample(stream, 5, 42);
    std::sort(result.begin(), result.end());
    assert((result == std::vector<int>{1, 2, 3}));
}

void testSampleSize() {
    std::vector<int> stream(100);
    for (int i = 0; i < 100; ++i) stream[i] = i;
    auto result = reservoirSample(stream, 10, 42);
    assert(static_cast<int>(result.size()) == 10);
    // All items must come from the stream.
    for (int x : result) {
        assert(x >= 0 && x < 100);
    }
}

void testIncrementalSampler() {
    ReservoirSampler<int> sampler(3, 42);
    for (int i = 0; i < 10; ++i) sampler.offer(i);
    auto result = sampler.sample();
    assert(result.size() == 3);
    for (int x : result) assert(x >= 0 && x < 10);
}

void testStatisticalUniformity() {
    // Run many trials, check each item's frequency is within 15% of expected.
    const int n = 10, k = 1, trials = 20000;
    std::map<int, int> counts;
    for (int t = 0; t < trials; ++t) {
        std::vector<int> stream(n);
        for (int i = 0; i < n; ++i) stream[i] = i;
        auto sample = reservoirSample(stream, k, t);  // distinct seed per trial
        counts[sample[0]]++;
    }
    double expected = static_cast<double>(trials) / n;
    for (int i = 0; i < n; ++i) {
        double freq = counts[i];
        assert(freq > expected * 0.85);
        assert(freq < expected * 1.15);
    }
}

void testNegativeKThrows() {
    bool threw = false;
    try {
        ReservoirSampler<int> s(-1);
    } catch (const std::invalid_argument&) {
        threw = true;
    }
    assert(threw);
}

// Regression: the seen counter was an int and overflowed after 2^31 - 1 offers,
// making seen() negative and the distribution range invalid.
void testSeenCounterPastIntMax() {
    ReservoirSampler<int> sampler(1, 42);
    sampler.offer(0);
    sampler.seen_ = 2147483646ULL;  // INT_MAX - 1 items already seen
    for (int i = 0; i < 5; ++i) sampler.offer(i);
    assert(sampler.seen() == 2147483651ULL);
    assert(sampler.size() == 1);
}

int main() {
    testEmptyStream();
    testKZero();
    testStreamSmallerThanK();
    testSampleSize();
    testIncrementalSampler();
    testStatisticalUniformity();
    testNegativeKThrows();
    testSeenCounterPastIntMax();
    std::cout << "All 8 tests passed!" << std::endl;
    return 0;
}
