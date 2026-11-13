package main

import (
	"math/big"
	"testing"
)

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

func TestAddSubMul(t *testing.T) {
	if add(MOD-1, 5, MOD) != 4 || sub(3, 5, MOD) != MOD-2 || sub(-3, -5, MOD) != 2 {
		t.Error("add/sub wrong")
	}
	if mul(MOD-1, MOD-1, MOD) != 1 || mul(-2, 3, 7) != 1 {
		t.Error("mul wrong")
	}
}

func TestPowerValues(t *testing.T) {
	if power(2, 100, MOD) != 976371285 {
		t.Errorf("2^100 mod 1e9+7 = %d, expected 976371285", power(2, 100, MOD))
	}
	if power(0, 0, 7) != 1 || power(3, 0, 7) != 1 {
		t.Error("x^0 should be 1")
	}
}

func TestPowerModulusOne(t *testing.T) {
	if power(5, 0, 1) != 0 || power(5, 3, 1) != 0 {
		t.Error("everything is 0 modulo 1, including x^0")
	}
}

func TestLargeModulusProducts(t *testing.T) {
	// A plain int64 product of two 3e18 values overflows; mul must not.
	m := int64(4000000000000000037)
	a := int64(3000000000000000000)
	want := new(big.Int).Mul(big.NewInt(a), big.NewInt(a))
	want.Mod(want, big.NewInt(m))
	if mul(a, a, m) != want.Int64() {
		t.Errorf("mul(a, a, m) = %d, expected %d", mul(a, a, m), want.Int64())
	}
	if power(a, 2, m) != want.Int64() {
		t.Errorf("power(a, 2, m) = %d, expected %d", power(a, 2, m), want.Int64())
	}
}

func TestInverses(t *testing.T) {
	for _, a := range []int64{1, 2, 3, 12345, MOD - 1} {
		if mul(a, modInverse(a, MOD), MOD) != 1 || mul(a, modInverseExtGCD(a, MOD), MOD) != 1 {
			t.Errorf("inverse of %d is wrong", a)
		}
	}
	if modInverseExtGCD(3, 10) != 7 || modInverseExtGCD(2, 10) != -1 {
		t.Error("composite modulus inverse wrong")
	}
	if mul(divMod(7, 3, MOD), 3, MOD) != 7 {
		t.Error("divMod wrong")
	}
}

func TestLucasUsesTheGivenPrime(t *testing.T) {
	// C(36, 18) mod 37 is 1
	if got := lucasNCr(36, 18, 37); got != 1 {
		t.Errorf("lucasNCr(36, 18, 37) = %d, expected 1", got)
	}
}

func TestLucasAgainstBig(t *testing.T) {
	for _, p := range []int64{2, 3, 5, 7, 11, 13, 37} {
		for n := int64(0); n <= 80; n += 3 {
			for r := int64(0); r <= n; r += 2 {
				want := new(big.Int).Binomial(n, r)
				want.Mod(want, big.NewInt(p))
				if got := lucasNCr(n, r, p); got != want.Int64() {
					t.Fatalf("lucasNCr(%d, %d, %d) = %d, expected %d", n, r, p, got, want.Int64())
				}
			}
		}
	}
}
