package main

import "testing"

func TestCoinChangeMinCoins(t *testing.T) {
	coins := []int{1, 2, 5}
	if CoinChangeMinCoins(coins, 11) != 3 {
		t.Error("Expected 3")
	}
}

