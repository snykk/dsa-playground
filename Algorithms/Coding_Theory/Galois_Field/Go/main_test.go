package main

import (
	"errors"
	"reflect"
	"testing"
)

func TestAddIsXor(t *testing.T) {
	gf := Shared()
	if gf.Add(0x53, 0xCA) != 0x53^0xCA {
		t.Fatalf("Add does not XOR")
	}
	for a := 0; a < 256; a++ {
		if gf.Add(byte(a), 0) != byte(a) {
			t.Errorf("Add(%d, 0) != %d", a, a)
		}
		if gf.Add(byte(a), byte(a)) != 0 {
			t.Errorf("Add(%d, %d) != 0", a, a)
		}
	}
}

func TestMulByZeroAndOne(t *testing.T) {
	gf := Shared()
	for a := 0; a < 256; a++ {
		if gf.Mul(byte(a), 0) != 0 {
			t.Errorf("Mul(%d, 0) != 0", a)
		}
		if gf.Mul(byte(a), 1) != byte(a) {
			t.Errorf("Mul(%d, 1) != %d", a, a)
		}
	}
}

func TestAESKnownVector(t *testing.T) {
	gf := Shared()
	if gf.Mul(0x53, 0xCA) != 0x01 {
		t.Errorf("Mul(0x53, 0xCA) != 0x01")
	}
	inv, err := gf.Inv(0x53)
	if err != nil || inv != 0xCA {
		t.Errorf("Inv(0x53) = (0x%X, %v); want (0xCA, nil)", inv, err)
	}
}

func TestMulMatchesSlow(t *testing.T) {
	gf := Shared()
	probes := []int{0, 1, 2, 17, 0x53, 0xCA, 0xFF}
	for _, a := range probes {
		for _, b := range probes {
			got := gf.Mul(byte(a), byte(b))
			want := byte(slowMultiply(a, b, PrimitivePoly))
			if got != want {
				t.Errorf("Mul(%d, %d) = %d; slow = %d", a, b, got, want)
			}
		}
	}
}

func TestEveryNonzeroHasInverse(t *testing.T) {
	gf := Shared()
	for a := 1; a < 256; a++ {
		inv, err := gf.Inv(byte(a))
		if err != nil {
			t.Fatalf("Inv(%d) returned error %v", a, err)
		}
		if gf.Mul(byte(a), inv) != 1 {
			t.Errorf("a * inv(a) != 1 for a=%d", a)
		}
	}
}

func TestInvZeroReturnsError(t *testing.T) {
	gf := Shared()
	if _, err := gf.Inv(0); !errors.Is(err, ErrDivByZero) {
		t.Errorf("Inv(0) error = %v; want ErrDivByZero", err)
	}
}

func TestDivByZeroReturnsError(t *testing.T) {
	gf := Shared()
	if _, err := gf.Div(1, 0); !errors.Is(err, ErrDivByZero) {
		t.Errorf("Div(1, 0) error = %v; want ErrDivByZero", err)
	}
}

func TestFermatLittleAnalog(t *testing.T) {
	gf := Shared()
	for a := 1; a < 256; a++ {
		got, _ := gf.Pow(byte(a), 255)
		if got != 1 {
			t.Errorf("Pow(%d, 255) = %d; want 1", a, got)
		}
	}
}

func TestDistributiveLaw(t *testing.T) {
	gf := Shared()
	for _, a := range []byte{1, 7, 0x53} {
		for _, b := range []byte{3, 0x80, 0xCA} {
			for _, c := range []byte{5, 0x10, 0xFF} {
				lhs := gf.Mul(a, b^c)
				rhs := gf.Mul(a, b) ^ gf.Mul(a, c)
				if lhs != rhs {
					t.Errorf("Distributive fails for (%d, %d, %d)", a, b, c)
				}
			}
		}
	}
}

func TestPolyMul(t *testing.T) {
	gf := Shared()
	// (x + 1)(x + 1) = x^2 + 1 in GF(2)[x]; stored low-degree-first.
	got := gf.PolyMul([]byte{1, 1}, []byte{1, 1})
	want := []byte{1, 0, 1}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("PolyMul([1,1], [1,1]) = %v; want %v", got, want)
	}
}

func TestPolyEvalHorner(t *testing.T) {
	gf := Shared()
	p := []byte{2, 3, 5}
	var x byte = 2
	expected := p[0] ^ gf.Mul(p[1], x) ^ gf.Mul(p[2], gf.Mul(x, x))
	if got := gf.PolyEval(p, x); got != expected {
		t.Errorf("PolyEval = %d; want %d", got, expected)
	}
}

func TestPowLargeExponent(t *testing.T) {
	gf := Shared()
	// log(0x53) * n overflowed int for huge n; the reference values come from
	// the Python version (exponents reduced mod 255).
	cases := []struct {
		n    int
		want byte
	}{{100000000, 29}, {1 << 62, 161}, {-(1 << 62), 0}}
	inv161, _ := gf.Inv(161)
	cases[2].want = inv161
	for _, c := range cases {
		if got, err := gf.Pow(0x53, c.n); err != nil || got != c.want {
			t.Errorf("Pow(0x53, %d) = %d, %v; want %d", c.n, got, err, c.want)
		}
	}
}
