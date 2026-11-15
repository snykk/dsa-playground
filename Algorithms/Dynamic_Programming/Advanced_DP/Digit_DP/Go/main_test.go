package main

import (
	"math"
	"math/rand"
	"testing"
)

func digitSum(x int64) int {
	sum := 0
	for ; x > 0; x /= 10 {
		sum += int(x % 10)
	}
	return sum
}

func TestCountNumbersWithDigitSum(t *testing.T) {
	tests := []struct {
		name   string
		n      int64
		target int
		want   int64
	}{
		{"digit sum 5 up to 100", 100, 5, 6},
		{"zero, target zero", 0, 0, 1},
		{"zero, target three", 0, 3, 0},
		{"only 0 has digit sum 0", 1000, 0, 1},
		// count(R) - count(L - 1) must work for L = 0.
		{"negative bound counts nothing", -1, 0, 0},
		{"negative bound, target five", -1, 5, 0},
		{"unreachable target", 99, 19, 0},
		// Expected values printed by the Python count_numbers_with_digit_sum.
		{"python: negative bound", -7, 5, 0},
		{"python: negative target", 100, -1, 0},
		{"python: 4321, 27", 4321, 27, 20},
		{"python: 10^18, 9", 1000000000000000000, 9, 3124550},
		{"python: 10^18, 162", 1000000000000000000, 162, 1},
		{"python: 123456789, 20", 123456789, 20, 1050192},
		{"python: 9999999999, 45", 9999999999, 45, 432457640},
		{"python: max int64, 90", math.MaxInt64, 90, 271431132643611133},
	}
	for _, tc := range tests {
		if got := CountNumbersWithDigitSum(tc.n, tc.target); got != tc.want {
			t.Errorf("%s: CountNumbersWithDigitSum(%d, %d) = %d, want %d", tc.name, tc.n, tc.target, got, tc.want)
		}
	}
}

func TestCountNumbersWithDigitSumMatchesBruteForce(t *testing.T) {
	for _, n := range []int64{0, 9, 10, 99, 100, 123, 999, 1000, 4321} {
		for _, target := range []int{0, 1, 5, 9, 18, 27} {
			var want int64
			for x := int64(0); x <= n; x++ {
				if digitSum(x) == target {
					want++
				}
			}
			if got := CountNumbersWithDigitSum(n, target); got != want {
				t.Errorf("CountNumbersWithDigitSum(%d, %d) = %d, want %d", n, target, got, want)
			}
		}
	}
}

func TestCountNumbersWithDigitSumMatchesCountingOneByOne(t *testing.T) {
	// count[x][t] = numbers in 0..x with digit sum t, built by counting one by one.
	const limit, maxTarget = 5000, 37 // above 31 (the digit sum of 4999) nothing is counted
	count := make([][maxTarget + 1]int64, limit+1)
	for x := 0; x <= limit; x++ {
		if x > 0 {
			count[x] = count[x-1]
		}
		count[x][digitSum(int64(x))]++
	}
	rng := rand.New(rand.NewSource(20261115))
	for trial := 0; trial < 400; trial++ {
		n := rng.Intn(limit + 1)
		for target := 0; target <= maxTarget; target++ {
			if got := CountNumbersWithDigitSum(int64(n), target); got != count[n][target] {
				t.Fatalf("CountNumbersWithDigitSum(%d, %d) = %d, want %d", n, target, got, count[n][target])
			}
		}
	}
}
