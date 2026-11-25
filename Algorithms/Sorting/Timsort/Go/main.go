package main

import "fmt"

// Timsort is a stable merge sort that works with the order already in the data, following
// the design of CPython's list.sort() (Objects/listsort.txt):
//
//  1. Natural runs: non-descending (a[i] <= a[i+1]) or strictly descending stretches; a
//     descending run is reversed, which is stable because it is strict.
//  2. minrun (32..64 for n >= 64, n below that): shorter runs are extended with binary
//     insertion sort.
//  3. A stack of pending runs whose lengths satisfy, for every three neighbours X, Y, Z (Z
//     on top), X > Y + Z and Y > Z; mergeCollapse restores this after every push.
//  4. Merges with a temporary copy of the smaller run, left to right (mergeLo) or right to
//     left (mergeHi), after trimming the elements already in place.
//  5. Galloping: after minGallop wins in a row by one run (MinGallop = 7 at the start),
//     exponential search moves whole blocks; minGallop adapts to the data.
//
// Every comparison is a call to less(a, b), the Python version's a < b, so the two make
// the same comparisons: the tests pin the counts of 40 arrays to the Python outputs.

// MinGallop is the number of wins in a row that starts galloping when a sort begins.
const MinGallop = 7

// ComputeMinrun returns the minimum run length for n elements, as CPython computes it: the
// six most significant bits of n, plus 1 if any remaining bit is set. n itself below 64,
// else 32..64.
func ComputeMinrun(n int) int {
	r := 0
	for n >= 64 {
		r |= n & 1
		n >>= 1
	}
	return n + r
}

// CountRun returns the length of the run that starts at arr[lo], looking no further than hi
// (lo < hi), and whether it is strictly descending. A non-descending run is tested as
// !less(arr[i+1], arr[i]).
func CountRun[T any](arr []T, less func(a, b T) bool, lo, hi int) (int, bool) {
	if lo+1 == hi {
		return 1, false
	}
	n := 2
	if less(arr[lo+1], arr[lo]) {
		for lo+n < hi && less(arr[lo+n], arr[lo+n-1]) {
			n++
		}
		return n, true
	}
	for lo+n < hi && !less(arr[lo+n], arr[lo+n-1]) {
		n++
	}
	return n, false
}

func reverseRange[T any](arr []T, lo, hi int) {
	for hi--; lo < hi; lo, hi = lo+1, hi-1 {
		arr[lo], arr[hi] = arr[hi], arr[lo]
	}
}

// BinaryInsertionSort sorts arr[lo:hi] given that arr[lo:start] is sorted: each element is
// placed by a binary search, then the larger ones shift right. An equal element stays to the
// left, so it is stable.
func BinaryInsertionSort[T any](arr []T, less func(a, b T) bool, lo, hi, start int) {
	if start == lo {
		start++
	}
	for i := start; i < hi; i++ {
		pivot := arr[i]
		left, right := lo, i
		for left < right {
			mid := left + (right-left)/2
			if less(pivot, arr[mid]) {
				right = mid
			} else {
				left = mid + 1
			}
		}
		copy(arr[left+1:i+1], arr[left:i])
		arr[left] = pivot
	}
}

// GallopLeft returns where key belongs in the sorted a[base:base+n], left of any equal
// elements: the k in 0..n with a[base+k-1] < key <= a[base+k]. It starts at a[base+hint],
// probes offsets 1, 3, 7, 15, ... (exponential search), then binary-searches the last gap.
func GallopLeft[T any](key T, a []T, less func(a, b T) bool, base, n, hint int) int {
	p := base + hint
	var lo, hi int
	if less(a[p], key) {
		maxOfs, last, ofs := n-hint, 0, 1
		for ofs < maxOfs && less(a[p+ofs], key) {
			last, ofs = ofs, 2*ofs+1
		}
		ofs = min(ofs, maxOfs)
		lo, hi = hint+last+1, hint+ofs
	} else {
		maxOfs, last, ofs := hint+1, 0, 1
		for ofs < maxOfs && !less(a[p-ofs], key) {
			last, ofs = ofs, 2*ofs+1
		}
		ofs = min(ofs, maxOfs)
		lo, hi = hint+1-ofs, hint-last
	}
	for lo < hi {
		mid := lo + (hi-lo)/2
		if less(a[base+mid], key) {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return hi
}

// GallopRight returns where key belongs in the sorted a[base:base+n], right of any equal
// elements: the k with a[base+k-1] <= key < a[base+k].
func GallopRight[T any](key T, a []T, less func(a, b T) bool, base, n, hint int) int {
	p := base + hint
	var lo, hi int
	if less(key, a[p]) {
		maxOfs, last, ofs := hint+1, 0, 1
		for ofs < maxOfs && less(key, a[p-ofs]) {
			last, ofs = ofs, 2*ofs+1
		}
		ofs = min(ofs, maxOfs)
		lo, hi = hint+1-ofs, hint-last
	} else {
		maxOfs, last, ofs := n-hint, 0, 1
		for ofs < maxOfs && !less(key, a[p+ofs]) {
			last, ofs = ofs, 2*ofs+1
		}
		ofs = min(ofs, maxOfs)
		lo, hi = hint+last+1, hint+ofs
	}
	for lo < hi {
		mid := lo + (hi-lo)/2
		if less(key, a[base+mid]) {
			hi = mid
		} else {
			lo = mid + 1
		}
	}
	return hi
}

// Run is a pending run, arr[Base:Base+Length].
type Run struct{ Base, Length int }

// InvariantsHold reports whether the run lengths (bottom of the stack first) satisfy
// X > Y + Z for every three neighbours and Y > Z for every two.
func InvariantsHold(runs []Run) bool {
	for i := 0; i+1 < len(runs); i++ {
		if runs[i].Length <= runs[i+1].Length {
			return false
		}
		if i+2 < len(runs) && runs[i].Length <= runs[i+1].Length+runs[i+2].Length {
			return false
		}
	}
	return true
}

// Options tunes TimsortWith. The zero value is the default: galloping on, minrun computed.
type Options struct {
	// NoGallop turns galloping mode off inside merges (same result), to measure what it saves.
	NoGallop bool
	// MinRun replaces the computed minrun when positive; 0 computes it from n.
	MinRun int
	// AfterCollapse, if set, is called with the run stack after every mergeCollapse.
	AfterCollapse func(runs []Run)
}

type mergeState[T any] struct {
	arr       []T
	less      func(a, b T) bool
	gallop    bool
	pending   []Run // bottom of the stack first; the runs lie side by side
	minGallop int
	tmp       []T // the temporary copy of the smaller run
}

// mergeLo merges A = arr[baseA:baseA+na] and B = arr[baseB:baseB+nb], na <= nb, left to
// right, with A copied to tmp. After mergeAt's trimming, B[0] < A[0] and A[na-1] > B[nb-1],
// so B[0] goes first and A[na-1] last without a comparison. Ties go to A: stable.
func (ms *mergeState[T]) mergeLo(baseA, na, baseB, nb int) {
	arr, less := ms.arr, ms.less
	ms.tmp = append(ms.tmp[:0], arr[baseA:baseA+na]...)
	tmp := ms.tmp
	a, b, dest := 0, baseB, baseA

	arr[dest] = arr[b]
	dest, b, nb = dest+1, b+1, nb-1
	minGallop := ms.minGallop
	for nb > 0 && na > 1 {
		// One pair at a time, until one run wins minGallop times in a row.
		aCount, bCount := 0, 0
		for nb > 0 && na > 1 {
			if less(arr[b], tmp[a]) {
				arr[dest] = arr[b]
				dest, b, nb = dest+1, b+1, nb-1
				bCount, aCount = bCount+1, 0
				if ms.gallop && bCount >= minGallop {
					break
				}
			} else {
				arr[dest] = tmp[a]
				dest, a, na = dest+1, a+1, na-1
				aCount, bCount = aCount+1, 0
				if ms.gallop && aCount >= minGallop {
					break
				}
			}
		}
		if nb == 0 || na <= 1 {
			break
		}
		// Galloping: search for where the other run's head goes and move a block.
		minGallop++
		for {
			if minGallop > 1 {
				minGallop--
			}
			ms.minGallop = minGallop
			aCount = GallopRight(arr[b], tmp, less, a, na, 0)
			if aCount > 0 {
				copy(arr[dest:dest+aCount], tmp[a:a+aCount])
				dest, a, na = dest+aCount, a+aCount, na-aCount
				if na <= 1 {
					break
				}
			}
			arr[dest] = arr[b]
			dest, b, nb = dest+1, b+1, nb-1
			if nb == 0 {
				break
			}
			bCount = GallopLeft(tmp[a], arr, less, b, nb, 0)
			if bCount > 0 {
				copy(arr[dest:dest+bCount], arr[b:b+bCount])
				dest, b, nb = dest+bCount, b+bCount, nb-bCount
				if nb == 0 {
					break
				}
			}
			arr[dest] = tmp[a]
			dest, a, na = dest+1, a+1, na-1
			if na == 1 {
				break
			}
			if aCount < MinGallop && bCount < MinGallop {
				break
			}
		}
		if nb == 0 || na <= 1 {
			break
		}
		minGallop++ // leaving galloping mode costs a point
		ms.minGallop = minGallop
	}
	// What is left of B slides left; the rest of A (all of it if B ran out, else only its
	// last element, larger than all of B) goes after it.
	copy(arr[dest:dest+nb], arr[b:b+nb])
	copy(arr[dest+nb:dest+nb+na], tmp[a:a+na])
}

// mergeHi merges A = arr[baseA:baseA+na] and B = arr[baseB:baseB+nb], na > nb, right to
// left, with B copied to tmp: the mirror image of mergeLo. On a tie B's element is placed
// first (further right): stable.
func (ms *mergeState[T]) mergeHi(baseA, na, baseB, nb int) {
	arr, less := ms.arr, ms.less
	ms.tmp = append(ms.tmp[:0], arr[baseB:baseB+nb]...)
	tmp := ms.tmp
	a, b, dest := baseA+na-1, nb-1, baseB+nb-1

	arr[dest] = arr[a]
	dest, a, na = dest-1, a-1, na-1
	minGallop := ms.minGallop
	for na > 0 && nb > 1 {
		aCount, bCount := 0, 0
		for na > 0 && nb > 1 {
			if less(tmp[b], arr[a]) {
				arr[dest] = arr[a]
				dest, a, na = dest-1, a-1, na-1
				aCount, bCount = aCount+1, 0
				if ms.gallop && aCount >= minGallop {
					break
				}
			} else {
				arr[dest] = tmp[b]
				dest, b, nb = dest-1, b-1, nb-1
				bCount, aCount = bCount+1, 0
				if ms.gallop && bCount >= minGallop {
					break
				}
			}
		}
		if na == 0 || nb <= 1 {
			break
		}
		minGallop++
		for {
			if minGallop > 1 {
				minGallop--
			}
			ms.minGallop = minGallop
			aCount = na - GallopRight(tmp[b], arr, less, baseA, na, na-1)
			if aCount > 0 {
				dest, a, na = dest-aCount, a-aCount, na-aCount
				copy(arr[dest+1:dest+1+aCount], arr[a+1:a+1+aCount])
				if na == 0 {
					break
				}
			}
			arr[dest] = tmp[b]
			dest, b, nb = dest-1, b-1, nb-1
			if nb == 1 {
				break
			}
			bCount = nb - GallopLeft(arr[a], tmp, less, 0, nb, nb-1)
			if bCount > 0 {
				dest, b, nb = dest-bCount, b-bCount, nb-bCount
				copy(arr[dest+1:dest+1+bCount], tmp[b+1:b+1+bCount])
				if nb <= 1 {
					break
				}
			}
			arr[dest] = arr[a]
			dest, a, na = dest-1, a-1, na-1
			if na == 0 {
				break
			}
			if aCount < MinGallop && bCount < MinGallop {
				break
			}
		}
		if na == 0 || nb <= 1 {
			break
		}
		minGallop++
		ms.minGallop = minGallop
	}
	// What is left of A slides right to end at dest; the rest of B (all of it if A ran out,
	// else only B[0], smaller than all of A) goes in front of it.
	copy(arr[dest-na+1:dest+1], arr[baseA:baseA+na])
	copy(arr[baseA:baseA+nb], tmp[:nb])
}

// mergeAt merges the runs at stack positions i and i+1, after trimming what is in place.
func (ms *mergeState[T]) mergeAt(i int) {
	arr, less := ms.arr, ms.less
	baseA, na := ms.pending[i].Base, ms.pending[i].Length
	baseB, nb := ms.pending[i+1].Base, ms.pending[i+1].Length
	ms.pending[i].Length = na + nb
	ms.pending = append(ms.pending[:i+1], ms.pending[i+2:]...)

	k := GallopRight(arr[baseB], arr, less, baseA, na, 0)
	baseA, na = baseA+k, na-k
	if na == 0 {
		return
	}
	nb = GallopLeft(arr[baseA+na-1], arr, less, baseB, nb, nb-1)
	if nb == 0 {
		return
	}
	if na <= nb {
		ms.mergeLo(baseA, na, baseB, nb)
	} else {
		ms.mergeHi(baseA, na, baseB, nb)
	}
}

// mergeCollapse: with C the top run and B, A and W below it, merge B with the smaller of A
// and C (C on a tie) while A <= B + C or W <= A + B; else merge B and C while B <= C. The W
// test is the 2015 correction: without it the invariant can break deeper in the stack.
func (ms *mergeState[T]) mergeCollapse() {
	for len(ms.pending) > 1 {
		p := ms.pending
		n := len(p) - 2
		if (n > 0 && p[n-1].Length <= p[n].Length+p[n+1].Length) ||
			(n > 1 && p[n-2].Length <= p[n-1].Length+p[n].Length) {
			if p[n-1].Length < p[n+1].Length {
				n--
			}
			ms.mergeAt(n)
		} else if p[n].Length <= p[n+1].Length {
			ms.mergeAt(n)
		} else {
			break
		}
	}
}

// mergeForceCollapse merges every run left on the stack until one remains.
func (ms *mergeState[T]) mergeForceCollapse() {
	for len(ms.pending) > 1 {
		p := ms.pending
		n := len(p) - 2
		if n > 0 && p[n-1].Length < p[n+1].Length {
			n--
		}
		ms.mergeAt(n)
	}
}

// TimsortWith sorts arr in place, stably, ordered by less. It panics if opts.MinRun < 0.
func TimsortWith[T any](arr []T, less func(a, b T) bool, opts Options) {
	if opts.MinRun < 0 {
		panic(fmt.Sprintf("timsort: MinRun must be 0 (computed) or positive, got %d", opts.MinRun))
	}
	n := len(arr)
	if n < 2 {
		return
	}
	ms := &mergeState[T]{arr: arr, less: less, gallop: !opts.NoGallop, minGallop: MinGallop}
	minrun := opts.MinRun
	if minrun == 0 {
		minrun = ComputeMinrun(n)
	}
	for lo := 0; lo < n; {
		run, descending := CountRun(arr, less, lo, n)
		if descending {
			reverseRange(arr, lo, lo+run)
		}
		if run < minrun {
			force := min(minrun, n-lo)
			BinaryInsertionSort(arr, less, lo, lo+force, lo+run)
			run = force
		}
		ms.pending = append(ms.pending, Run{lo, run})
		ms.mergeCollapse()
		if opts.AfterCollapse != nil {
			opts.AfterCollapse(ms.pending)
		}
		lo += run
	}
	ms.mergeForceCollapse()
}

// TimsortFunc sorts arr in place, stably, ordered by less, with the default options.
func TimsortFunc[T any](arr []T, less func(a, b T) bool) { TimsortWith(arr, less, Options{}) }

// Timsort sorts a slice of ints in place.
func Timsort(arr []int) { TimsortFunc(arr, func(a, b int) bool { return a < b }) }

func main() {
	fmt.Print("minrun for 64, 65, 100, 1000, 2112:")
	for _, n := range []int{64, 65, 100, 1000, 2112} {
		fmt.Print(" ", ComputeMinrun(n))
	}
	fmt.Println()
	arr := []int{5, 6, 7, 8, 9, 3, 2, 1, 10, 11, 4, 12, 13, 0}
	TimsortWith(arr, func(a, b int) bool { return a < b }, Options{MinRun: 4, AfterCollapse: func(runs []Run) {
		fmt.Print("stack:")
		for _, r := range runs {
			fmt.Print(" ", r.Length)
		}
		fmt.Println()
	}})
	fmt.Println("sorted:", arr)
}
