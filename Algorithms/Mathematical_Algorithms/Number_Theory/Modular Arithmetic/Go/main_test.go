package main

import "testing"

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
		{3, 5, 11, 9}, // 3 - 5 = -2 ≡ 9 (mod 11)
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
