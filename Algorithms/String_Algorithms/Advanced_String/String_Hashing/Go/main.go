// String hashing: polynomial prefix hashes, the hash of any substring in O(1), and the
// queries built on it (equality, the longest common prefix of two suffixes by binary search,
// the order of two substrings, distinct substrings of one length).
//
// A polynomial hash reads a string c_0 c_1 ... c_(m-1) as a number in base B, modulo M:
//
//	hash = (c_0 * B^(m-1) + c_1 * B^(m-2) + ... + c_(m-1)) mod M
//
// Characters are the bytes of the Go string (0..255), so UTF-8 text is hashed byte by byte
// and positions are byte offsets. The Python version gives the same numbers for the same bytes.
package main

import (
	"errors"
	"fmt"
	"math/bits"
)

// MaxMod is the largest modulus NewPolynomialHash accepts. With mod <= 2^32 every hash and
// power is below 2^32, so the product of two of them is at most (2^32 - 1)^2 < 2^64 and fits
// in a uint64: no multiplication can overflow.
const MaxMod uint64 = 1 << 32

// The two fixed (base, modulus) pairs of DoubleHash.
const (
	Mod1  uint64 = 1_000_000_007
	Base1 uint64 = 911_382_323
	Mod2  uint64 = 998_244_353
	Base2 uint64 = 972_663_749
)

// ErrBadParameters is wrapped by the error NewPolynomialHash and PolynomialHashOf return for a
// modulus outside 2..2^32 or a base outside 1..mod-1.
var ErrBadParameters = errors.New("bad base or modulus")

func checkParameters(base, mod uint64) error {
	if mod < 2 || mod > MaxMod {
		return fmt.Errorf("mod %d is outside 2..2^32: %w", mod, ErrBadParameters)
	}
	if base < 1 || base >= mod {
		return fmt.Errorf("base %d is outside 1..%d: %w", base, mod-1, ErrBadParameters)
	}
	return nil
}

// PolynomialHash holds the prefix hashes and powers of one string for one (base, mod) pair.
type PolynomialHash struct {
	text   string
	base   uint64
	mod    uint64
	prefix []uint64 // prefix[i] is the hash of text[:i]
	power  []uint64 // power[i] is base^i mod mod
}

// NewPolynomialHash builds the tables in O(n). It returns an error wrapping ErrBadParameters
// unless 2 <= mod <= 2^32 and 1 <= base < mod.
func NewPolynomialHash(s string, base, mod uint64) (*PolynomialHash, error) {
	if err := checkParameters(base, mod); err != nil {
		return nil, err
	}
	n := len(s)
	h := &PolynomialHash{text: s, base: base, mod: mod, prefix: make([]uint64, n+1), power: make([]uint64, n+1)}
	h.power[0] = 1
	for i := 0; i < n; i++ {
		// Horner's rule. prefix[i] * base < 2^64 because both are below mod <= 2^32.
		h.prefix[i+1] = (h.prefix[i]*base%mod + uint64(s[i])) % mod
		h.power[i+1] = h.power[i] * base % mod
	}
	return h, nil
}

// Len is the length of the string in bytes.
func (h *PolynomialHash) Len() int { return len(h.text) }

// Prefix returns a copy of the prefix hashes (length n + 1).
func (h *PolynomialHash) Prefix() []uint64 { return append([]uint64(nil), h.prefix...) }

// Power returns a copy of the powers of the base (length n + 1).
func (h *PolynomialHash) Power() []uint64 { return append([]uint64(nil), h.power...) }

// Get returns the hash of text[l:r] in O(1). It panics unless 0 <= l <= r <= n.
func (h *PolynomialHash) Get(l, r int) uint64 {
	checkRange(len(h.text), l, r)
	shifted := h.prefix[l] * h.power[r-l] % h.mod
	// Add mod before subtracting: unsigned values must not go below zero.
	return (h.prefix[r] + h.mod - shifted) % h.mod
}

func (h *PolynomialHash) byteAt(i int) byte { return h.text[i] }

// Equal reports whether text[i:i+length] == text[j:j+length], by two hashes: O(1).
func (h *PolynomialHash) Equal(i, j, length int) bool { return equalOf[uint64](h, i, j, length) }

// LCP is the length of the longest common prefix of text[i:] and text[j:]: O(log n).
func (h *PolynomialHash) LCP(i, j int) int { return lcpOf[uint64](h, i, j) }

// Compare returns -1, 0 or 1 as text[l1:r1] is smaller than, equal to or larger than
// text[l2:r2], byte by byte: O(log n).
func (h *PolynomialHash) Compare(l1, r1, l2, r2 int) int { return compareOf[uint64](h, l1, r1, l2, r2) }

// CountDistinct is the number of distinct substrings of the given length: O(n) expected.
func (h *PolynomialHash) CountDistinct(length int) int { return countDistinctOf[uint64](h, length) }

// DoubleHash combines the pairs (Base1, Mod1) and (Base2, Mod2); a substring's hash is the pair.
type DoubleHash struct {
	first  *PolynomialHash
	second *PolynomialHash
}

// NewDoubleHash builds both tables in O(n).
func NewDoubleHash(s string) *DoubleHash {
	first, err1 := NewPolynomialHash(s, Base1, Mod1)
	second, err2 := NewPolynomialHash(s, Base2, Mod2)
	if err1 != nil || err2 != nil {
		panic("the fixed parameters are valid")
	}
	return &DoubleHash{first: first, second: second}
}

// Len is the length of the string in bytes.
func (d *DoubleHash) Len() int { return d.first.Len() }

// First is the hash with (Base1, Mod1).
func (d *DoubleHash) First() *PolynomialHash { return d.first }

// Second is the hash with (Base2, Mod2).
func (d *DoubleHash) Second() *PolynomialHash { return d.second }

// Get returns the pair of hashes of text[l:r] in O(1). It panics unless 0 <= l <= r <= n.
func (d *DoubleHash) Get(l, r int) [2]uint64 { return [2]uint64{d.first.Get(l, r), d.second.Get(l, r)} }

func (d *DoubleHash) byteAt(i int) byte { return d.first.text[i] }

// Equal reports whether text[i:i+length] == text[j:j+length]: O(1).
func (d *DoubleHash) Equal(i, j, length int) bool { return equalOf[[2]uint64](d, i, j, length) }

// LCP is the length of the longest common prefix of text[i:] and text[j:]: O(log n).
func (d *DoubleHash) LCP(i, j int) int { return lcpOf[[2]uint64](d, i, j) }

// Compare returns -1, 0 or 1 as text[l1:r1] is smaller than, equal to or larger than text[l2:r2].
func (d *DoubleHash) Compare(l1, r1, l2, r2 int) int {
	return compareOf[[2]uint64](d, l1, r1, l2, r2)
}

// CountDistinct is the number of distinct substrings of the given length: O(n) expected.
func (d *DoubleHash) CountDistinct(length int) int { return countDistinctOf[[2]uint64](d, length) }

// substringHasher is what the queries need: a hash for every range, the length and the bytes.
type substringHasher[K comparable] interface {
	Get(l, r int) K
	Len() int
	byteAt(i int) byte
}

func checkRange(n, l, r int) {
	if l < 0 || l > r || r > n {
		panic(fmt.Sprintf("string hashing: [%d, %d) is not a range of 0..%d", l, r, n))
	}
}

func equalOf[K comparable](h substringHasher[K], i, j, length int) bool {
	if length < 0 {
		panic(fmt.Sprintf("string hashing: length %d is negative", length))
	}
	checkRange(h.Len(), i, i+length)
	checkRange(h.Len(), j, j+length)
	return h.Get(i, i+length) == h.Get(j, j+length)
}

// boundedLCP is the largest k <= limit with equal hashes of text[i:i+k] and text[j:j+k].
func boundedLCP[K comparable](h substringHasher[K], i, j, limit int) int {
	lo, hi := 0, limit
	// Invariant: the prefixes of length lo agree, and none longer than hi can.
	for lo < hi {
		mid := lo + (hi-lo+1)/2
		if h.Get(i, i+mid) == h.Get(j, j+mid) {
			lo = mid
		} else {
			hi = mid - 1
		}
	}
	return lo
}

func lcpOf[K comparable](h substringHasher[K], i, j int) int {
	n := h.Len()
	checkRange(n, i, n)
	checkRange(n, j, n)
	return boundedLCP(h, i, j, min(n-i, n-j))
}

func compareOf[K comparable](h substringHasher[K], l1, r1, l2, r2 int) int {
	checkRange(h.Len(), l1, r1)
	checkRange(h.Len(), l2, r2)
	len1, len2 := r1-l1, r2-l2
	shorter := min(len1, len2)
	k := boundedLCP(h, l1, l2, shorter)
	if k == shorter {
		switch {
		case len1 < len2:
			return -1
		case len1 > len2:
			return 1
		}
		return 0
	}
	if h.byteAt(l1+k) < h.byteAt(l2+k) {
		return -1
	}
	return 1
}

func countDistinctOf[K comparable](h substringHasher[K], length int) int {
	if length < 0 {
		panic(fmt.Sprintf("string hashing: length %d is negative", length))
	}
	seen := make(map[K]struct{})
	for i := 0; i+length <= h.Len(); i++ {
		seen[h.Get(i, i+length)] = struct{}{}
	}
	return len(seen)
}

// PolynomialHashOf hashes a whole string by Horner's rule, without a table: O(m).
func PolynomialHashOf(s string, base, mod uint64) (uint64, error) {
	if err := checkParameters(base, mod); err != nil {
		return 0, err
	}
	var h uint64
	for i := 0; i < len(s); i++ {
		h = (h*base%mod + uint64(s[i])) % mod
	}
	return h, nil
}

// OverflowHash is the polynomial hash modulo 2^64, by letting uint64 arithmetic wrap around.
// Do not use it: ThueMorsePair(10) collides for every odd base, and for an even base
// base^64 is a multiple of 2^64, so only the last 64 bytes count.
func OverflowHash(s string, base uint64) uint64 {
	var h uint64
	for i := 0; i < len(s); i++ {
		h = h*base + uint64(s[i])
	}
	return h
}

// ThueMorsePair returns the Thue-Morse string of length 2^k over "ab" and its complement.
// It panics unless 0 <= k <= 30.
func ThueMorsePair(k int) (string, string) {
	if k < 0 || k > 30 {
		panic(fmt.Sprintf("string hashing: k = %d is outside 0..30", k))
	}
	n := 1 << k
	s := make([]byte, n)
	t := make([]byte, n)
	for i := 0; i < n; i++ {
		if bits.OnesCount(uint(i))%2 == 1 {
			s[i], t[i] = 'b', 'a'
		} else {
			s[i], t[i] = 'a', 'b'
		}
	}
	return string(s), string(t)
}

func main() {
	s := "mississippi"
	small, _ := NewPolynomialHash(s, 31, 97)
	fmt.Printf("s = %q, base 31, mod 97\nprefix: %v\npower:  %v\n", s, small.Prefix(), small.Power())
	fmt.Println("hash of s[1:5] =", small.Get(1, 5), "and of s[4:8] =", small.Get(4, 8))

	d := NewDoubleHash(s)
	fmt.Println("DoubleHash of s[1:5]:", d.Get(1, 5))
	fmt.Println("Equal(1, 4, 4) =", d.Equal(1, 4, 4), " LCP(1, 4) =", d.LCP(1, 4), " Compare(0, 4, 1, 5) =", d.Compare(0, 4, 1, 5))
	counts := make([]int, 0, len(s))
	for k := 1; k <= len(s); k++ {
		counts = append(counts, d.CountDistinct(k))
	}
	fmt.Println("distinct substrings of length 1..11:", counts)

	a, b := ThueMorsePair(10)
	for _, base := range []uint64{3, 31, 131, Base1} {
		fmt.Printf("Thue-Morse, length 1024, base %d: OverflowHash equal = %v\n", base, OverflowHash(a, base) == OverflowHash(b, base))
	}
	fmt.Println("DoubleHash tells them apart:", NewDoubleHash(a).Get(0, 1024) != NewDoubleHash(b).Get(0, 1024))
}
