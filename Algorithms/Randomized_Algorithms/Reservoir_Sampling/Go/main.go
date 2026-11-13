// Package main implements Reservoir Sampling (Algorithm R).
//
// Uniformly sample k items from a stream of unknown length in O(n) time
// and O(k) space. Each final item has probability k/n of being selected.
package main

import (
	"fmt"
	"math/rand"
)

// Sampler holds a running sample of size at most k.
type Sampler struct {
	k         int
	rng       *rand.Rand
	reservoir []int
	seen      int
}

// NewSampler returns a sampler with reservoir size k, seeded for reproducibility.
// Pass seed=0 to use a random seed (drawn from the global source); any other
// value gives deterministic output.
func NewSampler(k int, seed int64) *Sampler {
	if k < 0 {
		panic("k must be non-negative")
	}
	var src rand.Source
	if seed == 0 {
		src = rand.NewSource(rand.Int63())
	} else {
		src = rand.NewSource(seed)
	}
	return &Sampler{
		k:         k,
		rng:       rand.New(src),
		reservoir: make([]int, 0, k),
	}
}

// Offer presents the next item in the stream to the sampler.
func (s *Sampler) Offer(item int) {
	s.seen++
	if len(s.reservoir) < s.k {
		s.reservoir = append(s.reservoir, item)
		return
	}
	j := s.rng.Intn(s.seen)
	if j < s.k {
		s.reservoir[j] = item
	}
}

// Sample returns a copy of the current reservoir (safe to mutate).
func (s *Sampler) Sample() []int {
	out := make([]int, len(s.reservoir))
	copy(out, s.reservoir)
	return out
}

// Len returns the current reservoir size.
func (s *Sampler) Len() int { return len(s.reservoir) }

// ReservoirSample is a convenience function that samples k items from the
// full slice in one pass.
func ReservoirSample(stream []int, k int, seed int64) []int {
	s := NewSampler(k, seed)
	for _, x := range stream {
		s.Offer(x)
	}
	return s.Sample()
}

func main() {
	stream := make([]int, 1000)
	for i := range stream {
		stream[i] = i
	}
	sample := ReservoirSample(stream, 5, 42)
	fmt.Printf("Sample of 5 from 0..999: %v\n", sample)
}
