// Package main implements Reed-Solomon error correction over GF(2^8).
//
// Includes systematic encode and Berlekamp-Massey + Forney + Chien decode,
// with combined error + erasure decoding (e + 2v <= n - k) and a configurable
// first consecutive root (fcr). Uses primitive element alpha = 3 (true
// primitive of GF(2^8) under 0x11B); alpha = 2 has multiplicative order 51,
// not 255, and fails to decode codewords longer than 51 bytes, even with a
// single error.
//
// For brevity, a minimal GF(2^8) lives in this file. The sibling
// ../Galois_Field/Go package implements the same operations and agrees
// byte-for-byte.
package main

import (
	"errors"
	"fmt"
	"sort"
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

// ErrDecode is returned (possibly wrapped; test with errors.Is) when the damage
// exceeds the correction budget e + 2v <= n - k.
var ErrDecode = errors.New("reed-solomon: decode failed (too many errors)")

// ReedSolomon is an (n, k) Reed-Solomon code over GF(2^8).
type ReedSolomon struct {
	n, k, t   int
	alpha     byte
	fcr       int
	generator []byte
}

// NewReedSolomon builds an (n, k) code with the given primitive element and
// fcr = 0. alpha = 3 is the recommended primitive of GF(2^8) under Rijndael 0x11B.
func NewReedSolomon(n, k int, alpha byte) (*ReedSolomon, error) {
	return NewReedSolomonWithFCR(n, k, alpha, 0)
}

// NewReedSolomonWithFCR builds an (n, k) code whose generator roots are
// alpha^fcr .. alpha^(fcr+n-k-1). fcr is the "first consecutive root"; encoder
// and decoder must agree on it (QR codes use 0, narrow-sense textbook codes 1).
func NewReedSolomonWithFCR(n, k int, alpha byte, fcr int) (*ReedSolomon, error) {
	if !(0 < k && k < n) {
		return nil, fmt.Errorf("need 0 < k < n; got k=%d n=%d", k, n)
	}
	if n > 255 {
		return nil, errors.New("n must be <= 255 for GF(2^8)")
	}
	rs := &ReedSolomon{n: n, k: k, alpha: alpha, t: (n - k) / 2, fcr: fcr}
	rs.generator = rs.buildGenerator()
	return rs, nil
}

// N returns the codeword length.
func (rs *ReedSolomon) N() int { return rs.n }

// K returns the message length.
func (rs *ReedSolomon) K() int { return rs.k }

// T returns the max correctable errors at unknown positions (no erasures).
func (rs *ReedSolomon) T() int { return rs.t }

// FCR returns the first consecutive root of the generator polynomial.
func (rs *ReedSolomon) FCR() int { return rs.fcr }

// Alpha returns the primitive element the code is built on.
func (rs *ReedSolomon) Alpha() byte { return rs.alpha }

// expMod reduces an exponent mod 255. Every element's order divides 255, so
// alpha^x depends only on x mod 255; reducing keeps products small. fcr is
// reduced before anything is added to it, so even math.MaxInt64 cannot wrap.
func expMod(x int) int {
	return ((x % fieldOrder) + fieldOrder) % fieldOrder
}

func (rs *ReedSolomon) buildGenerator() []byte {
	g := []byte{1}
	for i := 0; i < rs.n-rs.k; i++ {
		// (x - alpha^(fcr+i)) = (alpha^(fcr+i) + x) in characteristic 2.
		g = polyMul(g, []byte{gfPow(rs.alpha, expMod(expMod(rs.fcr)+i)), 1})
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

// Decode recovers the k-byte message from a (possibly corrupted) codeword
// when the bad positions are unknown. Returns ErrDecode if more than t errors
// are present.
func (rs *ReedSolomon) Decode(received []byte) ([]byte, error) {
	return rs.DecodeWithErasures(received, nil)
}

// DecodeWithErasures recovers the k-byte message given the positions known to
// be wrong (erasures; duplicates are ignored). Each erasure costs one parity
// byte instead of two, so decoding succeeds when e + 2v <= n - k (e erasures,
// v errors at unknown positions). Returns a wrapped ErrDecode when the damage
// exceeds that budget, and a plain error for malformed input.
func (rs *ReedSolomon) DecodeWithErasures(received []byte, erasures []int) ([]byte, error) {
	if len(received) != rs.n {
		return nil, fmt.Errorf("received must have %d bytes; got %d", rs.n, len(received))
	}
	erased := append([]int(nil), erasures...)
	sort.Ints(erased)
	unique := erased[:0]
	for i, p := range erased {
		if p < 0 || p >= rs.n {
			return nil, fmt.Errorf("erasure position %d out of range [0, %d)", p, rs.n)
		}
		if i == 0 || p != erased[i-1] {
			unique = append(unique, p)
		}
	}
	erased = unique
	e := len(erased)
	if e > rs.n-rs.k {
		return nil, fmt.Errorf("%w: too many erasures (%d > n - k = %d)", ErrDecode, e, rs.n-rs.k)
	}

	// Step 1: Syndromes. All zero and nothing declared erased -> clean.
	syndromes := rs.computeSyndromes(received)
	allZero := true
	for _, s := range syndromes {
		if s != 0 {
			allZero = false
			break
		}
	}
	if allZero && e == 0 {
		out := make([]byte, rs.k)
		copy(out, received[rs.n-rs.k:])
		return out, nil
	}

	// Step 2: Erasure locator Gamma(x) = prod (1 + alpha^p x), low-degree-first.
	gamma := []byte{1}
	for _, p := range erased {
		gamma = polyMul(gamma, []byte{1, gfPow(rs.alpha, p)})
	}

	// Step 3: Berlekamp-Massey seeded with Gamma(x) returns the combined
	// locator Phi(x) = Lambda(x) * Gamma(x) for known + unknown positions.
	locator := rs.berlekampMassey(syndromes, gamma, e)

	// Step 4: Chien search. A locator of degree d must have exactly d roots
	// inside the codeword; anything else means the budget was exceeded.
	positions := rs.findErrorPositions(locator)
	if len(positions) != len(locator)-1 {
		return nil, ErrDecode
	}

	// Step 5: Forney magnitudes, then apply the corrections.
	mags, err := rs.forney(syndromes, locator, positions)
	if err != nil {
		return nil, err
	}
	corrected := make([]byte, rs.n)
	copy(corrected, received)
	for i, p := range positions {
		corrected[p] ^= mags[i]
	}

	// Step 6: Verify -- all syndromes of the corrected codeword must vanish.
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
		out[i] = polyEval(r, gfPow(rs.alpha, expMod(expMod(rs.fcr)+i)))
	}
	return out
}

// berlekampMassey is the classical L-tracking form with low-degree-first
// storage. Seeded with the erasure locator Gamma(x) of degree eraseCount (just
// {1} without erasures), it starts at syndrome index eraseCount and returns the
// combined locator Phi(x) = Lambda(x) * Gamma(x). The length-change test
// 2L <= r + e is the classical 2L <= r shifted by the e roots Gamma supplies.
func (rs *ReedSolomon) berlekampMassey(syndromes, gamma []byte, eraseCount int) []byte {
	lam := append([]byte(nil), gamma...)
	prev := append([]byte(nil), gamma...)
	L := eraseCount
	m := 1
	b := byte(1)
	for r := eraseCount; r < len(syndromes); r++ {
		delta := syndromes[r]
		for i := 1; i <= L; i++ {
			if i < len(lam) && lam[i] != 0 {
				delta ^= gfMul(lam[i], syndromes[r-i])
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
		if 2*L <= r+eraseCount {
			prev = lam
			lam = newLam
			L = r + 1 + eraseCount - L
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

func (rs *ReedSolomon) findErrorPositions(locator []byte) []int {
	var positions []int
	for i := 0; i < rs.n; i++ {
		xInv := gfPow(rs.alpha, fieldOrder-i)
		if polyEval(locator, xInv) == 0 {
			positions = append(positions, i)
		}
	}
	return positions
}

// forney computes e_j = X_j^(1-fcr) * Omega(X_j^-1) / Lambda'(X_j^-1), X_j = alpha^pos.
// The textbook formula's leading minus sign vanishes in characteristic 2.
func (rs *ReedSolomon) forney(syndromes, locator []byte, positions []int) ([]byte, error) {
	product := polyMul(syndromes, locator)
	truncate := rs.n - rs.k
	if truncate > len(product) {
		truncate = len(product)
	}
	omega := product[:truncate]
	// Formal derivative: only odd-index terms survive (characteristic 2).
	lamPrime := make([]byte, len(locator)-1)
	for i := 1; i < len(locator); i++ {
		if i%2 == 1 {
			lamPrime[i-1] = locator[i]
		}
	}
	fcrTerm := expMod(1 - expMod(rs.fcr))
	mags := make([]byte, len(positions))
	for i, pos := range positions {
		xInv := gfPow(rs.alpha, fieldOrder-pos)
		num := polyEval(omega, xInv)
		den := polyEval(lamPrime, xInv)
		if den == 0 {
			return nil, fmt.Errorf("%w: Forney denominator is zero", ErrDecode)
		}
		// X_j^(1 - fcr): X_j when fcr = 0, 1 when fcr = 1.
		xFactor := gfPow(rs.alpha, expMod(pos*fcrTerm))
		mags[i] = gfMul(xFactor, gfDiv(num, den))
	}
	return mags, nil
}

func main() {
	// Demo 1: classic errors-only decode.
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
	fmt.Printf("Errors-only recovered: %s\n", string(recovered))

	// Demo 2: RS(15, 7) has 8 parity bytes; 4 erasures + 2 errors fit e + 2v <= 8.
	rs2, _ := NewReedSolomon(15, 7, 3)
	cw2, _ := rs2.Encode([]byte("ABCDEFG"))
	erasures := []int{0, 1, 2, 3}
	for _, p := range erasures {
		cw2[p] = 0xFF
	}
	cw2[7] ^= 0xAA
	cw2[11] ^= 0x55
	recovered2, err := rs2.DecodeWithErasures(cw2, erasures)
	if err != nil {
		fmt.Println("decode error:", err)
		return
	}
	fmt.Printf("Erasure+error recovered: %s\n", string(recovered2))
}
