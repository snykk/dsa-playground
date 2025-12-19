package main

import "testing"

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
