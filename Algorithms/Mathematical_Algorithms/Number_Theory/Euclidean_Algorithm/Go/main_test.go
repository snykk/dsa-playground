package main

import (
	"math/rand"
	"testing"
)

func TestGCD(t *testing.T) {
	tests := []struct {
		a, b, expected int64
	}{
		{48, 18, 6},
		{100, 25, 25},
		{17, 13, 1},
		{0, 5, 5},
		{5, 0, 5},
		{-48, 18, 6},
		{48, -18, 6},
		{42, 42, 42},
	}

	for _, tt := range tests {
		result := GCD(tt.a, tt.b)
		if result != tt.expected {
			t.Errorf("GCD(%d, %d) = %d, expected %d", tt.a, tt.b, result, tt.expected)
		}
	}
}

func TestGCDCommutative(t *testing.T) {
	if GCD(48, 18) != GCD(18, 48) {
		t.Error("GCD should be commutative")
	}
	if GCD(100, 25) != GCD(25, 100) {
		t.Error("GCD should be commutative")
	}
}

func TestGCDIterative(t *testing.T) {
	tests := []struct {
		a, b, expected int64
	}{
		{48, 18, 6},
		{100, 25, 25},
		{17, 13, 1},
	}

	for _, tt := range tests {
		result := GCDIterative(tt.a, tt.b)
		if result != tt.expected {
			t.Errorf("GCDIterative(%d, %d) = %d, expected %d", tt.a, tt.b, result, tt.expected)
		}
		// Should match recursive version
		if result != GCD(tt.a, tt.b) {
			t.Errorf("GCDIterative(%d, %d) != GCD(%d, %d)", tt.a, tt.b, tt.a, tt.b)
		}
	}
}

func TestLCM(t *testing.T) {
	tests := []struct {
		a, b, expected int64
	}{
		{12, 18, 36},
		{7, 5, 35},
		{4, 6, 12},
		{0, 5, 0},
		{5, 0, 0},
		{42, 42, 42},
	}

	for _, tt := range tests {
		result := LCM(tt.a, tt.b)
		if result != tt.expected {
			t.Errorf("LCM(%d, %d) = %d, expected %d", tt.a, tt.b, result, tt.expected)
		}
	}
}

func TestLCMCommutative(t *testing.T) {
	if LCM(12, 18) != LCM(18, 12) {
		t.Error("LCM should be commutative")
	}
}

func TestLCMGCDRelationship(t *testing.T) {
	a, b := int64(12), int64(18)
	if LCM(a, b)*GCD(a, b) != a*b {
		t.Errorf("LCM(%d, %d) * GCD(%d, %d) should equal %d * %d", a, b, a, b, a, b)
	}

	a, b = 7, 5
	if LCM(a, b)*GCD(a, b) != a*b {
		t.Errorf("LCM(%d, %d) * GCD(%d, %d) should equal %d * %d", a, b, a, b, a, b)
	}
}

func TestExtendedGCD(t *testing.T) {
	result := ExtendedGCD(48, 18)
	if result.GCD != 6 {
		t.Errorf("ExtendedGCD(48, 18).GCD = %d, expected 6", result.GCD)
	}
	// Verify Bezout's identity: ax + by = gcd
	if 48*result.X+18*result.Y != result.GCD {
		t.Errorf("48*%d + 18*%d = %d, expected %d", result.X, result.Y, 48*result.X+18*result.Y, result.GCD)
	}

	result = ExtendedGCD(100, 25)
	if result.GCD != 25 {
		t.Errorf("ExtendedGCD(100, 25).GCD = %d, expected 25", result.GCD)
	}
	if 100*result.X+25*result.Y != result.GCD {
		t.Errorf("100*%d + 25*%d = %d, expected %d", result.X, result.Y, 100*result.X+25*result.Y, result.GCD)
	}
}

func TestExtendedGCDCoprime(t *testing.T) {
	result := ExtendedGCD(17, 13)
	if result.GCD != 1 {
		t.Errorf("ExtendedGCD(17, 13).GCD = %d, expected 1", result.GCD)
	}
	if 17*result.X+13*result.Y != 1 {
		t.Errorf("17*%d + 13*%d = %d, expected 1", result.X, result.Y, 17*result.X+13*result.Y)
	}
}

func TestExtendedGCDNegativeInputs(t *testing.T) {
	cases := [][2]int64{{-48, 18}, {48, -18}, {-48, -18}, {-17, 13}, {0, -7}, {-7, 0}}
	for _, c := range cases {
		r := ExtendedGCD(c[0], c[1])
		if r.GCD != GCD(c[0], c[1]) || c[0]*r.X+c[1]*r.Y != r.GCD {
			t.Errorf("ExtendedGCD(%d, %d) = %+v: a*x + b*y must equal gcd", c[0], c[1], r)
		}
	}
}

func TestExtendedGCDIdentityRandomSigned(t *testing.T) {
	rng := rand.New(rand.NewSource(2026))
	for i := 0; i < 20000; i++ {
		a := rng.Int63n(2000001) - 1000000
		b := rng.Int63n(2000001) - 1000000
		r := ExtendedGCD(a, b)
		if r.GCD != GCDIterative(a, b) || a*r.X+b*r.Y != r.GCD {
			t.Fatalf("ExtendedGCD(%d, %d) = %+v violates a*x + b*y = gcd", a, b, r)
		}
	}
}

func TestExtendedGCDZero(t *testing.T) {
	if r := ExtendedGCD(0, 0); r.GCD != 0 || r.X != 1 || r.Y != 0 {
		t.Errorf("ExtendedGCD(0, 0) = %+v, expected {0 1 0}", r)
	}
}

func TestLCMDoesNotOverflow(t *testing.T) {
	// |a * b| = 1.6e19 does not fit in 64 bits, the lcm 4e9 does.
	if got := LCM(4000000000, 4000000000); got != 4000000000 {
		t.Errorf("LCM(4e9, 4e9) = %d, expected 4000000000", got)
	}
	if got := LCM(-4000000000, 4000000000); got != 4000000000 {
		t.Errorf("LCM(-4e9, 4e9) = %d, expected 4000000000", got)
	}
	if got := LCM(100000007, 100000037); got != 10000004400000259 {
		t.Errorf("LCM(100000007, 100000037) = %d, expected 10000004400000259", got)
	}
}

func TestGCDAbove2Pow53(t *testing.T) {
	// 2^53 + 1 = 3 * 3002399751580331; the old float64 abs rounded it.
	if got := GCD(9007199254740993, 3); got != 3 {
		t.Errorf("GCD(2^53+1, 3) = %d, expected 3", got)
	}
	if got := GCDIterative(-9007199254740993, 3); got != 3 {
		t.Errorf("GCDIterative(-(2^53+1), 3) = %d, expected 3", got)
	}
}
