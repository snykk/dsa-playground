"""Reservoir Sampling (Algorithm R).

Uniformly sample k items from a stream of unknown length using O(k) memory.
Each final item has probability k/n of appearing in the sample.
"""

import random
from typing import Iterable, List, Optional, TypeVar

T = TypeVar("T")


def reservoir_sample(
    stream: Iterable[T], k: int, rng: Optional[random.Random] = None
) -> List[T]:
    """Return a uniformly-random size-k sample from `stream`.

    If the stream has fewer than k items, returns all of them.

    Args:
        stream: any iterable (generator, list, file handle).
        k: sample size (must be >= 0).
        rng: optional random.Random for deterministic tests; defaults to module rng.
    """
    if k < 0:
        raise ValueError("k must be non-negative")
    if k == 0:
        return []
    if rng is None:
        rng = random

    reservoir: List[T] = []
    for i, item in enumerate(stream, start=1):
        if i <= k:
            reservoir.append(item)
        else:
            j = rng.randrange(i)   # uniform in [0, i)
            if j < k:
                reservoir[j] = item
    return reservoir


class ReservoirSampler:
    """Stateful sampler for streaming use cases where items arrive one at a time."""

    def __init__(self, k: int, rng: Optional[random.Random] = None) -> None:
        if k < 0:
            raise ValueError("k must be non-negative")
        self.k = k
        self.rng = rng if rng is not None else random
        self._reservoir: List = []
        self._seen = 0

    def offer(self, item) -> None:
        """Present the next item in the stream to the sampler."""
        self._seen += 1
        if self._seen <= self.k:
            self._reservoir.append(item)
        else:
            j = self.rng.randrange(self._seen)
            if j < self.k:
                self._reservoir[j] = item

    def sample(self) -> list:
        """Return the current sample (a copy, safe to mutate)."""
        return list(self._reservoir)

    def __len__(self) -> int:
        return len(self._reservoir)


if __name__ == "__main__":
    # Demo: sample 3 items from range(1000).
    rng = random.Random(42)
    result = reservoir_sample(range(1000), 3, rng=rng)
    print(f"Sample of 3 from 1..1000: {result}")
