// Interactive Problem Techniques for Competitive Programming (Go)

package main

import (
	"bufio"
	"fmt"
	"os"
)

var (
	reader = bufio.NewReader(os.Stdin)
	writer = bufio.NewWriter(os.Stdout)
)

// Query sends a query and gets response
func Query(x int) int {
	fmt.Fprintf(writer, "? %d\n", x)
	writer.Flush()
	var response int
	fmt.Fscan(reader, &response)
	return response
}

// Answer submits final answer
func Answer(x int) {
	fmt.Fprintf(writer, "! %d\n", x)
	writer.Flush()
}

// GuessNumber guesses a number between 1 and n
func GuessNumber(n int) {
	lo, hi := 1, n

	for lo < hi {
		mid := (lo + hi) / 2

		fmt.Fprintf(writer, "? %d\n", mid)
		writer.Flush()

		var response string
		fmt.Fscan(reader, &response)

		if response == "correct" {
			return
		} else if response == "higher" {
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}

	fmt.Fprintf(writer, "! %d\n", lo)
	writer.Flush()
}

// BinarySearchAnswer performs interactive binary search
func BinarySearchAnswer(n int, predicate func(int) bool) int {
	lo, hi := 1, n

	for lo < hi {
		mid := (lo + hi + 1) / 2
		if predicate(mid) {
			lo = mid
		} else {
			hi = mid - 1
		}
	}

	return lo
}

func main() {
	defer writer.Flush()

	// Example: Guess number
	GuessNumber(100)
}
