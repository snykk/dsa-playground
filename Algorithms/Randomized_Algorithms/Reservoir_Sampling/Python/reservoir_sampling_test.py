"""Unit tests for Reservoir Sampling."""
import random
import unittest
from collections import Counter

from reservoir_sampling import ReservoirSampler, reservoir_sample


class TestReservoirSampleBasics(unittest.TestCase):
    def test_empty_stream(self):
        self.assertEqual(reservoir_sample([], 5), [])

    def test_k_equals_zero(self):
        self.assertEqual(reservoir_sample(range(100), 0), [])

    def test_stream_smaller_than_k(self):
        result = reservoir_sample([1, 2, 3], 5)
        self.assertEqual(sorted(result), [1, 2, 3])

    def test_stream_equals_k(self):
        result = reservoir_sample([1, 2, 3], 3)
        self.assertEqual(sorted(result), [1, 2, 3])

    def test_sample_size(self):
        result = reservoir_sample(range(100), 10, rng=random.Random(42))
        self.assertEqual(len(result), 10)

    def test_all_items_from_stream(self):
        items = list(range(100))
        result = reservoir_sample(items, 10, rng=random.Random(42))
        for item in result:
            self.assertIn(item, items)

    def test_negative_k_raises(self):
        with self.assertRaises(ValueError):
            reservoir_sample(range(10), -1)

    def test_works_with_generator(self):
        def gen():
            for i in range(100):
                yield i * 2
        result = reservoir_sample(gen(), 5, rng=random.Random(0))
        self.assertEqual(len(result), 5)
        for x in result:
            self.assertEqual(x % 2, 0)


class TestReservoirSampleUniformity(unittest.TestCase):
    """Statistical tests: over many trials, each item's selection frequency
    should be within ~10% of the expected k/n."""

    def test_single_sample_uniformity(self):
        n, k, trials = 10, 1, 20_000
        counts = Counter()
        rng = random.Random(123)
        for _ in range(trials):
            [picked] = reservoir_sample(range(n), k, rng=rng)
            counts[picked] += 1
        expected = trials / n
        # Each item should be picked ~2000 times out of 20000. Allow 15% slack.
        for item in range(n):
            self.assertGreater(counts[item], expected * 0.85,
                               msg=f"item {item}: {counts[item]} picks (expected ~{expected:.0f})")
            self.assertLess(counts[item], expected * 1.15,
                            msg=f"item {item}: {counts[item]} picks (expected ~{expected:.0f})")

    def test_multi_sample_uniformity(self):
        n, k, trials = 6, 3, 20_000
        counts = Counter()
        rng = random.Random(7)
        for _ in range(trials):
            for x in reservoir_sample(range(n), k, rng=rng):
                counts[x] += 1
        expected = trials * k / n
        for item in range(n):
            self.assertGreater(counts[item], expected * 0.9)
            self.assertLess(counts[item], expected * 1.1)


class TestReservoirSampler(unittest.TestCase):
    def test_sampler_incremental(self):
        sampler = ReservoirSampler(k=3, rng=random.Random(42))
        for i in range(10):
            sampler.offer(i)
        self.assertEqual(len(sampler), 3)
        for item in sampler.sample():
            self.assertIn(item, range(10))

    def test_sampler_before_full(self):
        sampler = ReservoirSampler(k=5)
        sampler.offer(1)
        sampler.offer(2)
        self.assertEqual(sorted(sampler.sample()), [1, 2])

    def test_sampler_returns_copy(self):
        sampler = ReservoirSampler(k=2)
        sampler.offer("a")
        sampler.offer("b")
        s = sampler.sample()
        s.clear()
        # Internal reservoir should be untouched.
        self.assertEqual(len(sampler), 2)


if __name__ == "__main__":
    unittest.main()
