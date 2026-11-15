package main

import (
	"math"
	"math/rand"
	"reflect"
	"strings"
	"testing"
)

// "hello world" with U+00E9 for the e and U+00F6 for the o, written with UTF-8
// byte escapes to keep the source ASCII.
const accented = "h\xc3\xa9llo w\xc3\xb6rld"

// internalSum is the sum of the internal node frequencies: the cost of the tree in bits.
func internalSum(node *HuffmanNode) int {
	if node == nil || node.isLeaf() {
		return 0
	}
	return node.Freq + internalSum(node.Left) + internalSum(node.Right)
}

func isPrefixFree(codes map[rune]string) bool {
	for a, codeA := range codes {
		for b, codeB := range codes {
			if a != b && strings.HasPrefix(codeB, codeA) {
				return false
			}
		}
	}
	return true
}

func TestHuffmanRoundTrip(t *testing.T) {
	for _, text := range []string{"hello", "aaaa", "aaaabbbb", "abcdef", "ab", accented} {
		encoded, _, tree := HuffmanEncode(text)
		if got := HuffmanDecode(encoded, tree); got != text {
			t.Errorf("decode(encode(%q)) = %q", text, got)
		}
	}
}

func TestHuffmanEmptyString(t *testing.T) {
	encoded, codes, tree := HuffmanEncode("")
	if encoded != "" || codes == nil || len(codes) != 0 || tree != nil {
		t.Errorf("got (%q, %v, %v), want (\"\", empty map, nil)", encoded, codes, tree)
	}
	if BuildHuffmanTree("") != nil {
		t.Error("BuildHuffmanTree(\"\") should be nil")
	}
}

func TestHuffmanCompressionRatio(t *testing.T) {
	text := "aaaaabbbcc"
	encoded, codes, _ := HuffmanEncode(text)
	ratio, savings := CalculateCompressionRatio(text, encoded, codes)
	// Frequencies 5, 3, 2 give an optimal cost of 5 + 10 = 15 bits, out of 80.
	if len(encoded) != 15 {
		t.Errorf("encoded length %d, want 15", len(encoded))
	}
	if math.Abs(ratio-15.0/80) > 1e-12 || math.Abs(savings-(1-15.0/80)*100) > 1e-9 {
		t.Errorf("got ratio %v and savings %v", ratio, savings)
	}
}

func TestHuffmanKnownCodeTable(t *testing.T) {
	// Frequencies 45, 13, 12, 16, 9, 5 have no ties, so the tree is unique.
	text := strings.Repeat("a", 45) + strings.Repeat("b", 13) + strings.Repeat("c", 12) +
		strings.Repeat("d", 16) + strings.Repeat("e", 9) + strings.Repeat("f", 5)
	encoded, codes, tree := HuffmanEncode(text)
	want := map[rune]string{'a': "0", 'c': "100", 'b': "101", 'f': "1100", 'e': "1101", 'd': "111"}
	if !reflect.DeepEqual(codes, want) {
		t.Errorf("codes = %v, want %v", codes, want)
	}
	if len(encoded) != 224 {
		t.Errorf("encoded length %d, want 224", len(encoded))
	}
	if HuffmanDecode(encoded, tree) != text {
		t.Error("round trip failed")
	}
}

func TestHuffmanSingleSymbolGetsCodeZero(t *testing.T) {
	// One distinct symbol: its code is "0", one bit per character.
	encoded, codes, _ := HuffmanEncode("aaaa")
	if !reflect.DeepEqual(codes, map[rune]string{'a': "0"}) || encoded != "0000" {
		t.Errorf("got (%q, %v), want (\"0000\", map[a:0])", encoded, codes)
	}
}

func TestHuffmanCodesArePrefixFreeAndOptimal(t *testing.T) {
	// No code is a prefix of another; the length equals the sum of the
	// internal node frequencies (the cost of an optimal Huffman tree).
	for _, text := range []string{"hello", "abracadabra", "mississippi", strings.Repeat("abcdefgh", 3), accented} {
		encoded, codes, tree := HuffmanEncode(text)
		if !isPrefixFree(codes) {
			t.Errorf("%q: codes %v are not prefix-free", text, codes)
		}
		if len(codes) > 1 && len(encoded) != internalSum(tree) {
			t.Errorf("%q: encoded length %d, internal sum %d", text, len(encoded), internalSum(tree))
		}
		if HuffmanDecode(encoded, tree) != text {
			t.Errorf("%q: round trip failed", text)
		}
	}
}

func TestHuffmanDecodeEmptyInputs(t *testing.T) {
	if got := HuffmanDecode("0101", nil); got != "" {
		t.Errorf("nil tree: got %q", got)
	}
	_, _, tree := HuffmanEncode("ab")
	if got := HuffmanDecode("", tree); got != "" {
		t.Errorf("no bits: got %q", got)
	}
}

// Code tables, encodings and ratios printed by the Python huffman_encode and
// calculate_compression_ratio. Tied frequencies are resolved by the heap
// order, which these pin down: in "aabbccdd" a and c are merged first, so b
// gets 10 and c gets 01.
func TestHuffmanAgreesWithPython(t *testing.T) {
	tests := []struct {
		text    string
		codes   map[rune]string
		encoded string
		ratio   float64
		savings float64
	}{
		{"aabbccdd", map[rune]string{'a': "00", 'b': "10", 'c': "01", 'd': "11"}, "0000101001011111", 0.25, 75.0},
		{"abracadabra", map[rune]string{'a': "0", 'b': "111", 'c': "100", 'd': "101", 'r': "110"},
			"01111100100010101111100", 0.26136363636363635, 73.86363636363636},
		{"hello", map[rune]string{'e': "01", 'h': "00", 'l': "11", 'o': "10"}, "0001111110", 0.25, 75.0},
		{"mississippi", map[rune]string{'i': "0", 'm': "100", 'p': "101", 's': "11"},
			"100011110111101011010", 0.23863636363636365, 76.13636363636364},
		{"abcdefghabcdefghabcdefgh", map[rune]string{'a': "000", 'b': "011", 'c': "001", 'd': "111",
			'e': "110", 'f': "101", 'g': "100", 'h': "010"},
			"000011001111110101100010000011001111110101100010000011001111110101100010", 0.375, 62.5},
		{"aaaabbbb", map[rune]string{'a': "0", 'b': "1"}, "00001111", 0.125, 87.5},
		{"aaaaabbbcc", map[rune]string{'a': "0", 'b': "11", 'c': "10"}, "000001111111010", 0.1875, 81.25},
		{"the quick brown fox jumps over the lazy dog", map[rune]string{' ': "00", 'a': "111011",
			'b': "01101", 'c': "01100", 'd': "110000", 'e': "1010", 'f': "101111", 'g': "110100",
			'h': "11100", 'i': "10011", 'j': "101101", 'k': "110011", 'l': "111110", 'm': "01110",
			'n': "101110", 'o': "010", 'p': "01111", 'q': "10010", 'r': "11011", 's': "111111",
			't': "11110", 'u': "1000", 'v': "110010", 'w': "110101", 'x': "101100", 'y': "110001",
			'z': "111010"},
			"111101110010100010010100010011011001100110001101110110101101011011100010111101010110000101101100" +
				"001110011111111110001011001010101101100111101110010100011111011101111101011000100110000010110100",
			0.5581395348837209, 44.18604651162791},
		{"aaaa", map[rune]string{'a': "0"}, "0000", 0.125, 87.5},
		{"ab", map[rune]string{'a': "0", 'b': "1"}, "01", 0.125, 87.5},
		{"", map[rune]string{}, "", 0, 100},
		// Symbols are runes (code points), as in Python, so 0xe9 and 0xf6 are one symbol each.
		{accented, map[rune]string{' ': "000", 'd': "011", 'h': "1100", 'l': "10", 'o': "001",
			'r': "1110", 'w': "1101", 0xe9: "1111", 0xf6: "010"},
			"1100111110100010001101010111010011", 0.38636363636363635, 61.36363636363637},
	}
	for _, tc := range tests {
		encoded, codes, tree := HuffmanEncode(tc.text)
		if !reflect.DeepEqual(codes, tc.codes) {
			t.Errorf("%q: codes = %v, want %v", tc.text, codes, tc.codes)
		}
		if encoded != tc.encoded {
			t.Errorf("%q: encoded = %q, want %q", tc.text, encoded, tc.encoded)
		}
		if got := HuffmanDecode(encoded, tree); got != tc.text {
			t.Errorf("%q: decoded = %q", tc.text, got)
		}
		if ratio, savings := CalculateCompressionRatio(tc.text, encoded, codes); ratio != tc.ratio || savings != tc.savings {
			t.Errorf("%q: ratio, savings = %v, %v, want %v, %v", tc.text, ratio, savings, tc.ratio, tc.savings)
		}
	}
}

// bruteForceCost is the cheapest total cost over every order of merging two
// nodes: the optimum over all code trees, found without a heap.
func bruteForceCost(weights []int) int {
	if len(weights) < 2 {
		return 0
	}
	best := -1
	for i := range weights {
		for j := i + 1; j < len(weights); j++ {
			rest := []int{weights[i] + weights[j]}
			for m, w := range weights {
				if m != i && m != j {
					rest = append(rest, w)
				}
			}
			if cost := weights[i] + weights[j] + bruteForceCost(rest); best < 0 || cost < best {
				best = cost
			}
		}
	}
	return best
}

func TestHuffmanMatchesBruteForceOptimum(t *testing.T) {
	rng := rand.New(rand.NewSource(20261115))
	for trial := 0; trial < 300; trial++ {
		alphabet := 1 + rng.Intn(6)
		length := 1 + rng.Intn(40)
		freq := map[byte]int{}
		var text strings.Builder
		for i := 0; i < length; i++ {
			c := byte('a' + rng.Intn(alphabet))
			text.WriteByte(c)
			freq[c]++
		}
		var weights []int
		for _, f := range freq {
			weights = append(weights, f)
		}

		encoded, codes, tree := HuffmanEncode(text.String())
		want := length
		if len(weights) > 1 {
			want = bruteForceCost(weights)
		}
		if len(encoded) != want || !isPrefixFree(codes) || HuffmanDecode(encoded, tree) != text.String() {
			t.Fatalf("%q: encoded length %d, optimum %d, codes %v", text.String(), len(encoded), want, codes)
		}
	}
}
