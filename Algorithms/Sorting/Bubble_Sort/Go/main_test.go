package main

import (
	"reflect"
	"testing"
)

func TestBubbleSort(t *testing.T) {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	expected := []int{11, 12, 22, 25, 34, 64, 90}
	
	BubbleSort(arr)
	
	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}

func TestBubbleSortAlreadySorted(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5}
	expected := []int{1, 2, 3, 4, 5}
	
	BubbleSort(arr)
	
	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}

func TestBubbleSortEmpty(t *testing.T) {
	arr := []int{}
	BubbleSort(arr)
	
	if len(arr) != 0 {
		t.Error("Expected empty array")
	}
}

func TestBubbleSortSingleElement(t *testing.T) {
	arr := []int{42}
	expected := []int{42}
	
	BubbleSort(arr)
	
	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}


func TestBubbleSortDuplicatesAndNegatives(t *testing.T) {
	arr := []int{3, -1, 3, 0, -1, 2, 2}
	expected := []int{-1, -1, 0, 2, 2, 3, 3}

	BubbleSort(arr)

	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}

func TestBubbleSortGenericIsStable(t *testing.T) {
	type rec struct {
		key int
		tag string
	}
	arr := []rec{{2, "a"}, {1, "x"}, {2, "b"}, {1, "y"}, {2, "c"}}
	expected := []rec{{1, "x"}, {1, "y"}, {2, "a"}, {2, "b"}, {2, "c"}}

	BubbleSortGeneric(arr, func(a, b rec) bool { return a.key < b.key })

	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}
