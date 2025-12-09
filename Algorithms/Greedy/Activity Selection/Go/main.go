package main

import "sort"

type Activity struct {
	Start, Finish int
}

// ActivitySelection selects maximum number of non-overlapping activities
// Time Complexity: O(n log n)
func ActivitySelection(activities []Activity) []int {
	if len(activities) == 0 {
		return []int{}
	}

	// Create indexed slice
	type indexedActivity struct {
		idx int
		act Activity
	}
	indexed := make([]indexedActivity, len(activities))
	for i, act := range activities {
		indexed[i] = indexedActivity{i, act}
	}

	// Sort by finish time
	sort.Slice(indexed, func(i, j int) bool {
		return indexed[i].act.Finish < indexed[j].act.Finish
	})

	selected := []int{indexed[0].idx}
	lastFinish := indexed[0].act.Finish

	// Select activities that don't overlap
	for i := 1; i < len(indexed); i++ {
		if indexed[i].act.Start >= lastFinish {
			selected = append(selected, indexed[i].idx)
			lastFinish = indexed[i].act.Finish
		}
	}

	return selected
}

