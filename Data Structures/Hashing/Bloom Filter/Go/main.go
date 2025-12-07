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
	capacity  int
}

// NewBloomFilter creates a new Bloom Filter
func NewBloomFilter(capacity int, errorRate float64) *BloomFilter {
	numBits := int(-float64(capacity) * math.Log(errorRate) / (math.Log(2) * math.Log(2)))
	numHashes := int(float64(numBits) * math.Log(2) / float64(capacity))

	return &BloomFilter{
		bits:      make([]bool, numBits),
		numBits:   numBits,
		numHashes: numHashes,
		capacity:  capacity,
	}
}

func (bf *BloomFilter) hash(item string, i int) int {
	h := fnv.New32a()
	h.Write([]byte(item + string(rune(i))))
	return int(h.Sum32()) % bf.numBits
}

// Add adds an item to the Bloom Filter
func (bf *BloomFilter) Add(item string) {
	for i := 0; i < bf.numHashes; i++ {
		index := bf.hash(item, i)
		bf.bits[index] = true
	}
}

// Contains checks if item might be in the filter
func (bf *BloomFilter) Contains(item string) bool {
	for i := 0; i < bf.numHashes; i++ {
		index := bf.hash(item, i)
		if !bf.bits[index] {
			return false
		}
	}
	return true
}

