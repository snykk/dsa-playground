package intro

func AccessChar(s string, index int) byte { return s[index] }
func StringLength(s string) int           { return len(s) }

func TraverseString(s string) []rune {
	r := []rune(s)
	return r
}

func Concatenate(s1, s2 string) string { return s1 + s2 }

func Substring(s string, start, end int) string {
	r := []rune(s)
	return string(r[start:end])
}
