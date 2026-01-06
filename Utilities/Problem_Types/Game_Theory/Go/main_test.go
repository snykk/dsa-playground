package main

import "testing"

func TestNimWinner(t *testing.T) {
	piles := []int{3, 4, 5}
	if !NimWinner(piles) {
		t.Error("First player should win")
	}
}

func TestNimWinningMove(t *testing.T) {
	piles := []int{3, 4, 5}
	i, take := NimWinningMove(piles)
	if i == -1 {
		t.Error("Should find winning move")
	}
	if take <= 0 {
		t.Error("Take amount should be positive")
	}
}

func TestMex(t *testing.T) {
	s := map[int]bool{0: true, 1: true, 3: true}
	if Mex(s) != 2 {
		t.Errorf("Expected 2, got %d", Mex(s))
	}
}
