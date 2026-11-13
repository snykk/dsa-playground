package main

import "fmt"

func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

// countDivisible counts numbers in 1..n divisible by at least one divisor
// (all divisors >= 1). A subset is dropped once its lcm exceeds n: n / lcm is 0
// there, and the product would overflow after enough divisors.
func countDivisible(n int, divisors []int) int {
	result := 0
	k := len(divisors)

	for i := 1; i < (1 << uint(k)); i++ {
		count := 0
		lcm := 1
		tooBig := false
		for j := 0; j < k; j++ {
			if i&(1<<uint(j)) != 0 {
				count++
				lcm = lcm / gcd(lcm, divisors[j]) * divisors[j]
				if lcm > n {
					tooBig = true
					break
				}
			}
		}
		if tooBig {
			continue
		}

		if count%2 == 1 {
			result += n / lcm
		} else {
			result -= n / lcm
		}
	}
	return result
}

// countUnionSets returns the size of the union of the sets: each non-empty
// subset adds (odd size) or subtracts (even size) its intersection size.
func countUnionSets(sets [][]int) int {
	n := len(sets)
	result := 0

	for i := 1; i < (1 << uint(n)); i++ {
		var intersection map[int]bool
		count := 0

		for j := 0; j < n; j++ {
			if i&(1<<uint(j)) != 0 {
				count++
				if intersection == nil {
					// start from the first set in the subset, not from sets[0]
					intersection = make(map[int]bool)
					for _, val := range sets[j] {
						intersection[val] = true
					}
					continue
				}
				currentSet := make(map[int]bool)
				for _, val := range sets[j] {
					currentSet[val] = true
				}
				newIntersection := make(map[int]bool)
				for val := range intersection {
					if currentSet[val] {
						newIntersection[val] = true
					}
				}
				intersection = newIntersection
			}
		}

		if count%2 == 1 {
			result += len(intersection)
		} else {
			result -= len(intersection)
		}
	}
	return result
}

func main() {
	divisors := []int{2, 3, 5}
	result := countDivisible(100, divisors)
	fmt.Printf("Count divisible: %d\n", result)

	sets := [][]int{{1, 2, 3}, {2, 3, 4}, {3, 4, 5}}
	result = countUnionSets(sets)
	fmt.Printf("Count union sets: %d\n", result)
}
