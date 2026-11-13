package main

import "testing"

func TestCoinChangeMinCoins(t *testing.T) {
	coins := []int{1, 2, 5}
	if CoinChangeMinCoins(coins, 11) != 3 {
		t.Error("Expected 3")
	}

	tests := []struct {
		name     string
		coins    []int
		amount   int
		expected int
	}{
		{"classic", []int{2, 5, 10, 1}, 27, 4},
		{"large", []int{186, 419, 83, 408}, 6249, 20},
		{"single coin", []int{1}, 7, 7},
		{"zero amount", []int{1, 2, 5}, 0, 0},
		{"zero amount, no coins", []int{}, 0, 0},
		{"unreachable odd amount", []int{2}, 3, -1},
		{"every coin too large", []int{5}, 3, -1},
		{"no coins", []int{}, 5, -1},
	}
	for _, tt := range tests {
		if got := CoinChangeMinCoins(tt.coins, tt.amount); got != tt.expected {
			t.Errorf("%s: CoinChangeMinCoins(%v, %d) = %d, expected %d", tt.name, tt.coins, tt.amount, got, tt.expected)
		}
	}
}

// Regression: a negative amount used to panic inside make() with an unclear message.
func TestCoinChangeNegativeAmountPanics(t *testing.T) {
	defer func() {
		r := recover()
		if r == nil {
			t.Fatal("CoinChangeMinCoins(coins, -1) did not panic")
		}
		if msg, ok := r.(string); !ok || msg != "CoinChangeMinCoins: amount must be non-negative" {
			t.Errorf("unexpected panic value: %v", r)
		}
	}()
	CoinChangeMinCoins([]int{1, 2, 5}, -1)
}
