package main

import "testing"

func TestSmallPrimes(t *testing.T) {
	primes := []int64{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 97, 101}
	for _, p := range primes {
		if !IsPrimeMillerRabin(p, 10) {
			t.Errorf("IsPrimeMillerRabin(%d, 10) should be true", p)
		}
		if !MillerRabinDeterministic(p) {
			t.Errorf("MillerRabinDeterministic(%d) should be true", p)
		}
	}
}

func TestComposites(t *testing.T) {
	composites := []int64{4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 100}
	for _, c := range composites {
		if IsPrimeMillerRabin(c, 10) {
			t.Errorf("IsPrimeMillerRabin(%d, 10) should be false", c)
		}
		if MillerRabinDeterministic(c) {
			t.Errorf("MillerRabinDeterministic(%d) should be false", c)
		}
	}
}

func TestEdgeCases(t *testing.T) {
	if IsPrimeMillerRabin(0, 10) {
		t.Error("IsPrimeMillerRabin(0, 10) should be false")
	}
	if IsPrimeMillerRabin(1, 10) {
		t.Error("IsPrimeMillerRabin(1, 10) should be false")
	}
	if !IsPrimeMillerRabin(2, 10) {
		t.Error("IsPrimeMillerRabin(2, 10) should be true")
	}
	if IsPrimeMillerRabin(4, 10) {
		t.Error("IsPrimeMillerRabin(4, 10) should be false")
	}
}

func TestDeterministic(t *testing.T) {
	if !MillerRabinDeterministic(2) {
		t.Error("MillerRabinDeterministic(2) should be true")
	}
	if !MillerRabinDeterministic(3) {
		t.Error("MillerRabinDeterministic(3) should be true")
	}
	if !MillerRabinDeterministic(17) {
		t.Error("MillerRabinDeterministic(17) should be true")
	}
	if !MillerRabinDeterministic(97) {
		t.Error("MillerRabinDeterministic(97) should be true")
	}
	if MillerRabinDeterministic(100) {
		t.Error("MillerRabinDeterministic(100) should be false")
	}
	if !MillerRabinDeterministic(101) {
		t.Error("MillerRabinDeterministic(101) should be true")
	}
}

func TestLargePrimesNearTwoPow63(t *testing.T) {
	// Every one of these was reported composite when the product overflowed.
	primes := []int64{
		4294967291, 4294967311, 1000000000039,
		2305843009213693951, // 2^61 - 1
		9223372036854775783, // 2^63 - 25, the largest prime below 2^63
	}
	for _, p := range primes {
		if !MillerRabinDeterministic(p) {
			t.Errorf("MillerRabinDeterministic(%d) should be true", p)
		}
		if !IsPrimeMillerRabin(p, 10) {
			t.Errorf("IsPrimeMillerRabin(%d, 10) should be true", p)
		}
		if !MillerRabin(p, 10) {
			t.Errorf("MillerRabin(%d, 10) should be true", p)
		}
	}
}

func TestLargeCompositesNearTwoPow63(t *testing.T) {
	composites := []int64{
		4294967297,          // 2^32 + 1 = 641 * 6700417
		2305843009213693953, // 2^61 + 1
		9223372036854775807, // 2^63 - 1
		9223372012704246007, // 3037000493 * 3037000499
		3215031751,          // strong pseudoprime to bases 2, 3, 5, 7
		3825123056546413051, // strong pseudoprime to the first nine primes
	}
	for _, c := range composites {
		if MillerRabinDeterministic(c) {
			t.Errorf("MillerRabinDeterministic(%d) should be false", c)
		}
		if IsPrimeMillerRabin(c, 20) {
			t.Errorf("IsPrimeMillerRabin(%d, 20) should be false", c)
		}
	}
}

func TestUnsigned64Range(t *testing.T) {
	if !MillerRabinDeterministicU64(18446744073709551557) { // 2^64 - 59
		t.Error("2^64 - 59 is prime")
	}
	if MillerRabinDeterministicU64(18446744073709551615) { // 2^64 - 1
		t.Error("2^64 - 1 is composite")
	}
	if MillerRabinDeterministicU64(9223372036854775809) { // 2^63 + 1
		t.Error("2^63 + 1 is composite")
	}
	if MillerRabinDeterministicU64(0) || !MillerRabinDeterministicU64(97) {
		t.Error("small values are wrong")
	}
}

func TestNegativeAndCarmichael(t *testing.T) {
	if MillerRabinDeterministic(-7) || IsPrimeMillerRabin(-7, 10) {
		t.Error("negative numbers are not prime")
	}
	for _, c := range []int64{561, 1105, 1729, 2465, 2821} {
		if MillerRabinDeterministic(c) || IsPrimeMillerRabin(c, 10) {
			t.Errorf("Carmichael number %d should be composite", c)
		}
	}
}

func TestModPowLarge(t *testing.T) {
	if got := ModPow(3, 1000000, 1000000000000000003); got != 390030038026333578 {
		t.Errorf("ModPow(3, 1e6, 1e18+3) = %d, expected 390030038026333578", got)
	}
	if got := ModPow(-2, 3, 5); got != 2 {
		t.Errorf("ModPow(-2, 3, 5) = %d, expected 2", got)
	}
}

func TestMatchesTrialDivision(t *testing.T) {
	for n := int64(0); n < 5000; n++ {
		prime := n >= 2
		for i := int64(2); i*i <= n; i++ {
			if n%i == 0 {
				prime = false
				break
			}
		}
		if MillerRabinDeterministic(n) != prime || IsPrimeMillerRabin(n, 10) != prime {
			t.Fatalf("n = %d: expected prime = %t", n, prime)
		}
	}
}
