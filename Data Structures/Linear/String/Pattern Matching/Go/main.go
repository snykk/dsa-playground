package pattern

func NaiveSearch(text, pattern string) []int {
	indices := []int{}
	n, m := len(text), len(pattern)
	for i := 0; i <= n-m; i++ {
		if text[i:i+m] == pattern {
			indices = append(indices, i)
		}
	}
	return indices
}

// Compute LPS for KMP
func ComputeLPS(pattern string) []int {
	m := len(pattern)
	lps := make([]int, m)
	length := 0
	i := 1
	for i < m {
		if pattern[i] == pattern[length] {
			length++
			lps[i] = length
			i++
		} else {
			if length != 0 {
				length = lps[length-1]
			} else {
				lps[i] = 0
				i++
			}
		}
	}
	return lps
}

func KMPSearch(text, pattern string) []int {
	n, m := len(text), len(pattern)
	lps := ComputeLPS(pattern)
	indices := []int{}
	i, j := 0, 0
	for i < n {
		if pattern[j] == text[i] {
			i++
			j++
		}
		if j == m {
			indices = append(indices, i-j)
			j = lps[j-1]
		} else if i < n && pattern[j] != text[i] {
			if j != 0 {
				j = lps[j-1]
			} else {
				i++
			}
		}
	}
	return indices
}
