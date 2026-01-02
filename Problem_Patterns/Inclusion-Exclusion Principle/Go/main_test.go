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
	if result <= 0 {
		t.Errorf("Count divisible failed")
	}
}

func TestCountUnionSets(t *testing.T) {
	sets := [][]int{{1, 2, 3}, {2, 3, 4}}
	result := countUnionSets(sets)
	if result <= 0 {
		t.Errorf("Count union sets failed")
	}
}
