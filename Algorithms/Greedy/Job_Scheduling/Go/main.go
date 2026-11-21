// Package main holds the three greedy job scheduling rules of the Python version:
// JobSchedulingDeadline (profit with unit-time deadlines), JobSchedulingEarliestDeadline
// (earliest deadline first) and JobSchedulingWeightedCompletionTime (Smith's rule).
package main

import (
	"errors"
	"sort"
)

// ErrZeroProcessingTime is returned by JobSchedulingWeightedCompletionTime when a job
// has a processing time of 0, where Python raises ZeroDivisionError.
var ErrZeroProcessingTime = errors.New("jobscheduling: a processing time of 0 has no weight / time ratio")

// JobSchedulingDeadline schedules jobs with deadlines to maximize profit
func JobSchedulingDeadline(jobs [][]int) (int, []int) {
	if len(jobs) == 0 {
		return 0, []int{}
	}

	// Sort jobs by profit (descending)
	sort.Slice(jobs, func(i, j int) bool {
		return jobs[i][2] > jobs[j][2]
	})

	// Find maximum deadline
	maxDeadline := 0
	for _, job := range jobs {
		if job[1] > maxDeadline {
			maxDeadline = job[1]
		}
	}

	// occupied[slot] marks a used time slot (a job id such as -1 cannot double as "empty")
	occupied := make([]bool, maxDeadline+1)

	var scheduled []int
	totalProfit := 0

	for _, job := range jobs {
		jobID := job[0]
		deadline := job[1]
		profit := job[2]

		// Find latest available slot before deadline
		for slot := deadline; slot > 0; slot-- {
			if !occupied[slot] {
				occupied[slot] = true
				scheduled = append(scheduled, jobID)
				totalProfit += profit
				break
			}
		}
	}

	return totalProfit, scheduled
}

// JobSchedulingEarliestDeadline orders jobs by deadline, earliest first. Each job is
// {id, deadline, processingTime}; processingTime is ignored, as in Python. Like
// Python's sorted(), it sorts a copy, and the stable sort keeps input order among
// equal deadlines. No jobs gives an empty slice.
func JobSchedulingEarliestDeadline(jobs [][]int) []int {
	byDeadline := make([][]int, len(jobs))
	copy(byDeadline, jobs)
	sort.SliceStable(byDeadline, func(i, j int) bool {
		return byDeadline[i][1] < byDeadline[j][1]
	})

	order := make([]int, 0, len(jobs))
	for _, job := range byDeadline {
		order = append(order, job[0])
	}
	return order
}

// JobSchedulingWeightedCompletionTime applies Smith's rule. Each job is
// {id, processingTime, weight}; it returns the ids by weight / processingTime, highest
// first, and the sum of weight * completion time. A processing time of 0 returns
// ErrZeroProcessingTime; no jobs gives ([], 0, nil) before any check, as in Python.
func JobSchedulingWeightedCompletionTime(jobs [][]int) ([]int, int, error) {
	if len(jobs) == 0 {
		return []int{}, 0, nil
	}

	// The key is the float64 that Python's x[2] / x[1] gives (exact for values up to
	// 2^53), so ratios that round to one float64 tie here too. Every key is computed
	// before sorting, so any zero fails, as in Python.
	type keyed struct {
		ratio float64
		index int
	}
	keys := make([]keyed, len(jobs))
	for i, job := range jobs {
		if job[1] == 0 {
			return nil, 0, ErrZeroProcessingTime
		}
		keys[i] = keyed{float64(job[2]) / float64(job[1]), i}
	}

	// Python's sorted(..., reverse=True) is stable: equal ratios keep input order.
	sort.SliceStable(keys, func(i, j int) bool {
		return keys[i].ratio > keys[j].ratio
	})

	order := make([]int, 0, len(jobs))
	completionTime := 0
	totalWeighted := 0
	for _, k := range keys {
		job := jobs[k.index]
		order = append(order, job[0])
		completionTime += job[1]
		totalWeighted += job[2] * completionTime
	}
	return order, totalWeighted, nil
}
