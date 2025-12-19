package main

import "testing"

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
	// Verify Bézout's identity: ax + by = gcd
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
