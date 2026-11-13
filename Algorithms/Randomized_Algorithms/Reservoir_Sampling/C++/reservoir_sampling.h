// Reservoir Sampling (Algorithm R).
//
// Uniformly sample k items from a stream of unknown length using O(k) memory.
// Each item has probability k/n of appearing in the final sample.

#ifndef RESERVOIR_SAMPLING_H
#define RESERVOIR_SAMPLING_H

#include <cstdint>
#include <random>
#include <stdexcept>
#include <vector>

template <typename T>
class ReservoirSampler {
 public:
    ReservoirSampler(int k, unsigned seed = std::random_device{}())
        : k_(k), seen_(0), rng_(seed) {
        if (k < 0) {
            throw std::invalid_argument("k must be non-negative");
        }
        reservoir_.reserve(k);
    }

    void offer(const T& item) {
        ++seen_;
        if (static_cast<int>(reservoir_.size()) < k_) {
            reservoir_.push_back(item);
            return;
        }
        // 64-bit counter and distribution: a stream can be longer than 2^31 - 1.
        std::uniform_int_distribution<std::uint64_t> dist(0, seen_ - 1);
        std::uint64_t j = dist(rng_);
        if (j < static_cast<std::uint64_t>(k_)) {
            reservoir_[j] = item;
        }
    }

    std::vector<T> sample() const { return reservoir_; }
    int size() const { return static_cast<int>(reservoir_.size()); }
    std::uint64_t seen() const { return seen_; }

 private:
    int k_;
    std::uint64_t seen_;
    std::mt19937 rng_;
    std::vector<T> reservoir_;
};

// Convenience function for when the stream is already a container.
template <typename Container>
std::vector<typename Container::value_type> reservoirSample(
    const Container& stream, int k,
    unsigned seed = std::random_device{}()) {
    ReservoirSampler<typename Container::value_type> s(k, seed);
    for (const auto& item : stream) s.offer(item);
    return s.sample();
}

#endif  // RESERVOIR_SAMPLING_H
