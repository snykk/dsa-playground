// Game Theory Basics for Competitive Programming (Go)

package main

import "fmt"

// Nim Game

// NimWinner checks if first player wins in Nim
func NimWinner(piles []int) bool {
	xorSum := 0
	for _, pile := range piles {
		xorSum ^= pile
	}
	return xorSum != 0
}

// NimWinningMove finds a winning move in Nim
func NimWinningMove(piles []int) (int, int) {
	xorSum := 0
	for _, pile := range piles {
		xorSum ^= pile
	}

	if xorSum == 0 {
		return -1, -1 // Losing position
	}

	for i, pile := range piles {
		target := pile ^ xorSum
		if target < pile {
			return i, pile - target
		}
	}

	return -1, -1
}

// Sprague-Grundy

// Mex finds minimum excludant
func Mex(s map[int]bool) int {
	result := 0
	for s[result] {
		result++
	}
	return result
}

// SubtractionGrundy calculates Grundy numbers for subtraction game
func SubtractionGrundy(n int, moves []int) []int {
	grundy := make([]int, n+1)

	for i := 1; i <= n; i++ {
		reachable := make(map[int]bool)
		for _, move := range moves {
			if i >= move {
				reachable[grundy[i-move]] = true
			}
		}
		grundy[i] = Mex(reachable)
	}

	return grundy
}

// CombinedGrundy computes combined game Grundy number
func CombinedGrundy(states []int, grundyTables [][]int) int {
	result := 0
	for i, state := range states {
		result ^= grundyTables[i][state]
	}
	return result
}

// MisereNimWinner checks the winner in Misere Nim (the player who takes the
// last object loses). It is normal Nim unless every pile has at most one
// object; then the first player wins exactly when the number of non-empty piles
// is even.
func MisereNimWinner(piles []int) bool {
	xorSum := 0
	bigPile := false
	nonEmpty := 0

	for _, pile := range piles {
		xorSum ^= pile
		if pile > 1 {
			bigPile = true
		}
		if pile > 0 {
			nonEmpty++
		}
	}

	if !bigPile {
		return nonEmpty%2 == 0
	}
	return xorSum != 0
}

func main() {
	piles := []int{3, 4, 5}
	fmt.Printf("Nim winner: %v\n", NimWinner(piles))
	i, take := NimWinningMove(piles)
	fmt.Printf("Winning move: pile %d, take %d\n", i, take)
}
