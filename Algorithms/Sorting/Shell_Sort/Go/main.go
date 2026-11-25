package main

import "fmt"

// Sequence names a gap sequence for Shell Sort. Each one uses its terms below n, largest first.
type Sequence int

const (
	// Ciura is 1, 4, 10, 23, 57, 132, 301, 701, then 2h + h/4 = floor(2.25 h): 1577, 3548, ...
	// It is the zero value, so it is the default.
	Ciura Sequence = iota
	// Knuth is 1, 4, 13, 40, ...: (3^k - 1) / 2, each term 3h + 1.
	Knuth
	// Shell is n/2, n/4, ..., 1.
	Shell
)

// String returns the sequence's name as the Python version spells it.
func (s Sequence) String() string {
	switch s {
	case Ciura:
		return "ciura"
	case Knuth:
		return "knuth"
	case Shell:
		return "shell"
	}
	return fmt.Sprintf("Sequence(%d)", int(s))
}

var ciuraBase = []int{1, 4, 10, 23, 57, 132, 301, 701}

// ShellGaps returns Shell's gaps for n elements: n/2, n/4, ..., 1. Empty for n < 2.
func ShellGaps(n int) []int {
	gaps := []int{}
	for gap := n / 2; gap > 0; gap /= 2 {
		gaps = append(gaps, gap)
	}
	return gaps
}

// KnuthGaps returns Knuth's gaps (3^k - 1) / 2 below n, largest first. Empty for n < 2.
func KnuthGaps(n int) []int {
	gaps := []int{}
	for h := 1; h < n; h = 3*h + 1 {
		gaps = append(gaps, h)
		// The next gap 3h + 1 is below n only if h <= (n - 2) / 3; stopping here never
		// computes a number above n.
		if h > (n-2)/3 {
			break
		}
	}
	reverse(gaps)
	return gaps
}

// CiuraGaps returns Ciura's gaps below n, largest first, extended past 701 by
// 2h + h/4 = floor(2.25 h). Empty for n < 2.
func CiuraGaps(n int) []int {
	gaps := []int{}
	for _, g := range ciuraBase {
		if g < n {
			gaps = append(gaps, g)
		}
	}
	h := ciuraBase[len(ciuraBase)-1]
	for h < n {
		// The next gap 2h + h/4 is below n only if 2h < n and h/4 < n - 2h. Testing it this
		// way never computes a number above n, so nothing overflows.
		if h > (n-1)/2 || h/4 >= n-2*h {
			break
		}
		h = 2*h + h/4
		gaps = append(gaps, h)
	}
	reverse(gaps)
	return gaps
}

func reverse(a []int) {
	for i, j := 0, len(a)-1; i < j; i, j = i+1, j-1 {
		a[i], a[j] = a[j], a[i]
	}
}

// GapSequence returns the gaps Shell Sort uses on n elements, largest first. It panics on a
// Sequence other than Ciura, Knuth and Shell.
func GapSequence(n int, seq Sequence) []int {
	switch seq {
	case Ciura:
		return CiuraGaps(n)
	case Knuth:
		return KnuthGaps(n)
	case Shell:
		return ShellGaps(n)
	}
	panic(fmt.Sprintf("shellsort: unknown gap sequence %d", int(seq)))
}

// HSortGeneric is one pass of Shell Sort: insertion sort with stride gap, ordered by less, so
// that afterwards less(arr[i+gap], arr[i]) is false for every i. It panics if gap < 1.
func HSortGeneric[T any](arr []T, less func(a, b T) bool, gap int) {
	if gap < 1 {
		panic(fmt.Sprintf("shellsort: gap must be at least 1, got %d", gap))
	}
	for i := gap; i < len(arr); i++ {
		key := arr[i]
		j := i
		// less(key, arr[j-gap]) is arr[j-gap] > key: an equal element stops the shifting.
		for j >= gap && less(key, arr[j-gap]) {
			arr[j] = arr[j-gap]
			j -= gap
		}
		arr[j] = key
	}
}

// ShellSortGeneric sorts arr in place, ordered by less, with the given gap sequence. Not stable.
func ShellSortGeneric[T any](arr []T, less func(a, b T) bool, seq Sequence) {
	for _, gap := range GapSequence(len(arr), seq) {
		HSortGeneric(arr, less, gap)
	}
}

func intLess(a, b int) bool { return a < b }

// HSort is HSortGeneric for ints.
func HSort(arr []int, gap int) { HSortGeneric(arr, intLess, gap) }

// ShellSort sorts a slice of ints in place with the given gap sequence (Ciura, the zero
// value, is the default choice).
func ShellSort(arr []int, seq Sequence) { ShellSortGeneric(arr, intLess, seq) }

func main() {
	example := []int{98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38}
	for _, seq := range []Sequence{Shell, Knuth, Ciura} {
		arr := append([]int(nil), example...)
		fmt.Printf("%v:\n", seq)
		for _, gap := range GapSequence(len(arr), seq) {
			HSort(arr, gap)
			fmt.Printf("  after gap %d: %v\n", gap, arr)
		}
	}
}
