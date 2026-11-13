package main

import (
	"hash/fnv"
	"math"
)

// BloomFilter represents a Bloom Filter
type BloomFilter struct {
	bits      []bool
	numBits   int
	numHashes int
}

// NewBloomFilter creates a Bloom Filter for about capacity items at the given
// false positive rate. It panics if capacity <= 0 or errorRate is not in (0, 1).
func NewBloomFilter(capacity int, errorRate float64) *BloomFilter {
	if capacity <= 0 {
		panic("bloom filter: capacity must be positive")
	}
	if !(errorRate > 0 && errorRate < 1) {
		panic("bloom filter: errorRate must be strictly between 0 and 1")
	}
	// Round the bits up and keep at least one hash: truncating gave k = 0 for
	// small filters, and Contains was then true for everything.
	numBits := int(math.Ceil(-float64(capacity) * math.Log(errorRate) / (math.Log(2) * math.Log(2))))
	numHashes := int(math.Round(float64(numBits) * math.Log(2) / float64(capacity)))
	if numHashes < 1 {
		numHashes = 1
	}

	return &BloomFilter{
		bits:      make([]bool, numBits),
		numBits:   numBits,
		numHashes: numHashes,
	}
}

// hashes returns two independent 64-bit hashes of item. The second is forced
// odd so that h1 + i*h2 steps through different positions for each i.
func hashes(item string) (uint64, uint64) {
	h := fnv.New64a()
	h.Write([]byte(item))
	h1 := h.Sum64()
	// splitmix64 finalizer: a well-mixed second hash derived from the first.
	z := h1 + 0x9e3779b97f4a7c15
	z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9
	z = (z ^ (z >> 27)) * 0x94d049bb133111eb
	z ^= z >> 31
	return h1, z | 1
}

// index returns the i-th bit position (double hashing: h1 + i*h2 mod m).
func (bf *BloomFilter) index(h1, h2 uint64, i int) int {
	return int((h1 + uint64(i)*h2) % uint64(bf.numBits))
}

// Add adds an item to the Bloom Filter
func (bf *BloomFilter) Add(item string) {
	h1, h2 := hashes(item)
	for i := 0; i < bf.numHashes; i++ {
		bf.bits[bf.index(h1, h2, i)] = true
	}
}

// Contains checks if item might be in the filter
func (bf *BloomFilter) Contains(item string) bool {
	h1, h2 := hashes(item)
	for i := 0; i < bf.numHashes; i++ {
		if !bf.bits[bf.index(h1, h2, i)] {
			return false
		}
	}
	return true
}
