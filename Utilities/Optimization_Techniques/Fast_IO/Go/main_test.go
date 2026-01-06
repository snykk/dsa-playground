package main

import (
	"bufio"
	"bytes"
	"testing"
)

func TestReadInt(t *testing.T) {
	input := bytes.NewBufferString("42\n")
	reader = bufio.NewReader(input)
	result := readInt()
	if result != 42 {
		t.Errorf("Expected 42, got %d", result)
	}
}

func TestReadInts(t *testing.T) {
	input := bytes.NewBufferString("1 2 3 4 5\n")
	reader = bufio.NewReader(input)
	result := readInts(5)
	expected := []int{1, 2, 3, 4, 5}
	for i, v := range expected {
		if result[i] != v {
			t.Errorf("Expected %d, got %d", v, result[i])
		}
	}
}
