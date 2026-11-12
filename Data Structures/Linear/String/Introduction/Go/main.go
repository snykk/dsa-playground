package intro

func AccessChar(s string, index int) byte { return s[index] }
func StringLength(s string) int           { return len(s) }

// TraverseString decodes s into code points (runes), unlike the byte-based
// helpers around it.
func TraverseString(s string) []rune {
	r := []rune(s)
	return r
}

func Concatenate(s1, s2 string) string { return s1 + s2 }

// Substring returns the bytes s[start:end], like slicing in Go: O(1), no copy.
// Both ends are clamped to [0, len(s)] and an empty range gives "".
// It counts bytes, like StringLength and AccessChar, so a cut can split a
// multi-byte character.
func Substring(s string, start, end int) string {
	if start < 0 {
		start = 0
	}
	if end > len(s) {
		end = len(s)
	}
	if end <= start {
		return ""
	}
	return s[start:end]
}
