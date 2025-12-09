package main

import "testing"

func TestActivitySelection(t *testing.T) {
	activities := []Activity{
		{1, 4}, {3, 5}, {0, 6}, {5, 7}, {8, 9},
	}
	result := ActivitySelection(activities)
	if len(result) < 3 {
		t.Errorf("Expected at least 3 activities, got %d", len(result))
	}
}

