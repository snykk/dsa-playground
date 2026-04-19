# Reservoir Sampling — C++ Implementation

Template-based, single-header Reservoir Sampler supporting any element type.

For the conceptual overview and probability proof, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `reservoir_sampling.h` | `ReservoirSampler<T>` class + `reservoirSample(container, k)` helper |
| `reservoir_sampling_test.cpp` | 7 tests including statistical uniformity over 20k trials |

---

## C++-Specific Notes

- **Template `<T>`** supports any movable type: primitive, `std::string`, custom structs.
- **`std::mt19937` with seedable constructor**: pass `seed = 42` in tests for reproducibility, default `std::random_device` for production.
- **`std::uniform_int_distribution<int>(0, seen - 1)`** is the portable way to pick a uniform index — never `rng_() % seen`, which has modulo bias.
- **Return-by-value `sample()`** relies on RVO / move elision for zero-copy return.
- **Reserve capacity** in the constructor via `reservoir_.reserve(k)` so no reallocation happens during the fill phase.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall reservoir_sampling_test.cpp -o reservoir_sampling_test
./reservoir_sampling_test
```

---

## Key Takeaways for Learners

1. **Modulo bias is a real bug** — `rng() % n` isn't uniform when `n` doesn't divide `RAND_MAX`. Use `std::uniform_int_distribution` every time.
2. **`std::mt19937` is plenty** for non-cryptographic sampling. For crypto-grade randomness, reach for `std::random_device` _every call_ (not just seeding) or use OS APIs.
3. **Templates + concepts are C++'s reservoir-style polymorphism.** The same header works for `int`, `std::string`, or any type — no virtual dispatch, no runtime cost.
