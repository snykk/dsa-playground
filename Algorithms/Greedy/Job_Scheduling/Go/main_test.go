package main

import (
	"errors"
	"fmt"
	"math"
	"math/rand"
	"reflect"
	"sort"
	"strings"
	"testing"
)

func TestJobSchedulingDeadline(t *testing.T) {
	jobs := [][]int{
		{1, 2, 100},
		{2, 1, 19},
		{3, 2, 27},
	}
	profit, scheduled := JobSchedulingDeadline(jobs)
	// 100 takes slot 2, 27 takes slot 1; 19 (deadline 1) finds no free slot
	if profit != 127 || !reflect.DeepEqual(scheduled, []int{1, 3}) {
		t.Errorf("Expected (127, [1 3]), got (%d, %v)", profit, scheduled)
	}
}

func TestJobSchedulingDeadlineClassic(t *testing.T) {
	jobs := [][]int{{1, 2, 100}, {2, 1, 19}, {3, 2, 27}, {4, 1, 25}, {5, 3, 15}}
	profit, scheduled := JobSchedulingDeadline(jobs)
	if profit != 142 || !reflect.DeepEqual(scheduled, []int{1, 3, 5}) {
		t.Errorf("Expected (142, [1 3 5]), got (%d, %v)", profit, scheduled)
	}
}

func TestJobSchedulingDeadlineEmptyAndZeroDeadline(t *testing.T) {
	if profit, scheduled := JobSchedulingDeadline(nil); profit != 0 || len(scheduled) != 0 {
		t.Errorf("Expected (0, []), got (%d, %v)", profit, scheduled)
	}
	profit, scheduled := JobSchedulingDeadline([][]int{{1, 0, 50}, {2, 1, 5}})
	if profit != 5 || !reflect.DeepEqual(scheduled, []int{2}) {
		t.Errorf("Expected (5, [2]), got (%d, %v)", profit, scheduled)
	}
}

// Regression: -1 doubled as the "empty slot" marker, so a job with id -1
// left its slot looking free and a second job was booked into it.
func TestJobSchedulingDeadlineNegativeID(t *testing.T) {
	profit, scheduled := JobSchedulingDeadline([][]int{{-1, 1, 100}, {2, 1, 50}})
	if profit != 100 || len(scheduled) != 1 || scheduled[0] != -1 {
		t.Errorf("Expected (100, [-1]), got (%d, %v)", profit, scheduled)
	}
	profit, scheduled = JobSchedulingDeadline([][]int{{-1, 2, 100}, {2, 1, 50}, {3, 2, 40}})
	if profit != 150 || len(scheduled) != 2 || scheduled[0] != -1 || scheduled[1] != 2 {
		t.Errorf("Expected (150, [-1 2]), got (%d, %v)", profit, scheduled)
	}
}

// The best feasible subset over every subset of up to 7 jobs, checked slot by slot.
func TestJobSchedulingDeadlineMatchesBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(3))
	for run := 0; run < 200; run++ {
		n := 1 + rng.Intn(7)
		jobs := make([][]int, n)
		for i := range jobs {
			jobs[i] = []int{i, 1 + rng.Intn(5), 1 + rng.Intn(30)}
		}
		best := 0
		for mask := 0; mask < 1<<n; mask++ {
			var chosen [][]int
			for i := 0; i < n; i++ {
				if mask>>i&1 == 1 {
					chosen = append(chosen, jobs[i])
				}
			}
			sort.Slice(chosen, func(a, b int) bool { return chosen[a][1] < chosen[b][1] })
			feasible := true
			sum := 0
			for k, job := range chosen {
				feasible = feasible && k+1 <= job[1]
				sum += job[2]
			}
			if feasible && sum > best {
				best = sum
			}
		}
		input := fmt.Sprint(jobs)
		// JobSchedulingDeadline sorts its argument in place, so it gets a copy.
		if profit, _ := JobSchedulingDeadline(clone(jobs)); profit != best {
			t.Fatalf("jobs %s: profit %d, best feasible subset %d", input, profit, best)
		}
	}
}

func TestJobSchedulingEarliestDeadline(t *testing.T) {
	jobs := [][]int{{1, 4, 5}, {2, 2, 3}, {3, 6, 4}}
	if got := JobSchedulingEarliestDeadline(jobs); !reflect.DeepEqual(got, []int{2, 1, 3}) {
		t.Errorf("Expected [2 1 3], got %v", got)
	}
	// A copy is sorted, as in Python: the argument keeps its order.
	if !reflect.DeepEqual(jobs, [][]int{{1, 4, 5}, {2, 2, 3}, {3, 6, 4}}) {
		t.Errorf("the input was reordered: %v", jobs)
	}
	if got := JobSchedulingEarliestDeadline(nil); got == nil || len(got) != 0 {
		t.Errorf("Expected an empty slice, got %#v", got)
	}
}

func TestJobSchedulingWeightedCompletionTime(t *testing.T) {
	jobs := [][]int{{1, 3, 10}, {2, 1, 20}, {3, 2, 15}}
	order, total, err := JobSchedulingWeightedCompletionTime(jobs)
	// Ratios weight / time: 20, 7.5, 3.33; completion times 1, 3, 6
	if err != nil || !reflect.DeepEqual(order, []int{2, 3, 1}) || total != 20*1+15*3+10*6 {
		t.Errorf("Expected ([2 3 1], 125, nil), got (%v, %d, %v)", order, total, err)
	}
	if !reflect.DeepEqual(jobs, [][]int{{1, 3, 10}, {2, 1, 20}, {3, 2, 15}}) {
		t.Errorf("the input was reordered: %v", jobs)
	}
	order, total, err = JobSchedulingWeightedCompletionTime(nil)
	if err != nil || order == nil || len(order) != 0 || total != 0 {
		t.Errorf("Expected ([], 0, nil), got (%#v, %d, %v)", order, total, err)
	}
}

// Python raises ZeroDivisionError for a processing time of 0, whatever the weight
// and wherever the job stands; the Go port returns ErrZeroProcessingTime.
func TestJobSchedulingWeightedCompletionTimeZeroProcessingTime(t *testing.T) {
	for _, jobs := range [][][]int{{{1, 0, 5}}, {{1, 2, 3}, {2, 0, 4}}, {{1, 0, 0}}} {
		order, total, err := JobSchedulingWeightedCompletionTime(jobs)
		if !errors.Is(err, ErrZeroProcessingTime) || order != nil || total != 0 {
			t.Errorf("jobs %v: expected (nil, 0, ErrZeroProcessingTime), got (%v, %d, %v)", jobs, order, total, err)
		}
	}
}

// Outputs computed by running the Python implementation: fixed cases first, then
// seeded random ones with many ties, negative values and repeated ids.
var edfAgreement = []struct {
	jobs  [][]int // {id, deadline, processingTime}
	order []int
}{
	{[][]int{{1, 4, 5}, {2, 2, 3}, {3, 6, 4}}, []int{2, 1, 3}},
	{[][]int{{5, 3, 1}, {6, 1, 9}, {7, 3, 2}, {8, -1, 0}}, []int{8, 6, 5, 7}},
	{[][]int{{3, 2, 1}, {1, 2, 1}, {2, 2, 1}}, []int{3, 1, 2}},
	{[][]int{{9, 0, 0}}, []int{9}},
	{[][]int{{-1, 5, 1}, {-1, 2, 1}, {0, 5, 0}}, []int{-1, -1, 0}},
	{[][]int{{1, 5, 1}, {2, 4, 1}, {3, 3, 1}, {4, 2, 1}, {5, 1, 1}}, []int{5, 4, 3, 2, 1}},
	{[][]int{{11, 2, 0}, {3, -1, 1}, {3, -2, 1}}, []int{3, 3, 11}},
	{[][]int{{-4, 2, 1}, {11, -2, 4}, {6, 1, 1}, {6, 3, 1}, {-4, 0, 4}}, []int{11, -4, 6, -4, 6}},
	{[][]int{{7, 3, 4}}, []int{7}},
	{[][]int{{-1, 0, 3}, {9, -2, 0}}, []int{9, -1}},
	{[][]int{{14, -1, 1}, {2, 3, 4}}, []int{14, 2}},
	{[][]int{{4, 2, 0}, {3, 0, 1}, {7, -2, 0}}, []int{7, 3, 4}},
	{[][]int{{2, -2, 2}}, []int{2}},
	{[][]int{{8, 1, 3}, {19, 2, 4}}, []int{8, 19}},
	{[][]int{{6, 0, 0}, {1, 0, 4}, {1, -1, 4}, {9, 1, 4}, {5, 0, 0}, {16, 3, 4}, {19, 2, 2}}, []int{1, 6, 1, 5, 9, 19, 16}},
	{[][]int{{18, -2, 0}, {1, -1, 3}, {5, 3, 4}, {11, 0, 1}, {3, -1, 0}, {10, 2, 3}}, []int{18, 1, 3, 11, 10, 5}},
	{[][]int{{-1, 2, 0}, {1, 3, 3}}, []int{-1, 1}},
	{[][]int{{9, 1, 2}, {4, 1, 4}, {18, 0, 4}}, []int{18, 9, 4}},
	{[][]int{{12, 1, 0}, {8, -1, 3}, {4, 3, 4}, {11, 3, 2}}, []int{8, 12, 4, 11}},
	{[][]int{{-5, -2, 3}, {8, -2, 2}, {2, 0, 4}, {17, -1, 3}, {16, 2, 4}, {6, 2, 3}}, []int{-5, 8, 17, 2, 16, 6}},
	{[][]int{{4, 1, 0}}, []int{4}},
	{[][]int{{12, 3, 2}, {4, 3, 4}, {11, 0, 0}, {3, 1, 2}, {8, 3, 2}}, []int{11, 3, 12, 4, 8}},
	{[][]int{{13, -2, 4}, {9, 2, 3}, {-3, 3, 2}}, []int{13, 9, -3}},
	{[][]int{{0, 1, 4}, {20, 1, 3}, {0, 1, 3}, {9, -1, 4}}, []int{9, 0, 20, 0}},
	{[][]int{{-1, -2, 4}, {-3, 2, 3}, {2, -1, 1}, {1, 1, 0}, {6, -1, 0}, {10, 3, 1}, {-1, 3, 1}}, []int{-1, 2, 6, 1, -3, 10, -1}},
	{[][]int{{19, 3, 0}, {10, 2, 0}, {-5, -2, 2}, {7, -2, 2}, {15, 3, 2}, {12, 0, 0}}, []int{-5, 7, 12, 10, 19, 15}},
}

var smithAgreement = []struct {
	jobs  [][]int // {id, processingTime, weight}
	order []int
	total int
}{
	{[][]int{{1, 3, 10}, {2, 1, 20}, {3, 2, 15}}, []int{2, 3, 1}, 125},
	{[][]int{{1, 3, 1}, {2, 1, 2}, {3, 2, 3}}, []int{2, 3, 1}, 17},
	{[][]int{{1, 2, 4}, {2, 1, 2}, {3, 3, 6}, {4, 1, 5}}, []int{4, 1, 2, 3}, 67},
	{[][]int{{1, 6, 2}, {2, 3, 1}, {3, 9, 3}}, []int{1, 2, 3}, 75},
	{[][]int{{1, -2, 3}, {2, 1, 0}}, []int{2, 1}, -3},
	{[][]int{{1, 1, 0}, {2, -1, 0}}, []int{1, 2}, 0},
	{[][]int{{1, 4, 0}, {2, 2, 0}, {3, 1, 1}}, []int{3, 1, 2}, 1},
	{[][]int{{7, 5, 3}}, []int{7}, 15},
	{[][]int{{1, 134217730, 134217729}, {2, 134217731, 134217730}}, []int{1, 2}, 54043197139058700},
	{[][]int{{6, 2, 1}, {19, 1, 6}, {4, 6, -2}, {4, -3, 3}, {19, 2, 6}, {13, -3, 1}}, []int{19, 19, 6, 4, 13, 4}, 30},
	{[][]int{{5, 1, 1}, {5, 4, 1}, {5, 1, 6}, {15, 6, -2}, {2, 2, 5}, {1, 6, 3}, {-2, 3, 5}}, []int{5, 2, -2, 5, 1, 5, 15}, 68},
	{[][]int{{20, 6, 6}, {10, 2, 5}, {17, 4, 1}}, []int{10, 20, 17}, 70},
	{[][]int{{0, -2, 1}, {14, 4, -2}, {1, -3, 5}}, []int{0, 14, 1}, -11},
	{[][]int{{-2, 1, 3}}, []int{-2}, 3},
	{[][]int{{-1, -2, -1}, {0, 1, 6}, {14, 1, -2}, {10, 1, 2}, {19, 1, 4}, {13, -3, -1}, {20, 4, -3}}, []int{0, 19, 10, -1, 13, 20, 14}, 9},
	{[][]int{{7, 4, 0}, {2, 2, 0}, {18, 6, 6}, {13, 6, 1}, {1, -2, 2}, {13, 1, -1}, {16, 1, -1}}, []int{18, 13, 7, 2, 1, 13, 16}, 45},
	{[][]int{{0, 2, 5}, {9, 3, 3}, {15, 3, 5}, {-3, 6, -3}, {0, -1, 1}, {16, 3, 2}, {12, 3, 1}}, []int{0, 15, 9, 16, 12, -3, 0}, 54},
	{[][]int{{4, -1, 1}, {18, -3, 1}, {3, -3, 1}, {8, -2, 5}, {1, 6, 5}, {15, -3, 5}}, []int{1, 18, 3, 4, 15, 8}, -18},
	{[][]int{{1, 3, 5}}, []int{1}, 15},
	{[][]int{{10, -3, 6}, {10, 6, 6}, {11, -3, -1}, {8, 6, 0}, {9, -2, 2}, {5, -3, 0}, {-2, -2, -2}}, []int{10, -2, 11, 8, 5, 9, 10}, 25},
	{[][]int{{18, -2, -2}}, []int{18}, 4},
	{[][]int{{16, 2, 3}, {2, -1, 2}}, []int{16, 2}, 8},
	{[][]int{{-1, 6, 0}}, []int{-1}, 0},
	{[][]int{{0, -1, 1}}, []int{0}, -1},
	{[][]int{{-3, 1, -2}, {20, 2, 0}, {11, 6, -2}, {0, -2, -2}}, []int{0, 20, 11, -3}, -22},
	{[][]int{{14, 3, 5}, {6, -1, 1}, {11, 3, -2}, {0, 6, 2}, {-3, 6, -3}, {20, -2, -3}}, []int{14, 20, 0, -3, 11, 6}, -30},
	{[][]int{{-5, 4, 6}, {14, -1, -3}}, []int{14, -5}, 21},
	{[][]int{{16, 1, 0}}, []int{16}, 0},
	{[][]int{{6, -1, 1}, {-1, 4, 1}, {19, 1, 3}}, []int{19, -1, 6}, 12},
}

func TestAgreementWithPython(t *testing.T) {
	var problems []string
	for i, c := range edfAgreement {
		if got := JobSchedulingEarliestDeadline(c.jobs); !reflect.DeepEqual(got, c.order) {
			problems = append(problems, fmt.Sprintf("earliest deadline case %d %v: got %v, Python %v", i, c.jobs, got, c.order))
		}
	}
	for i, c := range smithAgreement {
		order, total, err := JobSchedulingWeightedCompletionTime(c.jobs)
		if err != nil || !reflect.DeepEqual(order, c.order) || total != c.total {
			problems = append(problems, fmt.Sprintf("weighted completion case %d %v: got (%v, %d, %v), Python (%v, %d)",
				i, c.jobs, order, total, err, c.order, c.total))
		}
	}
	if len(problems) > 0 {
		t.Error(strings.Join(problems, "\n"))
	}
}

func clone(jobs [][]int) [][]int {
	out := make([][]int, len(jobs))
	for i, job := range jobs {
		out[i] = append([]int(nil), job...)
	}
	return out
}

// permutations calls visit with every order of 0..n-1, in lexicographic order.
func permutations(n int, visit func(order []int)) {
	order := make([]int, n)
	used := make([]bool, n)
	var place func(pos int)
	place = func(pos int) {
		if pos == n {
			visit(order)
			return
		}
		for i := 0; i < n; i++ {
			if !used[i] {
				used[i] = true
				order[pos] = i
				place(pos + 1)
				used[i] = false
			}
		}
	}
	place(0)
}

// maxLateness is the largest completion time - deadline, run in the given order.
func maxLateness(jobs [][]int, order []int) int {
	time, worst := 0, math.MinInt
	for _, index := range order {
		time += jobs[index][2]
		worst = max(worst, time-jobs[index][1])
	}
	return worst
}

// Every order of up to 6 jobs: EDF reaches the smallest maximum lateness, and its
// order is the first one (by input position) that sorts the deadlines, which is the
// order a stable sort gives.
func TestJobSchedulingEarliestDeadlineMatchesBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	for run := 0; run < 200; run++ {
		n := 1 + rng.Intn(6)
		jobs := make([][]int, n) // the id is the input position
		for i := range jobs {
			jobs[i] = []int{i, rng.Intn(9) - 2, 1 + rng.Intn(5)}
		}
		got := JobSchedulingEarliestDeadline(jobs)

		best := math.MaxInt
		var firstSorted []int
		permutations(n, func(order []int) {
			best = min(best, maxLateness(jobs, order))
			sorted := true
			for k := 0; k+1 < n; k++ {
				sorted = sorted && jobs[order[k]][1] <= jobs[order[k+1]][1]
			}
			if sorted && firstSorted == nil {
				firstSorted = append([]int(nil), order...)
			}
		})

		if lateness := maxLateness(jobs, got); lateness != best || !reflect.DeepEqual(got, firstSorted) {
			t.Fatalf("jobs %v: got %v (max lateness %d), want %v (max lateness %d)", jobs, got, lateness, firstSorted, best)
		}
	}
}

// weightedCost is the sum of weight * completion time, run in the given order.
func weightedCost(jobs [][]int, order []int) int {
	time, cost := 0, 0
	for _, index := range order {
		time += jobs[index][1]
		cost += jobs[index][2] * time
	}
	return cost
}

// Every order of up to 6 jobs: Smith's rule reaches the smallest cost, reports the
// cost of the order it returns, and that order is the first one (by input position)
// whose exact ratios w / p never increase, which is the order a stable sort gives.
func TestJobSchedulingWeightedCompletionTimeMatchesBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(5))
	for run := 0; run < 200; run++ {
		n := 1 + rng.Intn(6)
		jobs := make([][]int, n) // the id is the input position
		for i := range jobs {
			jobs[i] = []int{i, 1 + rng.Intn(6), rng.Intn(13) - 3}
		}
		got, total, err := JobSchedulingWeightedCompletionTime(jobs)
		if err != nil {
			t.Fatalf("jobs %v: unexpected error %v", jobs, err)
		}

		best := math.MaxInt
		var firstSorted []int
		permutations(n, func(order []int) {
			best = min(best, weightedCost(jobs, order))
			sorted := true
			for k := 0; k+1 < n; k++ {
				a, b := jobs[order[k]], jobs[order[k+1]]
				// w_a / p_a >= w_b / p_b with both times positive
				sorted = sorted && a[2]*b[1] >= b[2]*a[1]
			}
			if sorted && firstSorted == nil {
				firstSorted = append([]int(nil), order...)
			}
		})

		if total != weightedCost(jobs, got) || total != best || !reflect.DeepEqual(got, firstSorted) {
			t.Fatalf("jobs %v: got (%v, %d) (cost of that order %d), want (%v, %d)",
				jobs, got, total, weightedCost(jobs, got), firstSorted, best)
		}
	}
}

// Small inputs hide an unstable sort (sort.Slice uses insertion sort below 13
// elements), so 60 jobs with many equal keys check the tie order: keys in order,
// and input positions increasing among equal keys.
func TestLargeInputsKeepInputOrderAmongTies(t *testing.T) {
	rng := rand.New(rand.NewSource(11))
	for run := 0; run < 20; run++ {
		edf := make([][]int, 60) // the id is the input position
		smith := make([][]int, 60)
		for i := range edf {
			edf[i] = []int{i, rng.Intn(4), 1 + rng.Intn(5)}
			smith[i] = []int{i, 1 + rng.Intn(3), rng.Intn(4)}
		}
		var problems []string
		order := JobSchedulingEarliestDeadline(edf)
		for k := 0; k+1 < len(order); k++ {
			da, db := edf[order[k]][1], edf[order[k+1]][1]
			if !(da < db || (da == db && order[k] < order[k+1])) {
				problems = append(problems, fmt.Sprintf("earliest deadline: job %d (deadline %d) before job %d (deadline %d)",
					order[k], da, order[k+1], db))
			}
		}
		order, _, _ = JobSchedulingWeightedCompletionTime(smith)
		for k := 0; k+1 < len(order); k++ {
			a, b := smith[order[k]], smith[order[k+1]]
			left, right := a[2]*b[1], b[2]*a[1] // w_a * p_b, w_b * p_a
			if !(left > right || (left == right && order[k] < order[k+1])) {
				problems = append(problems, fmt.Sprintf("weighted completion: job %d (%d/%d) before job %d (%d/%d)",
					order[k], a[2], a[1], order[k+1], b[2], b[1]))
			}
		}
		if len(problems) > 0 {
			t.Fatalf("run %d:\n%s", run, strings.Join(problems, "\n"))
		}
	}
}
