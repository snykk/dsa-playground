package main

import "testing"

func TestClimbingStairs(t *testing.T) {
	if ClimbingStairs(3) != 3 {
		t.Error("Expected 3")
	}
	if ClimbingStairs(5) != 8 {
		t.Error("Expected 8")
	}
}

