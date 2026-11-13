# Reservoir Sampling -- C++ Implementation

A header-only, template reservoir sampler for any element type. For the idea, proof and trace see the [topic README](../README.md).

## Files

- `reservoir_sampling.h` - `ReservoirSampler<T>` and `reservoirSample`.
- `reservoir_sampling_test.cpp` - 8 assert-based tests: edge cases, uniformity over 20,000 trials and a regression test for the 64-bit counter.

## API

- `ReservoirSampler<T>(int k, unsigned seed = std::random_device{}())` - throws `std::invalid_argument` if `k < 0`.
- `void offer(const T& item)` - present the next item.
- `std::vector<T> sample() const` - a copy of the reservoir.
- `int size() const` - the current reservoir size.
- `std::uint64_t seen() const` - how many items have been offered.
- `reservoirSample(const Container& stream, int k, unsigned seed)` - sample a whole container.

## C++-Specific Notes

- The `seen` counter and the index distribution are 64-bit (`std::uint64_t`). With an `int` counter the sampler broke after 2^31 - 1 offers.
- `std::uniform_int_distribution` gives an unbiased index; `rng() % seen` would not.
- `sample()` returns a copy of the member vector, so it costs O(k) per call.
- `std::mt19937` is not thread-safe: use one sampler per thread.
- `reserve(k)` in the constructor avoids reallocation during the fill phase.

## How to Run

From this folder:

```bash
g++ -std=c++17 -O2 -Wall reservoir_sampling_test.cpp -o reservoir_sampling_test
./reservoir_sampling_test
```

## Key Takeaways

- Use a 64-bit counter for a stream of unknown length.
- Use `std::uniform_int_distribution`, not a modulo.
- `std::mt19937` is fine for sampling, but it is not a secure generator.
