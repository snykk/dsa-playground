package main

import (
	"reflect"
	"testing"
)

func TestActivitySelection(t *testing.T) {
	activities := []Activity{
		{1, 4}, {3, 5}, {0, 6}, {5, 7}, {8, 9},
	}
	result := ActivitySelection(activities)
	want := []int{0, 3, 4}
	if !reflect.DeepEqual(result, want) {
		t.Errorf("got %v, want %v", result, want)
	}
}

func TestActivitySelectionTouching(t *testing.T) {
	// An activity may start exactly when the previous one finishes.
	result := ActivitySelection([]Activity{{1, 2}, {2, 3}, {3, 4}})
	if !reflect.DeepEqual(result, []int{0, 1, 2}) {
		t.Errorf("got %v, want [0 1 2]", result)
	}
}

func TestActivitySelectionEmptyAndSingle(t *testing.T) {
	if got := ActivitySelection(nil); len(got) != 0 {
		t.Errorf("empty input: got %v", got)
	}
	if got := ActivitySelection([]Activity{{-4, -2}}); !reflect.DeepEqual(got, []int{0}) {
		t.Errorf("single negative-time activity: got %v", got)
	}
}

func TestActivitySelectionKeepsInputOrder(t *testing.T) {
	activities := []Activity{{5, 7}, {1, 4}}
	ActivitySelection(activities)
	if activities[0] != (Activity{5, 7}) || activities[1] != (Activity{1, 4}) {
		t.Errorf("input was reordered: %v", activities)
	}
}
