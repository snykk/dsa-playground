package main

import "testing"

func TestLCSLength(t *testing.T) {
	if LCSLength("ABCDGH", "AEDFHR") != 3 {
		t.Error("Expected 3")
	}
}

