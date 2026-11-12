package main

import (
	"reflect"
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
