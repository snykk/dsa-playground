package main

import "testing"

func TestMod(t *testing.T) {
	if mod(-5, MOD) != MOD-5 {
		t.Error("mod(-5) should be MOD-5")
	}
}

func TestPower(t *testing.T) {
	if power(2, 10, MOD) != 1024 {
		t.Error("2^10 should be 1024")
	}
}

func TestModInverse(t *testing.T) {
	inv := modInverse(3, MOD)
	if mul(3, inv, MOD) != 1 {
		t.Error("3 * inv(3) should be 1")
	}
}

func TestFactorials(t *testing.T) {
	fact := NewFactorials(10, MOD)
	if fact.NCr(10, 3) != 120 {
		t.Errorf("Expected 120, got %d", fact.NCr(10, 3))
	}
}
