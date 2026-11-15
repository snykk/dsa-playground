// Package main implements GF(2^8) arithmetic for Reed-Solomon and AES.
//
// Each byte (0..255) is treated as a polynomial of degree <= 7 over GF(2).
// Addition is XOR; multiplication is polynomial multiplication modulo the
// Rijndael irreducible polynomial x^8 + x^4 + x^3 + x + 1 (0x11B).
package main

import (
	"errors"
	"fmt"
)

// Field parameters.
const (
	PrimitivePoly = 0x11B
	Generator     = 0x03
	FieldSize     = 256
	FieldOrder    = 255
)

// ErrDivByZero is returned by Div / Inv when the divisor is 0.
var ErrDivByZero = errors.New("gf256: division by zero")

// slowMultiply does polynomial multiplication in GF(2^8) without tables.
// Used at table-build time only.
func slowMultiply(a, b, poly int) int {
	result := 0
	for a != 0 && b != 0 {
		if b&1 != 0 {
			result ^= a
		}
		b >>= 1
		a <<= 1
		if a&0x100 != 0 {
			a ^= poly
		}
	}
	return result
}

// GF256 represents the field GF(2^8) under a chosen irreducible polynomial.
// Once constructed, all methods are read-only and safe for concurrent use.
type GF256 struct {
	expTable [2 * FieldOrder]byte
	logTable [FieldSize]byte
}

// NewGF256 builds the log/antilog tables for the given polynomial and generator.
// Use the package-level Shared() for the default Rijndael field unless you have
// a specific reason to vary the polynomial.
func NewGF256(poly, generator int) *GF256 {
	g := &GF256{}
	acc := 1
	for i := 0; i < FieldOrder; i++ {
		g.expTable[i] = byte(acc)
		g.logTable[acc] = byte(i)
		acc = slowMultiply(acc, generator, poly)
	}
	// Doubled exp table lets multiply skip the (% 255) check.
	for i := FieldOrder; i < 2*FieldOrder; i++ {
		g.expTable[i] = g.expTable[i-FieldOrder]
	}
	return g
}

var defaultField = NewGF256(PrimitivePoly, Generator)

// Shared returns the singleton GF(2^8) under the AES/Rijndael polynomial.
func Shared() *GF256 { return defaultField }

// Add returns a + b == a ^ b (subtraction is the same op in characteristic 2).
func (g *GF256) Add(a, b byte) byte { return a ^ b }

// Sub is identical to Add in GF(2^8).
func (g *GF256) Sub(a, b byte) byte { return a ^ b }

// Mul returns a * b in O(1) via table lookup.
func (g *GF256) Mul(a, b byte) byte {
	if a == 0 || b == 0 {
		return 0
	}
	return g.expTable[int(g.logTable[a])+int(g.logTable[b])]
}

// Div returns a / b. Returns an error when b == 0.
func (g *GF256) Div(a, b byte) (byte, error) {
	if b == 0 {
		return 0, ErrDivByZero
	}
	if a == 0 {
		return 0, nil
	}
	diff := int(g.logTable[a]) - int(g.logTable[b])
	if diff < 0 {
		diff += FieldOrder
	}
	return g.expTable[diff], nil
}

// Inv returns the multiplicative inverse of b. Returns an error when b == 0.
func (g *GF256) Inv(b byte) (byte, error) {
	if b == 0 {
		return 0, ErrDivByZero
	}
	return g.expTable[FieldOrder-int(g.logTable[b])], nil
}

// Pow returns a^n. Negative n is allowed: the exponent is reduced into 0..254,
// which gives Inv(a)^(-n). Returns an error for 0^0 only; 0^n is 0 for any other n.
func (g *GF256) Pow(a byte, n int) (byte, error) {
	if a == 0 {
		if n == 0 {
			return 0, errors.New("gf256: 0^0 is undefined")
		}
		return 0, nil
	}
	e := (int(g.logTable[a]) * n) % FieldOrder
	if e < 0 {
		e += FieldOrder
	}
	return g.expTable[e], nil
}

// -- Polynomial helpers (low-degree-first slices) ---------------------------

// PolyAdd returns p + q over GF(2^8).
func (g *GF256) PolyAdd(p, q []byte) []byte {
	if len(p) < len(q) {
		p, q = q, p
	}
	r := make([]byte, len(p))
	copy(r, p)
	for i, v := range q {
		r[i] ^= v
	}
	return r
}

// PolyScale returns k * p (scalar k times polynomial p).
func (g *GF256) PolyScale(p []byte, k byte) []byte {
	r := make([]byte, len(p))
	for i, c := range p {
		r[i] = g.Mul(c, k)
	}
	return r
}

// PolyMul returns p * q (polynomial product).
func (g *GF256) PolyMul(p, q []byte) []byte {
	if len(p) == 0 || len(q) == 0 {
		return nil
	}
	r := make([]byte, len(p)+len(q)-1)
	for i, pi := range p {
		if pi == 0 {
			continue
		}
		for j, qj := range q {
			r[i+j] ^= g.Mul(pi, qj)
		}
	}
	return r
}

// PolyEval returns p(x) via Horner's method.
func (g *GF256) PolyEval(p []byte, x byte) byte {
	if len(p) == 0 {
		return 0
	}
	y := p[len(p)-1]
	for i := len(p) - 2; i >= 0; i-- {
		y = g.Mul(y, x) ^ p[i]
	}
	return y
}

func main() {
	gf := Shared()
	fmt.Printf("0x53 + 0xCA = 0x%02X\n", gf.Add(0x53, 0xCA)) // 0x99
	fmt.Printf("0x53 * 0xCA = 0x%02X\n", gf.Mul(0x53, 0xCA)) // 0x01
	inv, _ := gf.Inv(0x53)
	fmt.Printf("inv(0x53)   = 0x%02X\n", inv) // 0xCA
}
