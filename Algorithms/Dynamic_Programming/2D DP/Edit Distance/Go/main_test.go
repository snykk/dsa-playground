package main

import "testing"

func TestEditDistance(t *testing.T) {
	if EditDistance("kitten", "sitting") != 3 {
		t.Error("Expected 3")
	}
}

