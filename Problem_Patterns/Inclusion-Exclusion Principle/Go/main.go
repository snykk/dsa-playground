package main

import "fmt"

func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

func countDivisible(n int, divisors []int) int {
	result := 0
	k := len(divisors)

	for i := 1; i < (1 << uint(k)); i++ {
		count := 0
		lcm := 1
		for j := 0; j < k; j++ {
			if i&(1<<uint(j)) != 0 {
				count++
				lcm = lcm * divisors[j] / gcd(lcm, divisors[j])
			}
		}

		if count%2 == 1 {
			result += n / lcm
		} else {
			result -= n / lcm
		}
	}
	return result
}

func countUnionSets(sets [][]int) int {
	n := len(sets)
	result := 0

	for i := 1; i < (1 << uint(n)); i++ {
		intersection := make(map[int]bool)
		if len(sets[0]) > 0 {
			for _, val := range sets[0] {
				intersection[val] = true
			}
		}
		count := 0

		for j := 0; j < n; j++ {
			if i&(1<<uint(j)) != 0 {
				count++
				newIntersection := make(map[int]bool)
				currentSet := make(map[int]bool)
				for _, val := range sets[j] {
					currentSet[val] = true
				}
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
