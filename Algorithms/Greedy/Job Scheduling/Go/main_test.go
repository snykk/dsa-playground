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

