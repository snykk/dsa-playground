# Reservoir Sampling — Python Implementation

Uniformly sample `k` items from a stream of unknown length in one pass using O(k) memory.

For the conceptual overview, probability proof, and comparison with alternatives, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `reservoir_sampling.py` | `reservoir_sample(stream, k)` + `ReservoirSampler` class for incremental use |
| `reservoir_sampling_test.py` | 13 tests incl. statistical uniformity checks |

---

## Python-Specific Notes

- **`random.Random` injection**: the sampler accepts an optional `rng=random.Random(seed)` so tests can be deterministic without messing with the global `random.seed`.
- **Works on any iterable**: `reservoir_sample(open("big.log"), k=10)` samples from a file without reading it into memory. This is the whole point — generators work naturally.
- **`random.randrange(i)`** gives `[0, i)` uniformly. Using `random.randint(0, i-1)` is equivalent but one keystroke longer — stylistic preference.
- **Stateful `ReservoirSampler`**: wraps the same logic for "I get items one at a time" use cases (event handlers, message queues). The offline function and stateful class share the algorithm; choose based on caller shape.
- **Uniformity is a statistical property**: the test suite runs ~20,000 trials and checks that each item's selection frequency is within 15% of expected. Fewer trials → more flakiness.

---

## How to Run

```bash
python3 -m unittest reservoir_sampling_test.py
```

---

## Key Takeaways for Learners

1. **One-pass, unknown-length streams are where reservoir sampling shines.** If you have the data in memory, `random.sample(list(items), k)` is simpler.
2. **The `k/i` acceptance rate is the whole algorithm.** Derive it from the "every item must survive with probability k/n" requirement and the telescoping product proof — don't memorize the formula.
3. **Inject your RNG.** Don't call `random.random()` directly. Testability and reproducibility both require caller-controlled randomness.
