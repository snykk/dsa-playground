package main

import (
	"errors"
	"math/rand"
	"reflect"
	"strings"
	"testing"
)

// The pinned values were computed by the Python implementation (string_hashing.py). The
// queries are checked against brute force on random strings from math/rand with fixed seeds.

// definitionHash is sum of c_i * base^(m-1-i) mod mod, term by term: independent of Horner's rule.
func definitionHash(t string, base, mod uint64) uint64 {
	var sum uint64
	m := len(t)
	for i := 0; i < m; i++ {
		p := 1 % mod
		for e := 0; e < m-1-i; e++ {
			p = p * base % mod
		}
		sum = (sum + uint64(t[i])*p) % mod
	}
	return sum
}

func naiveLCP(s string, i, j int) int {
	k := 0
	for i+k < len(s) && j+k < len(s) && s[i+k] == s[j+k] {
		k++
	}
	return k
}

func randomString(rng *rand.Rand, alphabet string, lo, hi int) string {
	n := lo + rng.Intn(hi-lo+1)
	b := make([]byte, n)
	for k := range b {
		b[k] = alphabet[rng.Intn(len(alphabet))]
	}
	return string(b)
}

func mustHash(t *testing.T, s string, base, mod uint64) *PolynomialHash {
	t.Helper()
	h, err := NewPolynomialHash(s, base, mod)
	if err != nil {
		t.Fatalf("NewPolynomialHash(%q, %d, %d): %v", s, base, mod, err)
	}
	return h
}

func expectPanic(t *testing.T, what string, f func()) {
	t.Helper()
	defer func() {
		if recover() == nil {
			t.Errorf("%s did not panic", what)
		}
	}()
	f()
}

var params = [][2]uint64{{Base1, Mod1}, {Base2, Mod2}, {MaxMod - 1, MaxMod}, {31, 97}, {31, 101}, {2, 3}, {1, 2}}

func TestMississippiTables(t *testing.T) {
	h := mustHash(t, "mississippi", 31, 97)
	if got, want := h.Prefix(), []uint64{0, 12, 89, 61, 66, 17, 60, 35, 26, 45, 52, 68}; !reflect.DeepEqual(got, want) {
		t.Errorf("Prefix() = %v, want %v", got, want)
	}
	if got, want := h.Power(), []uint64{1, 31, 88, 12, 81, 86, 47, 2, 62, 79, 24, 65}; !reflect.DeepEqual(got, want) {
		t.Errorf("Power() = %v, want %v", got, want)
	}
	if h.Get(1, 5) != 15 || h.Get(4, 8) != 15 || h.Get(0, 11) != 68 {
		t.Errorf("Get = %d, %d, %d, want 15, 15, 68", h.Get(1, 5), h.Get(4, 8), h.Get(0, 11))
	}
}

func TestDoubleHashValues(t *testing.T) {
	d := NewDoubleHash("mississippi")
	cases := []struct {
		l, r int
		want [2]uint64
	}{{0, 11, [2]uint64{788634571, 670713304}}, {1, 5, [2]uint64{883654281, 445652627}}, {4, 8, [2]uint64{883654281, 445652627}}, {0, 0, [2]uint64{0, 0}}}
	for _, c := range cases {
		if got := d.Get(c.l, c.r); got != c.want {
			t.Errorf("Get(%d, %d) = %v, want %v", c.l, c.r, got, c.want)
		}
	}
	if d.LCP(1, 4) != 4 || d.LCP(2, 5) != 3 || d.LCP(0, 11) != 0 {
		t.Errorf("LCP = %d, %d, %d, want 4, 3, 0", d.LCP(1, 4), d.LCP(2, 5), d.LCP(0, 11))
	}
	if d.Compare(1, 5, 4, 8) != 0 || d.Compare(0, 4, 1, 5) != 1 {
		t.Errorf("Compare = %d, %d, want 0, 1", d.Compare(1, 5, 4, 8), d.Compare(0, 4, 1, 5))
	}
	var distinct []int
	for k := 0; k <= 12; k++ {
		distinct = append(distinct, d.CountDistinct(k))
	}
	if want := []int{1, 4, 7, 7, 7, 7, 6, 5, 4, 3, 2, 1, 0}; !reflect.DeepEqual(distinct, want) {
		t.Errorf("CountDistinct(0..12) = %v, want %v", distinct, want)
	}
}

func TestLargestModulusValues(t *testing.T) {
	// mod = 2^32 and base = 2^32 - 1: the largest factors the code multiplies.
	h := mustHash(t, "mississippi", MaxMod-1, MaxMod)
	want := []uint64{0, 109, 4294967292, 119, 4294967292, 109, 6, 109, 4294967292, 116, 4294967292, 109}
	if got := h.Prefix(); !reflect.DeepEqual(got, want) {
		t.Errorf("Prefix() = %v, want %v", got, want)
	}
}

func TestEverySubstringAgainstTheDefinition(t *testing.T) {
	rng := rand.New(rand.NewSource(2))
	for trial := 0; trial < 40; trial++ {
		s := randomString(rng, "abcdefgh", 0, 20)
		n := len(s)
		for _, p := range params {
			h := mustHash(t, s, p[0], p[1])
			for l := 0; l <= n; l++ {
				for r := l; r <= n; r++ {
					want := definitionHash(s[l:r], p[0], p[1])
					if got := h.Get(l, r); got != want {
						t.Fatalf("%q base %d mod %d: Get(%d, %d) = %d, want %d", s, p[0], p[1], l, r, got, want)
					}
					if got, _ := PolynomialHashOf(s[l:r], p[0], p[1]); got != want {
						t.Fatalf("PolynomialHashOf(%q) = %d, want %d", s[l:r], got, want)
					}
				}
			}
		}
		d := NewDoubleHash(s)
		for l := 0; l <= n; l++ {
			for r := l; r <= n; r++ {
				want := [2]uint64{definitionHash(s[l:r], Base1, Mod1), definitionHash(s[l:r], Base2, Mod2)}
				if got := d.Get(l, r); got != want {
					t.Fatalf("DoubleHash(%q).Get(%d, %d) = %v, want %v", s, l, r, got, want)
				}
			}
		}
	}
}

func TestQueriesAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(5))
	alphabets := []string{"a", "ab", "abc", "abcd"}
	for trial := 0; trial < 250; trial++ {
		s := randomString(rng, alphabets[trial%len(alphabets)], 0, 24)
		n := len(s)
		d := NewDoubleHash(s)
		for i := 0; i <= n; i++ {
			for j := 0; j <= n; j++ {
				if got, want := d.LCP(i, j), naiveLCP(s, i, j); got != want {
					t.Fatalf("%q: LCP(%d, %d) = %d, want %d", s, i, j, got, want)
				}
				for length := 0; length <= n-max(i, j); length++ {
					if got, want := d.Equal(i, j, length), s[i:i+length] == s[j:j+length]; got != want {
						t.Fatalf("%q: Equal(%d, %d, %d) = %v, want %v", s, i, j, length, got, want)
					}
				}
			}
		}
		for q := 0; q < 50; q++ {
			l1 := rng.Intn(n + 1)
			r1 := l1 + rng.Intn(n-l1+1)
			l2 := rng.Intn(n + 1)
			r2 := l2 + rng.Intn(n-l2+1)
			if got, want := d.Compare(l1, r1, l2, r2), strings.Compare(s[l1:r1], s[l2:r2]); got != want {
				t.Fatalf("%q: Compare(%d, %d, %d, %d) = %d, want %d", s, l1, r1, l2, r2, got, want)
			}
		}
		for length := 0; length <= n+2; length++ {
			subs := map[string]bool{}
			for i := 0; i+length <= n; i++ {
				subs[s[i:i+length]] = true
			}
			if got := d.CountDistinct(length); got != len(subs) {
				t.Fatalf("%q: CountDistinct(%d) = %d, want %d", s, length, got, len(subs))
			}
		}
	}
}

func TestPolynomialHashQueries(t *testing.T) {
	rng := rand.New(rand.NewSource(8))
	for trial := 0; trial < 80; trial++ {
		s := randomString(rng, "abc", 0, 20)
		h := mustHash(t, s, Base1, Mod1)
		for i := 0; i <= len(s); i++ {
			for j := 0; j <= len(s); j++ {
				if got, want := h.LCP(i, j), naiveLCP(s, i, j); got != want {
					t.Fatalf("%q: LCP(%d, %d) = %d, want %d", s, i, j, got, want)
				}
			}
		}
	}
}

func TestEmptyString(t *testing.T) {
	h := mustHash(t, "", 31, 97)
	if !reflect.DeepEqual(h.Prefix(), []uint64{0}) || !reflect.DeepEqual(h.Power(), []uint64{1}) || h.Get(0, 0) != 0 {
		t.Errorf("empty tables: %v %v", h.Prefix(), h.Power())
	}
	d := NewDoubleHash("")
	if d.Len() != 0 || d.Get(0, 0) != [2]uint64{0, 0} || d.LCP(0, 0) != 0 || !d.Equal(0, 0, 0) || d.Compare(0, 0, 0, 0) != 0 {
		t.Error("empty string queries")
	}
	if d.CountDistinct(0) != 1 || d.CountDistinct(1) != 0 {
		t.Errorf("CountDistinct on \"\" = %d, %d, want 1, 0", d.CountDistinct(0), d.CountDistinct(1))
	}
}

func TestOneCharacter(t *testing.T) {
	if got := mustHash(t, "z", 31, 97).Get(0, 1); got != 25 {
		t.Errorf("Get(0, 1) = %d, want 25", got)
	}
	d := NewDoubleHash("z")
	if d.Get(0, 1) != [2]uint64{122, 122} || d.LCP(0, 0) != 1 || d.LCP(0, 1) != 0 {
		t.Error("one character: Get or LCP")
	}
	if d.Compare(0, 1, 0, 0) != 1 || d.Compare(0, 0, 0, 1) != -1 || d.CountDistinct(1) != 1 || d.CountDistinct(2) != 0 {
		t.Error("one character: Compare or CountDistinct")
	}
}

func TestAllCharactersEqual(t *testing.T) {
	const n = 50
	d := NewDoubleHash(strings.Repeat("a", n))
	for i := 0; i <= n; i++ {
		for j := 0; j <= n; j++ {
			if got := d.LCP(i, j); got != n-max(i, j) {
				t.Fatalf("LCP(%d, %d) = %d, want %d", i, j, got, n-max(i, j))
			}
		}
	}
	for length := 1; length <= n; length++ {
		if d.CountDistinct(length) != 1 {
			t.Fatalf("CountDistinct(%d) = %d, want 1", length, d.CountDistinct(length))
		}
	}
	if d.Compare(0, 3, 10, 12) != 1 || d.Compare(5, 7, 0, 2) != 0 {
		t.Error("Compare on equal characters")
	}
}

func TestBytesOutsideASCII(t *testing.T) {
	// "h" + U+00E9 + "llo" is 6 bytes in UTF-8; Python gives the same numbers for s.encode().
	s := "h\xc3\xa9llo"
	h := mustHash(t, s, 31, 97)
	if h.Len() != 6 {
		t.Errorf("Len() = %d, want 6", h.Len())
	}
	if got, want := h.Prefix(), []uint64{0, 7, 24, 40, 87, 89, 57}; !reflect.DeepEqual(got, want) {
		t.Errorf("Prefix() = %v, want %v", got, want)
	}
	if got := NewDoubleHash(s).Get(0, 6); got != [2]uint64{180144647, 254344828} {
		t.Errorf("DoubleHash.Get(0, 6) = %v", got)
	}
	// U+00E9 and U+00E8 share their lead byte 0xC3: the common prefix is one byte long.
	if got := NewDoubleHash("\xc3\xa9\xc3\xa8").LCP(0, 2); got != 1 {
		t.Errorf("LCP = %d, want 1", got)
	}
	if got := NewDoubleHash("z\xc3\xa9").Compare(1, 3, 0, 1); got != 1 {
		t.Errorf("Compare = %d, want 1 (0xC3 > 'z')", got)
	}
}

func TestLargestRanges(t *testing.T) {
	const n = 100000
	b := make([]byte, n)
	for i := range b {
		b[i] = byte('a' + (i*i+3*i)%26)
	}
	s := string(b)
	d := NewDoubleHash(s)
	if got := d.Get(0, n); got != [2]uint64{439513216, 315805692} {
		t.Errorf("Get(0, n) = %v", got)
	}
	if got := d.Get(12345, 99999); got != [2]uint64{239334980, 556481625} {
		t.Errorf("Get(12345, 99999) = %v", got)
	}
	if d.LCP(0, 0) != n || d.LCP(n, n) != 0 || d.Compare(0, n, 0, n) != 0 || d.CountDistinct(n) != 1 {
		t.Error("whole-string queries")
	}
	a := NewDoubleHash(strings.Repeat("a", n))
	if a.LCP(0, 1) != n-1 || a.Compare(0, n, 1, n) != 1 || a.CountDistinct(n/2) != 1 {
		t.Error("all-equal queries on 10^5 characters")
	}
}

func TestErrors(t *testing.T) {
	for _, p := range [][2]uint64{{1, 1}, {1, 0}, {1, MaxMod + 1}, {0, 97}, {97, 97}} {
		if _, err := NewPolynomialHash("abc", p[0], p[1]); !errors.Is(err, ErrBadParameters) {
			t.Errorf("NewPolynomialHash base %d mod %d: err = %v", p[0], p[1], err)
		}
		if _, err := PolynomialHashOf("abc", p[0], p[1]); !errors.Is(err, ErrBadParameters) {
			t.Errorf("PolynomialHashOf base %d mod %d: err = %v", p[0], p[1], err)
		}
	}
	h := mustHash(t, "abcd", 31, 97)
	d := NewDoubleHash("abcd")
	for _, r := range [][2]int{{-1, 2}, {3, 2}, {0, 5}, {5, 5}} {
		expectPanic(t, "Get", func() { h.Get(r[0], r[1]) })
		expectPanic(t, "DoubleHash.Get", func() { d.Get(r[0], r[1]) })
		expectPanic(t, "Compare", func() { d.Compare(r[0], r[1], 0, 1) })
	}
	expectPanic(t, "Equal past the end", func() { d.Equal(1, 2, 3) })
	expectPanic(t, "Equal at -1", func() { d.Equal(-1, 0, 1) })
	expectPanic(t, "Equal with a negative length", func() { d.Equal(0, 0, -1) })
	expectPanic(t, "LCP past the end", func() { d.LCP(5, 0) })
	expectPanic(t, "LCP at -1", func() { h.LCP(0, -1) })
	expectPanic(t, "CountDistinct(-1)", func() { d.CountDistinct(-1) })
	expectPanic(t, "ThueMorsePair(-1)", func() { ThueMorsePair(-1) })
	expectPanic(t, "ThueMorsePair(31)", func() { ThueMorsePair(31) })
}

func TestSmallModulusCollisions(t *testing.T) {
	// base 31, mod 101: "abra" and "brac" share hash 57, so one distinct count is wrong.
	h := mustHash(t, "abracadabra", 31, 101)
	if h.Get(0, 4) != 57 || h.Get(1, 5) != 57 || h.CountDistinct(4) != 6 {
		t.Errorf("mod 101: Get = %d, %d, CountDistinct(4) = %d", h.Get(0, 4), h.Get(1, 5), h.CountDistinct(4))
	}
	if NewDoubleHash("abracadabra").CountDistinct(4) != 7 {
		t.Error("DoubleHash CountDistinct(4) != 7")
	}
	// base 7, mod 11: "abra" and "cada" collide, and the binary search reports 4, not 0.
	if got := mustHash(t, "abracadabra", 7, 11).LCP(0, 4); got != 4 {
		t.Errorf("mod 11 LCP(0, 4) = %d, want the wrong answer 4", got)
	}
	if got := NewDoubleHash("abracadabra").LCP(0, 4); got != 0 {
		t.Errorf("DoubleHash LCP(0, 4) = %d, want 0", got)
	}
}

func TestOnePairHasAtMostNMinus1BadBases(t *testing.T) {
	rng := rand.New(rand.NewSource(9))
	const mod = 1009
	for trial := 0; trial < 100; trial++ {
		n := 1 + rng.Intn(10)
		x := randomString(rng, "ab", n, n)
		y := randomString(rng, "ab", n, n)
		if x == y {
			continue
		}
		bad := 0
		for b := uint64(1); b < mod; b++ {
			hx, _ := PolynomialHashOf(x, b, mod)
			hy, _ := PolynomialHashOf(y, b, mod)
			if hx == hy {
				bad++
			}
		}
		if bad > n-1 {
			t.Fatalf("%q and %q collide for %d bases, more than n - 1 = %d", x, y, bad, n-1)
		}
	}
}

func TestThueMorseBreaksHashingModulo2To64(t *testing.T) {
	a, b := ThueMorsePair(10)
	if len(a) != 1024 || a == b {
		t.Fatal("ThueMorsePair(10)")
	}
	if s3, t3 := ThueMorsePair(3); s3 != "abbabaab" || t3 != "baababba" {
		t.Errorf("ThueMorsePair(3) = %q, %q", s3, t3)
	}
	rng := rand.New(rand.NewSource(11))
	bases := []uint64{1, 3, 31, 131, Base1, Base2, ^uint64(0)}
	for k := 0; k < 200; k++ {
		bases = append(bases, rng.Uint64()|1)
	}
	for _, base := range bases {
		if OverflowHash(a, base) != OverflowHash(b, base) {
			t.Fatalf("odd base %d: the Thue-Morse pair does not collide", base)
		}
	}
	if got := OverflowHash("abracadabra", 131); got != 6494918133703025106 {
		t.Errorf("OverflowHash(abracadabra, 131) = %d", got)
	}
	if NewDoubleHash(a).Get(0, 1024) == NewDoubleHash(b).Get(0, 1024) {
		t.Error("DoubleHash does not tell the Thue-Morse pair apart")
	}
	// Length 512 is not enough for every base.
	a9, b9 := ThueMorsePair(9)
	if OverflowHash(a9, 3) == OverflowHash(b9, 3) {
		t.Error("length 512 collides for base 3")
	}
}

func TestEvenBaseKeepsOnlyTheLast64Characters(t *testing.T) {
	x := "x" + strings.Repeat("a", 64)
	y := "y" + strings.Repeat("a", 64)
	for _, base := range []uint64{2, 256, 1000, 1 << 32} {
		if OverflowHash(x, base) != OverflowHash(y, base) {
			t.Errorf("even base %d: no collision", base)
		}
	}
	if OverflowHash(x, 131) == OverflowHash(y, 131) {
		t.Error("base 131 collides")
	}
}
