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
