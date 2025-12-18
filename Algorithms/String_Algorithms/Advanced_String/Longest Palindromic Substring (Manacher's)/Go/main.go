package main

import "fmt"

func Manacher(s string) string {
	if len(s) == 0 {
		return ""
	}
	
	transformed := "^#"
	for _, c := range s {
		transformed += string(c) + "#"
	}
	transformed += "$"
	
	n := len(transformed)
	p := make([]int, n)
	center, right := 0, 0
	
	for i := 1; i < n-1; i++ {
		mirror := 2*center - i
		if i < right {
			if right-i < p[mirror] {
				p[i] = right - i
			} else {
				p[i] = p[mirror]
			}
		}
		
		for i+p[i]+1 < n && i-p[i]-1 >= 0 && transformed[i+p[i]+1] == transformed[i-p[i]-1] {
			p[i]++
		}
		
		if i+p[i] > right {
			center = i
			right = i + p[i]
		}
	}
	
	maxLen := 0
	centerIndex := 0
	for i := 1; i < n-1; i++ {
		if p[i] > maxLen {
			maxLen = p[i]
			centerIndex = i
		}
	}
	
	start := (centerIndex - maxLen) / 2
	return s[start : start+maxLen]
}

func main() {
	s := "babad"
	fmt.Println("Manacher's Algorithm Example:")
	fmt.Println("Longest palindromic substring:", Manacher(s))
}

