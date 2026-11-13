package main

import (
	"math/rand"
	"testing"
)

func TestModPow(t *testing.T) {
	tests := []struct {
		base, exponent, modulus, expected int64
	}{
		{2, 10, 1000, 24},
		{3, 5, 7, 5},
		{5, 13, 11, 4},
		{5, 0, 7, 1},
		{0, 5, 7, 0},
		{5, 10, 1, 0},
	}

	for _, tt := range tests {
		result := ModPow(tt.base, tt.exponent, tt.modulus)
		if result != tt.expected {
			t.Errorf("ModPow(%d, %d, %d) = %d, expected %d", tt.base, tt.exponent, tt.modulus, result, tt.expected)
		}
	}
}

func TestModInverse(t *testing.T) {
	result := ModInverse(3, 11)
	if result != 4 {
		t.Errorf("ModInverse(3, 11) = %d, expected 4", result)
	}
	if (3*result)%11 != 1 {
		t.Errorf("ModInverse verification failed: (3 * 4) mod 11 != 1")
	}
}

func TestModInverseNotCoprime(t *testing.T) {
	result := ModInverse(4, 8)
	if result != -1 {
		t.Errorf("ModInverse(4, 8) = %d, expected -1", result)
	}
}

func TestLargeModulusNoOverflow(t *testing.T) {
	if got := ModPow(3, 1000000, 1000000000000000003); got != 390030038026333578 {
		t.Errorf("ModPow(3, 1e6, 1e18+3) = %d, expected 390030038026333578", got)
	}
	// Fermat: a^(p-1) = 1 for the prime p = 2^61 - 1 (products need 122 bits).
	const p = int64(2305843009213693951)
	if got := ModPow(123456789, p-1, p); got != 1 {
		t.Errorf("ModPow(123456789, p-1, 2^61-1) = %d, expected 1", got)
	}
	if got := ModPow(2, 61, p); got != 1 {
		t.Errorf("ModPow(2, 61, 2^61-1) = %d, expected 1", got)
	}
	// 2^63 - 25 is the largest prime below 2^63.
	const q = int64(9223372036854775783)
	if got := ModPow(5, q-1, q); got != 1 {
		t.Errorf("ModPow(5, q-1, 2^63-25) = %d, expected 1", got)
	}
}

func TestNegativeBase(t *testing.T) {
	if got := ModPow(-2, 3, 5); got != 2 {
		t.Errorf("ModPow(-2, 3, 5) = %d, expected 2", got)
	}
	if got := ModPow(-1, 1000001, 7); got != 6 {
		t.Errorf("ModPow(-1, 1000001, 7) = %d, expected 6", got)
	}
}

func TestNegativeExponent(t *testing.T) {
	if got := ModPow(2, -1, 11); got != 6 {
		t.Errorf("ModPow(2, -1, 11) = %d, expected 6", got)
	}
	if got := ModPow(2, -1, 12); got != -1 {
		t.Errorf("ModPow(2, -1, 12) = %d, expected -1", got)
	}
}

func TestInverseOfNegativeNumber(t *testing.T) {
	if got := ModInverse(-3, 11); got != 7 {
		t.Errorf("ModInverse(-3, 11) = %d, expected 7", got)
	}
	for a := int64(-30); a < 30; a++ {
		inv := ModInverse(a, 11)
		if a%11 == 0 {
			if inv != -1 {
				t.Errorf("ModInverse(%d, 11) = %d, expected -1", a, inv)
			}
		} else if ((a%11+11)*inv)%11 != 1 {
			t.Errorf("ModInverse(%d, 11) = %d is not an inverse", a, inv)
		}
	}
}

func TestInverseAbove2Pow53(t *testing.T) {
	// The old float64 abs rounded 2^53 + 1 and returned a wrong inverse.
	a := int64(9007199254740993)
	inv := ModInverse(a, 1000000007)
	if inv == -1 || mulMod(a%1000000007, inv, 1000000007) != 1 {
		t.Errorf("ModInverse(2^53+1, 1e9+7) = %d is not an inverse", inv)
	}
}

func TestExtendedGcdSignedIdentity(t *testing.T) {
	rng := rand.New(rand.NewSource(5))
	for i := 0; i < 20000; i++ {
		a := rng.Int63n(1001) - 500
		b := rng.Int63n(1001) - 500
		r := extendedGcd(a, b)
		if r.GCD < 0 || a*r.X+b*r.Y != r.GCD {
			t.Fatalf("extendedGcd(%d, %d) = %+v violates a*x + b*y = gcd", a, b, r)
		}
	}
}

func TestLargeExponent(t *testing.T) {
	if got := ModPow(2, 100, 1000); got != 376 {
		t.Errorf("ModPow(2, 100, 1000) = %d, expected 376", got)
	}
	if got := ModPow(2, 9223372036854775807, 1000000007); got != 529367677 {
		t.Errorf("ModPow(2, 2^63-1, 1e9+7) = %d, expected 529367677", got)
	}
}
