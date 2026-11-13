package main

import (
	"fmt"
	"testing"
)

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

// bruteNim returns true if the player to move wins (plain game-tree search).
func bruteNim(piles []int, misere bool, memo map[string]bool) bool {
	sorted := append([]int(nil), piles...)
	for i := 1; i < len(sorted); i++ {
		for j := i; j > 0 && sorted[j-1] > sorted[j]; j-- {
			sorted[j-1], sorted[j] = sorted[j], sorted[j-1]
		}
	}
	total := 0
	for _, p := range sorted {
		total += p
	}
	if total == 0 {
		return misere // the previous player took the last object
	}
	key := fmt.Sprint(sorted)
	if v, ok := memo[key]; ok {
		return v
	}
	win := false
	for i := range sorted {
		for take := 1; take <= sorted[i] && !win; take++ {
			next := append([]int(nil), sorted...)
			next[i] -= take
			if !bruteNim(next, misere, memo) {
				win = true
			}
		}
	}
	memo[key] = win
	return win
}

func forEachPiles(count, maxPile int, fn func([]int)) {
	piles := make([]int, count)
	for {
		fn(piles)
		i := 0
		for i < count {
			piles[i]++
			if piles[i] <= maxPile {
				break
			}
			piles[i] = 0
			i++
		}
		if i == count {
			return
		}
	}
}

func TestNimAgainstBruteForce(t *testing.T) {
	memo := map[string]bool{}
	for count := 0; count <= 3; count++ {
		forEachPiles(count, 4, func(p []int) {
			if NimWinner(p) != bruteNim(p, false, memo) {
				t.Errorf("Nim %v: wrong winner", p)
			}
		})
	}
}

func TestMisereNimAgainstBruteForce(t *testing.T) {
	memo := map[string]bool{}
	for count := 0; count <= 4; count++ {
		forEachPiles(count, 3, func(p []int) {
			if MisereNimWinner(p) != bruteNim(p, true, memo) {
				t.Errorf("Misere Nim %v: wrong winner", p)
			}
		})
	}
}

func TestMisereNimEmptyPilesDoNotCount(t *testing.T) {
	if MisereNimWinner([]int{1}) {
		t.Error("[1]: the first player must take the last object and loses")
	}
	if MisereNimWinner([]int{0, 1}) {
		t.Error("[0 1]: an empty pile must not count")
	}
	if !MisereNimWinner([]int{0}) {
		t.Error("[0]: the first player wins because the opponent took the last object")
	}
}

func TestSubtractionGrundy(t *testing.T) {
	got := SubtractionGrundy(10, []int{1, 2, 3})
	want := []int{0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("grundy[%d] = %d, want %d", i, got[i], want[i])
		}
	}
}
