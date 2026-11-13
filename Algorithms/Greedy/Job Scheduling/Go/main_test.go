package main

import "testing"

func TestJobSchedulingDeadline(t *testing.T) {
	jobs := [][]int{
		{1, 2, 100},
		{2, 1, 19},
		{3, 2, 27},
	}
	profit, scheduled := JobSchedulingDeadline(jobs)
	if profit < 0 {
		t.Error("Expected non-negative profit")
	}
	if len(scheduled) == 0 {
		t.Error("Expected at least one scheduled job")
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
