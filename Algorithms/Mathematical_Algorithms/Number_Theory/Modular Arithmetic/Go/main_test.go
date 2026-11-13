package main

import (
	"math/rand"
	"testing"
)

func TestModAdd(t *testing.T) {
	tests := []struct {
		a, b, m, expected int64
	}{
		{7, 5, 11, 1},
		{10, 5, 11, 4},
		{0, 0, 11, 0},
	}

	for _, tt := range tests {
		result := ModAdd(tt.a, tt.b, tt.m)
		if result != tt.expected {
			t.Errorf("ModAdd(%d, %d, %d) = %d, expected %d", tt.a, tt.b, tt.m, result, tt.expected)
		}
	}
}

func TestModSubtract(t *testing.T) {
	tests := []struct {
		a, b, m, expected int64
	}{
		{7, 5, 11, 2},
		{3, 5, 11, 9}, // 3 - 5 = -2, which is 9 modulo 11
		{0, 0, 11, 0},
	}

	for _, tt := range tests {
		result := ModSubtract(tt.a, tt.b, tt.m)
		if result != tt.expected {
			t.Errorf("ModSubtract(%d, %d, %d) = %d, expected %d", tt.a, tt.b, tt.m, result, tt.expected)
		}
	}
}

func TestModMultiply(t *testing.T) {
	tests := []struct {
		a, b, m, expected int64
	}{
		{7, 5, 11, 2},
		{3, 4, 11, 1},
		{0, 5, 11, 0},
	}

	for _, tt := range tests {
		result := ModMultiply(tt.a, tt.b, tt.m)
		if result != tt.expected {
			t.Errorf("ModMultiply(%d, %d, %d) = %d, expected %d", tt.a, tt.b, tt.m, result, tt.expected)
		}
	}
}

func TestModDivide(t *testing.T) {
	result := ModDivide(7, 5, 11)
	if result != 8 {
		t.Errorf("ModDivide(7, 5, 11) = %d, expected 8", result)
	}
	if (result*5)%11 != 7 {
		t.Errorf("ModDivide verification failed: (8 * 5) mod 11 != 7")
	}
}

func TestModDivideNoInverse(t *testing.T) {
	result := ModDivide(4, 8, 12) // GCD(8, 12) = 4 != 1
	if result != -1 {
		t.Errorf("ModDivide(4, 8, 12) = %d, expected -1", result)
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

func TestModPower(t *testing.T) {
	tests := []struct {
		base, exponent, m, expected int64
	}{
		{2, 5, 11, 10},
		{3, 5, 7, 5},
		{5, 0, 11, 1},
	}

	for _, tt := range tests {
		result := ModPower(tt.base, tt.exponent, tt.m)
		if result != tt.expected {
			t.Errorf("ModPower(%d, %d, %d) = %d, expected %d", tt.base, tt.exponent, tt.m, result, tt.expected)
		}
	}
}

func TestModArithmeticProperties(t *testing.T) {
	m := int64(11)
	a, b, c := int64(7), int64(5), int64(3)

	// Associativity of addition
	if ModAdd(ModAdd(a, b, m), c, m) != ModAdd(a, ModAdd(b, c, m), m) {
		t.Error("ModAdd should be associative")
	}

	// Associativity of multiplication
	if ModMultiply(ModMultiply(a, b, m), c, m) != ModMultiply(a, ModMultiply(b, c, m), m) {
		t.Error("ModMultiply should be associative")
	}

	// Distributivity
	if ModMultiply(a, ModAdd(b, c, m), m) != ModAdd(ModMultiply(a, b, m), ModMultiply(a, c, m), m) {
		t.Error("ModMultiply should be distributive over ModAdd")
	}
}

func TestNegativeOperandsStayInRange(t *testing.T) {
	if got := ModAdd(-3, 1, 11); got != 9 {
		t.Errorf("ModAdd(-3, 1, 11) = %d, expected 9", got)
	}
	if got := ModMultiply(-3, 4, 11); got != 10 {
		t.Errorf("ModMultiply(-3, 4, 11) = %d, expected 10", got)
	}
	if got := ModPower(-2, 3, 5); got != 2 {
		t.Errorf("ModPower(-2, 3, 5) = %d, expected 2", got)
	}
	if got := ModSubtract(-3, -5, 11); got != 2 {
		t.Errorf("ModSubtract(-3, -5, 11) = %d, expected 2", got)
	}
}

func TestExtendedGcdSignedIdentity(t *testing.T) {
	rng := rand.New(rand.NewSource(11))
	gcd := func(a, b int64) int64 {
		if a < 0 {
			a = -a
		}
		if b < 0 {
			b = -b
		}
		for b != 0 {
			a, b = b, a%b
		}
		return a
	}
	for i := 0; i < 20000; i++ {
		a := rng.Int63n(1001) - 500
		b := rng.Int63n(1001) - 500
		r := extendedGcd(a, b)
		if r.GCD != gcd(a, b) || a*r.X+b*r.Y != r.GCD {
			t.Fatalf("extendedGcd(%d, %d) = %+v violates a*x + b*y = gcd", a, b, r)
		}
	}
}

func TestInverseOfNegativeNumber(t *testing.T) {
	if got := ModInverse(-3, 11); got != 7 {
		t.Errorf("ModInverse(-3, 11) = %d, expected 7", got)
	}
	if got := ModDivide(1, -3, 11); got != 7 {
		t.Errorf("ModDivide(1, -3, 11) = %d, expected 7", got)
	}
	if got := ModDivide(-1, 1, 11); got != 10 {
		t.Errorf("ModDivide(-1, 1, 11) = %d, expected 10 (not the -1 sentinel)", got)
	}
	for a := int64(-30); a < 30; a++ {
		inv := ModInverse(a, 11)
		if a%11 == 0 {
			if inv != -1 {
				t.Errorf("ModInverse(%d, 11) = %d, expected -1", a, inv)
			}
		} else if ModMultiply(a, inv, 11) != 1 {
			t.Errorf("ModInverse(%d, 11) = %d is not an inverse", a, inv)
		}
	}
}

func TestNegativeExponent(t *testing.T) {
	if got := ModPower(2, -1, 11); got != 6 {
		t.Errorf("ModPower(2, -1, 11) = %d, expected 6", got)
	}
	if got := ModPower(2, -1, 12); got != -1 {
		t.Errorf("ModPower(2, -1, 12) = %d, expected -1", got)
	}
}

func TestLargeModulusNoOverflow(t *testing.T) {
	const m = int64(1000000000000000003)
	if got := ModMultiply(1000000000000, 1000000000000, m); got != 999999999997000003 {
		t.Errorf("ModMultiply(1e12, 1e12, 1e18+3) = %d, expected 999999999997000003", got)
	}
	if got := ModPower(3, 1000000, m); got != 390030038026333578 {
		t.Errorf("ModPower(3, 1e6, 1e18+3) = %d, expected 390030038026333578", got)
	}
	// m > 2^62: a plain x + y would overflow.
	const big = int64(9223372036854775783) // 2^63 - 25
	if got := ModAdd(big-1, big-2, big); got != big-3 {
		t.Errorf("ModAdd near 2^63 = %d, expected %d", got, big-3)
	}
	if got := ModSubtract(1, big-1, big); got != 2 {
		t.Errorf("ModSubtract near 2^63 = %d, expected 2", got)
	}
	if got := ModMultiply(big-1, big-1, big); got != 1 {
		t.Errorf("ModMultiply near 2^63 = %d, expected 1", got)
	}
	inv := ModInverse(1234567890123, big)
	if inv == -1 || ModMultiply(1234567890123, inv, big) != 1 {
		t.Errorf("ModInverse near 2^63 = %d is not an inverse", inv)
	}
}

func TestInverseAbove2Pow53(t *testing.T) {
	// The old float64 abs rounded 2^53 + 1 and returned a wrong inverse.
	a := int64(9007199254740993)
	inv := ModInverse(a, 1000000007)
	if inv == -1 || ModMultiply(a, inv, 1000000007) != 1 {
		t.Errorf("ModInverse(2^53+1, 1e9+7) = %d is not an inverse", inv)
	}
}
