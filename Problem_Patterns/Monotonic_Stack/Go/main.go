package main

import (
	"fmt"
)

// NextGreaterElement finds the next greater element to the right for each element.
// Returns -1 if no greater element exists.
// Time Complexity: O(n)
// Space Complexity: O(n)
func NextGreaterElement(arr []int) []int {
	n := len(arr)
	result := make([]int, n)
	for i := range result {
		result[i] = -1
	}
	stack := []int{} // stores indices

	for i := 0; i < n; i++ {
		for len(stack) > 0 && arr[stack[len(stack)-1]] < arr[i] {
			top := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			result[top] = arr[i]
		}
		stack = append(stack, i)
	}

	return result
}

// NextSmallerElement finds the next smaller element to the right for each element.
// Returns -1 if no smaller element exists.
// Time Complexity: O(n)
// Space Complexity: O(n)
func NextSmallerElement(arr []int) []int {
	n := len(arr)
	result := make([]int, n)
	for i := range result {
		result[i] = -1
	}
	stack := []int{} // stores indices

	for i := 0; i < n; i++ {
		for len(stack) > 0 && arr[stack[len(stack)-1]] > arr[i] {
			top := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			result[top] = arr[i]
		}
		stack = append(stack, i)
	}

	return result
}

// PreviousGreaterElement finds the previous greater element to the left for each element.
// Returns -1 if no greater element exists.
// Time Complexity: O(n)
// Space Complexity: O(n)
func PreviousGreaterElement(arr []int) []int {
	n := len(arr)
	result := make([]int, n)
	for i := range result {
		result[i] = -1
	}
	stack := []int{} // stores indices

	for i := 0; i < n; i++ {
		for len(stack) > 0 && arr[stack[len(stack)-1]] <= arr[i] {
			stack = stack[:len(stack)-1]
		}
		if len(stack) > 0 {
			result[i] = arr[stack[len(stack)-1]]
		}
		stack = append(stack, i)
	}

	return result
}

// PreviousSmallerElement finds the previous smaller element to the left for each element.
// Returns -1 if no smaller element exists.
// Time Complexity: O(n)
// Space Complexity: O(n)
func PreviousSmallerElement(arr []int) []int {
	n := len(arr)
	result := make([]int, n)
	for i := range result {
		result[i] = -1
	}
	stack := []int{} // stores indices

	for i := 0; i < n; i++ {
		for len(stack) > 0 && arr[stack[len(stack)-1]] >= arr[i] {
			stack = stack[:len(stack)-1]
		}
		if len(stack) > 0 {
			result[i] = arr[stack[len(stack)-1]]
		}
		stack = append(stack, i)
	}

	return result
}

// LargestRectangleHistogram finds the largest rectangular area in a histogram.
// Uses a monotonic increasing stack to find, for each bar, the nearest
// shorter bar on both sides.
// Time Complexity: O(n)
// Space Complexity: O(n)
func LargestRectangleHistogram(heights []int) int {
	stack := []int{} // stores indices
	maxArea := 0
	n := len(heights)

	for i := 0; i < n; i++ {
		for len(stack) > 0 && heights[stack[len(stack)-1]] >= heights[i] {
			top := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			height := heights[top]
			width := i
			if len(stack) > 0 {
				width = i - stack[len(stack)-1] - 1
			}
			area := height * width
			if area > maxArea {
				maxArea = area
			}
		}
		stack = append(stack, i)
	}

	// Process remaining elements in stack
	for len(stack) > 0 {
		top := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		height := heights[top]
		width := n
		if len(stack) > 0 {
			width = n - stack[len(stack)-1] - 1
		}
		area := height * width
		if area > maxArea {
			maxArea = area
		}
	}

	return maxArea
}

// DailyTemperatures finds how many days until a warmer temperature for each day.
// Returns 0 if no warmer day exists.
// Time Complexity: O(n)
// Space Complexity: O(n)
func DailyTemperatures(temperatures []int) []int {
	n := len(temperatures)
	result := make([]int, n)
	stack := []int{} // stores indices

	for i := 0; i < n; i++ {
		for len(stack) > 0 && temperatures[stack[len(stack)-1]] < temperatures[i] {
			prev := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			result[prev] = i - prev
		}
		stack = append(stack, i)
	}

	return result
}

// StockSpan finds the span for each day (consecutive days with price <= current day,
// including the current day).
// Time Complexity: O(n)
// Space Complexity: O(n)
func StockSpan(prices []int) []int {
	n := len(prices)
	result := make([]int, n)
	stack := []int{} // stores indices

	for i := 0; i < n; i++ {
		for len(stack) > 0 && prices[stack[len(stack)-1]] <= prices[i] {
			stack = stack[:len(stack)-1]
		}
		if len(stack) == 0 {
			result[i] = i + 1
		} else {
			result[i] = i - stack[len(stack)-1]
		}
		stack = append(stack, i)
	}

	return result
}

func main() {
	fmt.Println("Monotonic Stack Examples:")
	fmt.Println()

	// Next Greater Element
	arr := []int{4, 5, 2, 10, 8}
	result := NextGreaterElement(arr)
	fmt.Printf("Next Greater Element of %v: %v\n", arr, result)
	fmt.Println()

	// Largest Rectangle in Histogram
	heights := []int{2, 1, 5, 6, 2, 3}
	area := LargestRectangleHistogram(heights)
	fmt.Printf("Largest Rectangle in Histogram %v: %d\n", heights, area)
	fmt.Println()

	// Daily Temperatures
	temps := []int{73, 74, 75, 71, 69, 72, 76, 73}
	tempResult := DailyTemperatures(temps)
	fmt.Printf("Daily Temperatures %v: %v\n", temps, tempResult)
	fmt.Println()

	// Stock Span
	prices := []int{100, 80, 60, 70, 60, 75, 85}
	spanResult := StockSpan(prices)
	fmt.Printf("Stock Span %v: %v\n", prices, spanResult)
}
