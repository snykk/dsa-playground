package main

import (
	"fmt"
	"testing"
)

func TestAddAndContains(t *testing.T) {
	bf := NewBloomFilter(100, 0.01)
	bf.Add("apple")
	bf.Add("banana")

	if !bf.Contains("apple") {
		t.Error("Expected 'apple' to be found")
	}

	if !bf.Contains("banana") {
		t.Error("Expected 'banana' to be found")
	}

	if bf.Contains("nonexistent") {
		t.Error("Expected 'nonexistent' not to be found")
	}
}

func TestTinyFilterStillRejects(t *testing.T) {
	// NewBloomFilter(2, 0.5) used to get 0 hashes and answer true for everything.
	bf := NewBloomFilter(2, 0.5)
	if bf.numHashes < 1 {
		t.Fatalf("numHashes = %d, want >= 1", bf.numHashes)
	}
	if bf.Contains("never") {
		t.Error("empty filter must not contain anything")
	}
}

func TestSizing(t *testing.T) {
	// 100 items at 1%: ceil(958.5) = 959 bits, k = round(6.65) = 7
	bf := NewBloomFilter(100, 0.01)
	if bf.numBits != 959 || bf.numHashes != 7 {
		t.Errorf("got m=%d k=%d, want m=959 k=7", bf.numBits, bf.numHashes)
	}
}

func TestInvalidArgumentsPanic(t *testing.T) {
	cases := []struct {
		capacity int
		rate     float64
	}{{0, 0.01}, {-1, 0.01}, {10, 0}, {10, 1}, {10, 1.5}}
	for _, c := range cases {
		func() {
			defer func() {
				if recover() == nil {
					t.Errorf("NewBloomFilter(%d, %v) should panic", c.capacity, c.rate)
				}
			}()
			NewBloomFilter(c.capacity, c.rate)
		}()
	}
}

func TestMeasuredFalsePositiveRate(t *testing.T) {
	// The old hash (FNV-32a of item + index byte) gave 13-19% at a configured 1%.
	bf := NewBloomFilter(1000, 0.01)
	for i := 0; i < 1000; i++ {
		bf.Add(fmt.Sprintf("member-%d", i))
	}
	for i := 0; i < 1000; i++ {
		if !bf.Contains(fmt.Sprintf("member-%d", i)) {
			t.Fatalf("false negative for member-%d", i)
		}
	}
	falsePositives := 0
	for j := 0; j < 20000; j++ {
		if bf.Contains(fmt.Sprintf("other-%d", j)) {
			falsePositives++
		}
	}
	if falsePositives > 600 {
		t.Errorf("false positive rate %.2f%%, want about 1%% (under 3%%)", float64(falsePositives)/200.0)
	}
}
