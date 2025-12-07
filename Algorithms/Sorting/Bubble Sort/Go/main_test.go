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

