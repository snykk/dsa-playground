package main

import "sort"

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

	// Time slots: -1 means empty
	timeSlots := make([]int, maxDeadline+1)
	for i := range timeSlots {
		timeSlots[i] = -1
	}

	var scheduled []int
	totalProfit := 0

	for _, job := range jobs {
		jobID := job[0]
		deadline := job[1]
		profit := job[2]

		// Find latest available slot before deadline
		for slot := deadline; slot > 0; slot-- {
			if timeSlots[slot] == -1 {
				timeSlots[slot] = jobID
				scheduled = append(scheduled, jobID)
				totalProfit += profit
				break
			}
		}
	}

	return totalProfit, scheduled
}
