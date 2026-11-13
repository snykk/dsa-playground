package main

import "testing"

func TestGCD(t *testing.T) {
	if gcd(12, 18) != 6 {
		t.Errorf("GCD failed")
	}
}

func TestCountDivisible(t *testing.T) {
	divisors := []int{2, 3}
	result := countDivisible(100, divisors)
	if result != 67 {
		t.Errorf("countDivisible(100, {2,3}) = %d, want 67", result)
	}
	if got := countDivisible(100, []int{2, 3, 5}); got != 74 {
		t.Errorf("countDivisible(100, {2,3,5}) = %d, want 74", got)
	}
}

// With many divisors the lcm grows past n; such terms must be skipped.
func TestCountDivisibleManyPrimes(t *testing.T) {
	primes := []int{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}
	if got := countDivisible(1000000000, primes[:11]); got != 847147843 {
		t.Errorf("11 primes: got %d, want 847147843", got)
	}
	if got := countDivisible(1000000000, primes); got != 851278987 {
		t.Errorf("12 primes: got %d, want 851278987", got)
	}
}

func TestCountUnionSets(t *testing.T) {
	// Regression: every term used to be intersected with sets[0] as well.
	cases := []struct {
		sets [][]int
		want int
	}{
		{[][]int{{1, 2, 3}, {2, 3, 4}}, 4},
		{[][]int{{1, 2, 3}, {2, 3, 4}, {3, 4, 5}}, 5},
		{[][]int{{1}, {2}}, 2},
		{[][]int{{1, 2}, {1, 2}}, 2},
		{[][]int{{}, {7}}, 1},
		{[][]int{}, 0},
	}
	for _, c := range cases {
		if got := countUnionSets(c.sets); got != c.want {
			t.Errorf("countUnionSets(%v) = %d, want %d", c.sets, got, c.want)
		}
	}
}
