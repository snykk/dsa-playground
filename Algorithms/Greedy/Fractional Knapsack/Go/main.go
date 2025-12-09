package main

import "sort"

type Item struct {
	Value, Weight float64
}

// FractionalKnapsack solves fractional knapsack problem
func FractionalKnapsack(items []Item, capacity float64) float64 {
	if len(items) == 0 || capacity <= 0 {
		return 0
	}

	// Sort by value/weight ratio
	sort.Slice(items, func(i, j int) bool {
		return (items[i].Value / items[i].Weight) > (items[j].Value / items[j].Weight)
	})

	totalValue := 0.0
	remaining := capacity

	for _, item := range items {
		if remaining <= 0 {
			break
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

