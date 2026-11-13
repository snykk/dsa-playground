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

func TestSieveValues(t *testing.T) {
	primes, isPrime := Sieve(30)
	want := []int{2, 3, 5, 7, 11, 13, 17, 19, 23, 29}
	if len(primes) != len(want) {
		t.Fatalf("Sieve(30) = %v, expected %v", primes, want)
	}
	for i := range want {
		if primes[i] != want[i] {
			t.Errorf("primes[%d] = %d, expected %d", i, primes[i], want[i])
		}
	}
	if isPrime[1] || isPrime[0] || !isPrime[29] || len(isPrime) != 31 {
		t.Error("isPrime flags are wrong")
	}
}

func TestSieveSmallLimits(t *testing.T) {
	// Sieve(0) used to panic with an index out of range.
	for _, n := range []int{-5, -1, 0, 1} {
		primes, isPrime := Sieve(n)
		if len(primes) != 0 {
			t.Errorf("Sieve(%d) returned primes %v", n, primes)
		}
		for i, v := range isPrime {
			if v {
				t.Errorf("Sieve(%d): isPrime[%d] is true", n, i)
			}
		}
	}
	if primes, _ := Sieve(2); len(primes) != 1 || primes[0] != 2 {
		t.Error("Sieve(2) should return [2]")
	}
}

func TestSievePrimeCount(t *testing.T) {
	primes, _ := Sieve(10000)
	if len(primes) != 1229 {
		t.Errorf("pi(10000) = %d, expected 1229", len(primes))
	}
}

func TestComputeSPF(t *testing.T) {
	spf := ComputeSPF(100)
	cases := map[int]int{1: 1, 12: 2, 15: 3, 49: 7, 97: 97, 100: 2}
	for n, want := range cases {
		if spf[n] != want {
			t.Errorf("spf[%d] = %d, expected %d", n, spf[n], want)
		}
	}
}

func TestFactorialsAgainstKnown(t *testing.T) {
	f := NewFactorials(60, MOD)
	if f.NCr(60, 30) != 118264581564861424%MOD {
		t.Errorf("C(60, 30) mod p = %d", f.NCr(60, 30))
	}
	if f.NCr(5, 7) != 0 || f.NCr(5, -1) != 0 {
		t.Error("out-of-range binomials should be 0")
	}
}

func TestPrefixSumRanges(t *testing.T) {
	ps := NewPrefixSum([]int{1, 2, 3, 4, 5})
	if ps.Query(0, 4) != 15 || ps.Query(3, 3) != 4 || ps.Query(1, 2) != 5 {
		t.Error("range sums are wrong")
	}
}
