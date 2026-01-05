package main

import (
	"reflect"
	"testing"
)

func TestConstantTime(t *testing.T) {
	if ConstantTimeExample(100) != 42 {
		t.Error("Expected 42")
	}
	if ConstantTimeExample(1000) != 42 {
		t.Error("Expected 42")
	}
	if ConstantTimeExample(10000) != 42 {
		t.Error("Expected 42")
	}
}

func TestLogarithmicTime(t *testing.T) {
	if LogarithmicTimeExample(8) != 3 {
		t.Error("Expected 3")
	}
	if LogarithmicTimeExample(16) != 4 {
		t.Error("Expected 4")
	}
	if LogarithmicTimeExample(32) != 5 {
		t.Error("Expected 5")
	}
	if LogarithmicTimeExample(64) != 6 {
		t.Error("Expected 6")
	}
}

func TestLinearTime(t *testing.T) {
	arr1 := []int{1, 2, 3}
	if LinearTimeExample(arr1) != 6 {
		t.Error("Expected 6")
	}

	arr2 := []int{10, 20, 30, 40}
	if LinearTimeExample(arr2) != 100 {
		t.Error("Expected 100")
	}

	arr3 := []int{}
	if LinearTimeExample(arr3) != 0 {
		t.Error("Expected 0")
	}
}

func TestLinearithmicTime(t *testing.T) {
	arr1 := []int{64, 34, 25, 12, 22, 11, 90}
	sorted1 := LinearithmicTimeExample(arr1)
	expected1 := []int{11, 12, 22, 25, 34, 64, 90}
	if !reflect.DeepEqual(sorted1, expected1) {
		t.Errorf("Expected %v, got %v", expected1, sorted1)
	}

	arr2 := []int{5, 2, 8, 1, 9}
	sorted2 := LinearithmicTimeExample(arr2)
	expected2 := []int{1, 2, 5, 8, 9}
	if !reflect.DeepEqual(sorted2, expected2) {
		t.Errorf("Expected %v, got %v", expected2, sorted2)
	}
}

func TestQuadraticTime(t *testing.T) {
	arr := []int{1, 2, 3}
	pairs := QuadraticTimeExample(arr)
	if len(pairs) != 3 { // C(3,2) = 3
		t.Errorf("Expected 3 pairs, got %d", len(pairs))
	}

	arr2 := []int{1, 2, 3, 4}
	pairs2 := QuadraticTimeExample(arr2)
	if len(pairs2) != 6 { // C(4,2) = 6
		t.Errorf("Expected 6 pairs, got %d", len(pairs2))
	}
}

func TestCubicTime(t *testing.T) {
	if CubicTimeExample(1) != 1 {
		t.Error("Expected 1")
	}
	if CubicTimeExample(2) != 8 {
		t.Error("Expected 8")
	}
	if CubicTimeExample(3) != 27 {
		t.Error("Expected 27")
	}
	if CubicTimeExample(5) != 125 {
		t.Error("Expected 125")
	}
}

func TestExponentialTime(t *testing.T) {
	if ExponentialTimeExample(0) != 0 {
		t.Error("Expected 0")
	}
	if ExponentialTimeExample(1) != 1 {
		t.Error("Expected 1")
	}
	if ExponentialTimeExample(2) != 1 {
		t.Error("Expected 1")
	}
	if ExponentialTimeExample(3) != 2 {
		t.Error("Expected 2")
	}
	if ExponentialTimeExample(4) != 3 {
		t.Error("Expected 3")
	}
	if ExponentialTimeExample(5) != 5 {
		t.Error("Expected 5")
	}
	if ExponentialTimeExample(6) != 8 {
		t.Error("Expected 8")
	}
}
