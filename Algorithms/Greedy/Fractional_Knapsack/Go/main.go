package main

import (
	"math"
	"sort"
)

type Item struct {
	Value, Weight float64
}

// FractionalKnapsack solves fractional knapsack problem
func FractionalKnapsack(items []Item, capacity float64) float64 {
	if len(items) == 0 || capacity <= 0 {
		return 0
	}

	// Sort by value/weight ratio. A zero-weight item uses no capacity: its
	// ratio is infinite (0/0 would be NaN), so it is taken first.
	ratio := func(it Item) float64 {
		if it.Weight == 0 {
			return math.Inf(1)
		}
		return it.Value / it.Weight
	}
	sort.Slice(items, func(i, j int) bool {
		return ratio(items[i]) > ratio(items[j])
	})

	totalValue := 0.0
	remaining := capacity

	for _, item := range items {
		if remaining <= 0 {
			break
		}
		if item.Weight == 0 { // free item: take all of it (take/weight would be 0/0)
			totalValue += item.Value
			continue
		}

		take := item.Weight
		if item.Weight > remaining {
			take = remaining
		}

		totalValue += item.Value * (take / item.Weight)
		remaining -= take
	}

	return totalValue
}
