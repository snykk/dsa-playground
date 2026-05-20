// Package main implements Reed-Solomon error correction over GF(2^8).
//
// Includes systematic encode and Berlekamp-Massey + Forney + Chien decode.
// Uses primitive element alpha = 3 (true primitive of GF(2^8) under 0x11B);
// alpha = 2 has multiplicative order 51, not 255, and silently fails past
// a few errors.
//
// For brevity, a minimal GF(2^8) lives in this file. The sibling
// ../Galois_Field/Go package implements the same operations and agrees
// byte-for-byte.
package main

import (
	"errors"
	"fmt"
)

// -- Minimal GF(2^8) under Rijndael polynomial 0x11B -----------------------

const (
	primitivePoly = 0x11B
	fieldOrder    = 255
)

var (
	expTable [2 * fieldOrder]byte
	logTable [256]byte
)

func init() {
	acc := 1
	for i := 0; i < fieldOrder; i++ {
		expTable[i] = byte(acc)
		logTable[acc] = byte(i)
		acc = slowMul(acc, 0x03)
	}
	for i := fieldOrder; i < 2*fieldOrder; i++ {
		expTable[i] = expTable[i-fieldOrder]
	}
}

func slowMul(a, b int) int {
	r := 0
	for a != 0 && b != 0 {
		if b&1 != 0 {
			r ^= a
		}
		b >>= 1
		a <<= 1
		if a&0x100 != 0 {
			a ^= primitivePoly
		}
	}
	return r
}

func gfAdd(a, b byte) byte { return a ^ b }

func gfMul(a, b byte) byte {
	if a == 0 || b == 0 {
		return 0
	}
	return expTable[int(logTable[a])+int(logTable[b])]
}

func gfDiv(a, b byte) byte {
	if b == 0 {
		panic("gf256: division by zero")
	}
	if a == 0 {
		return 0
	}
	d := int(logTable[a]) - int(logTable[b])
	if d < 0 {
		d += fieldOrder
	}
	return expTable[d]
}

func gfInv(b byte) byte {
	if b == 0 {
		panic("gf256: inverse of zero")
	}
	return expTable[fieldOrder-int(logTable[b])]
}

func gfPow(a byte, n int) byte {
	if a == 0 {
		if n == 0 {
			panic("gf256: 0^0 undefined")
		}
		return 0
	}
	e := (int(logTable[a]) * n) % fieldOrder
	if e < 0 {
		e += fieldOrder
	}
	return expTable[e]
}

func polyAdd(p, q []byte) []byte {
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

func polyScale(p []byte, k byte) []byte {
	r := make([]byte, len(p))
	for i, c := range p {
		r[i] = gfMul(c, k)
	}
	return r
}

func polyMul(p, q []byte) []byte {
	if len(p) == 0 || len(q) == 0 {
		return nil
	}
	r := make([]byte, len(p)+len(q)-1)
	for i, pi := range p {
		if pi == 0 {
			continue
		}
		for j, qj := range q {
			r[i+j] ^= gfMul(pi, qj)
		}
	}
	return r
}

func polyEval(p []byte, x byte) byte {
	if len(p) == 0 {
		return 0
	}
	y := p[len(p)-1]
	for i := len(p) - 2; i >= 0; i-- {
		y = gfMul(y, x) ^ p[i]
	}
	return y
}

func polyDivmod(dividend, divisor []byte) (quotient, remainder []byte) {
	if len(divisor) == 0 {
		panic("polyDivmod: empty divisor")
	}
	if len(dividend) < len(divisor) {
		return nil, append([]byte(nil), dividend...)
	}
	out := make([]byte, len(dividend))
	copy(out, dividend)
	normalizer := divisor[len(divisor)-1]
	for i := len(dividend) - len(divisor); i >= 0; i-- {
		coef := gfDiv(out[i+len(divisor)-1], normalizer)
		if coef != 0 {
			for j := 0; j < len(divisor)-1; j++ {
				if divisor[j] != 0 {
					out[i+j] ^= gfMul(divisor[j], coef)
				}
			}
		}
		out[i+len(divisor)-1] = coef
	}
	sep := len(divisor) - 1
	return out[sep:], out[:sep]
}

// -- Reed-Solomon ----------------------------------------------------------

// ErrDecode is returned when the codeword has more errors than t = (n-k)/2.
var ErrDecode = errors.New("reed-solomon: decode failed (too many errors)")

// ReedSolomon is an (n, k) Reed-Solomon code over GF(2^8).
type ReedSolomon struct {
	n, k, t   int
	alpha     byte
	generator []byte
}

// NewReedSolomon builds an (n, k) code with the given primitive element.
// alpha = 3 is the recommended primitive of GF(2^8) under Rijndael 0x11B.
func NewReedSolomon(n, k int, alpha byte) (*ReedSolomon, error) {
	if !(0 < k && k < n) {
		return nil, fmt.Errorf("need 0 < k < n; got k=%d n=%d", k, n)
	}
	if n > 255 {
		return nil, errors.New("n must be <= 255 for GF(2^8)")
	}
	rs := &ReedSolomon{n: n, k: k, alpha: alpha, t: (n - k) / 2}
	rs.generator = rs.buildGenerator()
	return rs, nil
}

// N returns the codeword length.
func (rs *ReedSolomon) N() int { return rs.n }

// K returns the message length.
func (rs *ReedSolomon) K() int { return rs.k }

// T returns the max correctable errors.
func (rs *ReedSolomon) T() int { return rs.t }

func (rs *ReedSolomon) buildGenerator() []byte {
	g := []byte{1}
	for i := 0; i < rs.n-rs.k; i++ {
		g = polyMul(g, []byte{gfPow(rs.alpha, i), 1})
	}
	return g
}

// Encode produces an n-byte codeword from a k-byte message.
// Layout: codeword[0..n-k-1] = parity, codeword[n-k..n-1] = message.
func (rs *ReedSolomon) Encode(message []byte) ([]byte, error) {
	if len(message) != rs.k {
		return nil, fmt.Errorf("message must have %d bytes; got %d", rs.k, len(message))
	}
	parityLen := rs.n - rs.k
	dividend := make([]byte, parityLen+len(message))
	copy(dividend[parityLen:], message)
	_, rem := polyDivmod(dividend, rs.generator)
	codeword := make([]byte, rs.n)
	for i := 0; i < len(rem) && i < parityLen; i++ {
		codeword[i] = rem[i]
	}
	copy(codeword[parityLen:], message)
	return codeword, nil
}

// Decode recovers the k-byte message from a (possibly corrupted) codeword.
// Returns ErrDecode if more than t errors are present.
func (rs *ReedSolomon) Decode(received []byte) ([]byte, error) {
	if len(received) != rs.n {
		return nil, fmt.Errorf("received must have %d bytes; got %d", rs.n, len(received))
	}
	syndromes := rs.computeSyndromes(received)
	allZero := true
	for _, s := range syndromes {
		if s != 0 {
			allZero = false
			break
		}
	}
	if allZero {
		out := make([]byte, rs.k)
		copy(out, received[rs.n-rs.k:])
		return out, nil
	}
	errLoc := rs.berlekampMassey(syndromes)
	positions := rs.findErrorPositions(errLoc)
	if len(positions) == 0 || len(positions) != len(errLoc)-1 {
		return nil, ErrDecode
	}
	mags, err := rs.forney(syndromes, errLoc, positions)
	if err != nil {
		return nil, err
	}
	corrected := make([]byte, rs.n)
	copy(corrected, received)
	for i, p := range positions {
		corrected[p] ^= mags[i]
	}
	// Verify all syndromes vanish.
	for _, s := range rs.computeSyndromes(corrected) {
		if s != 0 {
			return nil, ErrDecode
		}
	}
	out := make([]byte, rs.k)
	copy(out, corrected[rs.n-rs.k:])
	return out, nil
}

func (rs *ReedSolomon) computeSyndromes(r []byte) []byte {
	out := make([]byte, rs.n-rs.k)
	for i := 0; i < rs.n-rs.k; i++ {
		out[i] = polyEval(r, gfPow(rs.alpha, i))
	}
	return out
}

func (rs *ReedSolomon) berlekampMassey(syndromes []byte) []byte {
	lam := []byte{1}
	prev := []byte{1}
	L := 0
	m := 1
	b := byte(1)
	for n := 0; n < len(syndromes); n++ {
		delta := syndromes[n]
		for i := 1; i <= L; i++ {
			if i < len(lam) && lam[i] != 0 {
				delta ^= gfMul(lam[i], syndromes[n-i])
			}
		}
		if delta == 0 {
			m++
			continue
		}
		// shift = (delta / b) * x^m * prev
		scale := gfDiv(delta, b)
		shift := make([]byte, m)
		for _, c := range prev {
			shift = append(shift, gfMul(c, scale))
		}
		length := len(lam)
		if len(shift) > length {
			length = len(shift)
		}
		newLam := make([]byte, length)
		copy(newLam, lam)
		for i, s := range shift {
			newLam[i] ^= s
		}
		if 2*L <= n {
			tPoly := make([]byte, len(lam))
			copy(tPoly, lam)
			lam = newLam
			L = n + 1 - L
			prev = tPoly
			b = delta
			m = 1
		} else {
			lam = newLam
			m++
		}
	}
	for len(lam) > 1 && lam[len(lam)-1] == 0 {
		lam = lam[:len(lam)-1]
	}
	return lam
}

func (rs *ReedSolomon) findErrorPositions(errLoc []byte) []int {
	var positions []int
	for i := 0; i < rs.n; i++ {
		xInv := gfPow(rs.alpha, fieldOrder-i)
		if polyEval(errLoc, xInv) == 0 {
			positions = append(positions, i)
		}
	}
	return positions
}

func (rs *ReedSolomon) forney(syndromes, errLoc []byte, positions []int) ([]byte, error) {
	product := polyMul(syndromes, errLoc)
	truncate := rs.n - rs.k
	if truncate > len(product) {
		truncate = len(product)
	}
	omega := product[:truncate]
	// Formal derivative: only odd-index terms survive (characteristic 2).
	lamPrime := make([]byte, len(errLoc)-1)
	for i := 1; i < len(errLoc); i++ {
		if i%2 == 1 {
			lamPrime[i-1] = errLoc[i]
		}
	}
	mags := make([]byte, len(positions))
	for i, pos := range positions {
		xInv := gfPow(rs.alpha, fieldOrder-pos)
		xPos := gfPow(rs.alpha, pos)
		num := polyEval(omega, xInv)
		den := polyEval(lamPrime, xInv)
		if den == 0 {
			return nil, errors.New("reed-solomon: Forney denominator is zero")
		}
		mags[i] = gfMul(xPos, gfDiv(num, den))
	}
	return mags, nil
}

func main() {
	rs, _ := NewReedSolomon(15, 11, 3)
	msg := []byte("Hello DSA!!")
	cw, _ := rs.Encode(msg)
	fmt.Printf("Codeword: %v\n", cw)
	corrupted := append([]byte(nil), cw...)
	corrupted[3] ^= 0x99
	corrupted[12] ^= 0xFF
	recovered, err := rs.Decode(corrupted)
	if err != nil {
		fmt.Println("decode error:", err)
		return
	}
	fmt.Printf("Recovered: %s\n", string(recovered))
}
