package main

import "testing"

func TestSieveOfEratosthenes(t *testing.T) {
	primes := SieveOfEratosthenes(10)
	expected := []int{2, 3, 5, 7}
	if !equal(primes, expected) {
		t.Errorf("SieveOfEratosthenes(10) = %v, expected %v", primes, expected)
	}

	primes = SieveOfEratosthenes(30)
	expected = []int{2, 3, 5, 7, 11, 13, 17, 19, 23, 29}
	if !equal(primes, expected) {
		t.Errorf("SieveOfEratosthenes(30) = %v, expected %v", primes, expected)
	}
}

func TestSieveCount(t *testing.T) {
	primes_100 := SieveOfEratosthenes(100)
	if len(primes_100) != 25 {
		t.Errorf("SieveOfEratosthenes(100) length = %d, expected 25", len(primes_100))
	}

	primes_50 := SieveOfEratosthenes(50)
	if len(primes_50) != 15 {
		t.Errorf("SieveOfEratosthenes(50) length = %d, expected 15", len(primes_50))
	}
}

func TestSieveEmpty(t *testing.T) {
	primes := SieveOfEratosthenes(1)
	if len(primes) != 0 {
		t.Errorf("SieveOfEratosthenes(1) length = %d, expected 0", len(primes))
	}

	primes = SieveOfEratosthenes(0)
	if len(primes) != 0 {
		t.Errorf("SieveOfEratosthenes(0) length = %d, expected 0", len(primes))
	}
}

func TestSieveBoolean(t *testing.T) {
	sieve := SieveBoolean(20)
	if sieve[0] {
		t.Error("sieve[0] should be false")
	}
	if sieve[1] {
		t.Error("sieve[1] should be false")
	}
	if !sieve[2] {
		t.Error("sieve[2] should be true")
	}
	if !sieve[3] {
		t.Error("sieve[3] should be true")
	}
	if sieve[4] {
		t.Error("sieve[4] should be false")
	}
	if !sieve[5] {
		t.Error("sieve[5] should be true")
	}
	if sieve[6] {
		t.Error("sieve[6] should be false")
	}
	if !sieve[7] {
		t.Error("sieve[7] should be true")
	}
	if sieve[8] {
		t.Error("sieve[8] should be false")
	}
	if sieve[9] {
		t.Error("sieve[9] should be false")
	}
	if sieve[10] {
		t.Error("sieve[10] should be false")
	}
	if !sieve[11] {
		t.Error("sieve[11] should be true")
	}
}

func TestIsPrimeSieve(t *testing.T) {
	sieve := SieveBoolean(100)
	if !IsPrimeSieve(17, sieve) {
		t.Error("IsPrimeSieve(17, sieve) should be true")
	}
	if !IsPrimeSieve(29, sieve) {
		t.Error("IsPrimeSieve(29, sieve) should be true")
	}
	if IsPrimeSieve(20, sieve) {
		t.Error("IsPrimeSieve(20, sieve) should be false")
	}
	if IsPrimeSieve(1, sieve) {
		t.Error("IsPrimeSieve(1, sieve) should be false")
	}
	if IsPrimeSieve(0, sieve) {
		t.Error("IsPrimeSieve(0, sieve) should be false")
	}
}

func equal(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func TestNegativeIndexIsNotPrime(t *testing.T) {
	sieve := SieveBoolean(101)
	if !sieve[101] {
		t.Fatal("101 is prime")
	}
	for _, n := range []int{-1, -101, -2} {
		if IsPrimeSieve(n, sieve) {
			t.Errorf("IsPrimeSieve(%d) should be false", n)
		}
	}
}

func TestBeyondTheSieveIsFalse(t *testing.T) {
	if IsPrimeSieve(103, SieveBoolean(100)) {
		t.Error("IsPrimeSieve(103, sieve up to 100) should be false")
	}
}

func TestNegativeLimit(t *testing.T) {
	if got := SieveOfEratosthenes(-5); len(got) != 0 {
		t.Errorf("SieveOfEratosthenes(-5) = %v, expected empty", got)
	}
	if got := SieveBoolean(-5); len(got) != 0 {
		t.Errorf("SieveBoolean(-5) = %v, expected empty", got)
	}
	if got := SieveBoolean(0); len(got) != 1 {
		t.Errorf("SieveBoolean(0) length = %d, expected 1", len(got))
	}
}

func TestMatchesTrialDivision(t *testing.T) {
	sieve := SieveBoolean(20000)
	count := 0
	for n := 0; n <= 20000; n++ {
		prime := n >= 2
		for i := 2; i*i <= n; i++ {
			if n%i == 0 {
				prime = false
				break
			}
		}
		if sieve[n] != prime {
			t.Fatalf("sieve[%d] = %t, expected %t", n, sieve[n], prime)
		}
		if prime {
			count++
		}
	}
	if count != 2262 {
		t.Errorf("found %d primes up to 20000, expected 2262", count)
	}
	if got := len(SieveOfEratosthenes(100000)); got != 9592 {
		t.Errorf("found %d primes up to 100000, expected 9592", got)
	}
}
