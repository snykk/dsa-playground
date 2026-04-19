package main

import (
	"sort"
	"testing"
)

func TestEmptyStream(t *testing.T) {
	if r := ReservoirSample(nil, 5, 42); len(r) != 0 {
		t.Errorf("empty stream should give empty sample, got %v", r)
	}
}

func TestKZero(t *testing.T) {
	if r := ReservoirSample([]int{1, 2, 3}, 0, 42); len(r) != 0 {
		t.Errorf("k=0 should give empty sample, got %v", r)
	}
}

func TestStreamSmallerThanK(t *testing.T) {
	r := ReservoirSample([]int{1, 2, 3}, 5, 42)
	sort.Ints(r)
	want := []int{1, 2, 3}
	if len(r) != len(want) {
		t.Fatalf("got %v, want %v", r, want)
	}
	for i := range r {
		if r[i] != want[i] {
			t.Errorf("got %v, want %v", r, want)
		}
	}
}

func TestSampleSize(t *testing.T) {
	stream := make([]int, 100)
	for i := range stream {
		stream[i] = i
	}
	r := ReservoirSample(stream, 10, 42)
	if len(r) != 10 {
		t.Errorf("expected sample size 10, got %d", len(r))
	}
	for _, x := range r {
		if x < 0 || x >= 100 {
			t.Errorf("item %d not in stream", x)
		}
	}
}

func TestIncrementalSampler(t *testing.T) {
	s := NewSampler(3, 42)
	for i := 0; i < 10; i++ {
		s.Offer(i)
	}
	if s.Len() != 3 {
		t.Errorf("reservoir size = %d, want 3", s.Len())
	}
	for _, x := range s.Sample() {
		if x < 0 || x >= 10 {
			t.Errorf("item %d not in stream", x)
		}
	}
}

func TestSampleReturnsCopy(t *testing.T) {
	s := NewSampler(2, 42)
	s.Offer(1)
	s.Offer(2)
	out := s.Sample()
	out[0] = -999
	// Internal state untouched.
	again := s.Sample()
	if again[0] == -999 {
		t.Errorf("Sample() should return a copy, not a reference")
	}
}

func TestStatisticalUniformity(t *testing.T) {
	// Run many trials; each item should be picked ~equally often.
	const n, k, trials = 10, 1, 20000
	counts := make([]int, n)
	for trial := 0; trial < trials; trial++ {
		stream := make([]int, n)
		for i := range stream {
			stream[i] = i
		}
		sample := ReservoirSample(stream, k, int64(trial+1))
		counts[sample[0]]++
	}
	expected := float64(trials) / float64(n)
	for i := 0; i < n; i++ {
		freq := float64(counts[i])
		if freq < expected*0.85 || freq > expected*1.15 {
			t.Errorf("item %d: %d picks, expected ~%.0f (outside 15%% band)",
				i, counts[i], expected)
		}
	}
}

func TestNegativeKPanics(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Error("expected panic on k < 0")
		}
	}()
	NewSampler(-1, 42)
}
