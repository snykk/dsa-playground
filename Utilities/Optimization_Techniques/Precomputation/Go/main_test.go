package main

import "testing"

func TestFactorials(t *testing.T) {
	fact := NewFactorials(10, MOD)
	if fact.NCr(10, 3) != 120 {
		t.Errorf("Expected 120, got %d", fact.NCr(10, 3))
	}
}

func TestSieve(t *testing.T) {
	primes, isPrime := Sieve(20)
	if !isPrime[7] {
		t.Error("7 should be prime")
	}
	if len(primes) < 8 {
		t.Error("Should have at least 8 primes")
	}
}

func TestPrefixSum(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5}
	ps := NewPrefixSum(arr)
	if ps.Query(0, 2) != 6 {
		t.Errorf("Expected 6, got %d", ps.Query(0, 2))
	}
}
