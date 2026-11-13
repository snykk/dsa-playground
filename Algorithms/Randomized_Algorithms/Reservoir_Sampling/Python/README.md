# Reservoir Sampling -- Python Implementation

Uniformly sample `k` items from a stream of unknown length in one pass with O(k) memory. For the idea, proof and trace see the [topic README](../README.md).

## Files

- `reservoir_sampling.py` - `reservoir_sample` and the `ReservoirSampler` class.
- `reservoir_sampling_test.py` - 13 tests: edge cases, generators, copies and statistical uniformity checks.

## API

- `reservoir_sample(stream, k, rng=None)` - a list of up to `k` items from any iterable. Returns everything if the stream is shorter than `k`, `[]` for `k == 0`, and raises `ValueError` for `k < 0`.
- `ReservoirSampler(k, rng=None)` - incremental use. `offer(item)` presents an item, `sample()` returns a copy of the reservoir, `len(sampler)` is its current size.

## Python-Specific Notes

- Works on any iterable, so `reservoir_sample(open("big.log"), 10)` samples a file without loading it.
- Pass `random.Random(seed)` as `rng` for reproducible tests; otherwise the module-level `random` is used.
- `rng.randrange(i)` is uniform on `[0, i)`; the item counter is a Python int, so it cannot overflow.
- The uniformity tests are statistical, so they use many trials and a fixed seed.

## How to Run

From this folder:

```bash
python3 -m unittest reservoir_sampling_test
python3 reservoir_sampling.py
```

## Key Takeaways

- One draw `j in [0, i)` decides both acceptance (`j < k`) and the slot.
- Generators work naturally; the stream is never stored.
- Inject the generator for testability.
