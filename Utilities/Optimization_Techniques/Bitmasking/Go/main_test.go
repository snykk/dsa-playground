package main

import "testing"

func TestGetBit(t *testing.T) {
	mask := 0b10110
	if !GetBit(mask, 1) {
		t.Error("Bit 1 should be set")
	}
	if GetBit(mask, 0) {
		t.Error("Bit 0 should not be set")
	}
}

func TestSetBit(t *testing.T) {
	mask := 0b10110
	result := SetBit(mask, 0)
	if result != 0b10111 {
		t.Errorf("Expected 0b10111, got %b", result)
	}
}

func TestClearBit(t *testing.T) {
	mask := 0b10110
	result := ClearBit(mask, 1)
	if result != 0b10100 {
		t.Errorf("Expected 0b10100, got %b", result)
	}
}

func TestToggleBit(t *testing.T) {
	mask := 0b10110
	result := ToggleBit(mask, 0)
	if result != 0b10111 {
		t.Errorf("Expected 0b10111, got %b", result)
	}
}

func TestCountBits(t *testing.T) {
	if CountBits(0b10110) != 3 {
		t.Error("Expected 3 bits")
	}
	if CountBits(0) != 0 {
		t.Error("Expected 0 bits")
	}
}

func TestTSP(t *testing.T) {
	dist := [][]int{
		{0, 10, 15, 20},
		{10, 0, 35, 25},
		{15, 35, 0, 30},
		{20, 25, 30, 0},
	}
	result := TSP(dist)
	if result != 80 {
		t.Errorf("Expected 80, got %d", result)
	}
}

func TestCountSubsetSum(t *testing.T) {
	nums := []int{1, 2, 3, 4}
	count := CountSubsetSum(nums, 5)
	if count != 2 {
		t.Errorf("Expected 2, got %d", count)
	}
}

func TestIsPowerOf2(t *testing.T) {
	if !IsPowerOf2(8) {
		t.Error("8 should be power of 2")
	}
	if IsPowerOf2(7) {
		t.Error("7 should not be power of 2")
	}
}

func TestNextPowerOf2(t *testing.T) {
	cases := map[int]int{0: 1, 1: 1, 2: 2, 3: 4, 5: 8, 1000: 1024, 1 << 20: 1 << 20}
	for in, want := range cases {
		if got := NextPowerOf2(in); got != want {
			t.Errorf("NextPowerOf2(%d) = %d, expected %d", in, got, want)
		}
	}
}

func TestNextPowerOf2Beyond32Bits(t *testing.T) {
	if got := NextPowerOf2(1<<32 + 1); got != 1<<33 {
		t.Errorf("NextPowerOf2(2^32+1) = %d, expected %d", got, 1<<33)
	}
	if got := NextPowerOf2(1 << 40); got != 1<<40 {
		t.Errorf("NextPowerOf2(2^40) = %d, expected %d", got, 1<<40)
	}
}

func TestTSPSingleCity(t *testing.T) {
	if got := TSP([][]int{{0}}); got != 0 {
		t.Errorf("TSP with one city = %d, expected 0", got)
	}
	if got := TSP(nil); got != 0 {
		t.Errorf("TSP with no cities = %d, expected 0", got)
	}
}

func TestEnumerateSubsets(t *testing.T) {
	got := EnumerateSubsets(0b101)
	want := []int{0b101, 0b100, 0b001, 0}
	if len(got) != len(want) {
		t.Fatalf("EnumerateSubsets(0b101) = %v, expected %v", got, want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("EnumerateSubsets(0b101)[%d] = %b, expected %b", i, got[i], want[i])
		}
	}
}

func TestSOSDP(t *testing.T) {
	got := SOSDP([]int{1, 2, 3, 4})
	want := []int{1, 3, 4, 10}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("SOSDP[%d] = %d, expected %d", i, got[i], want[i])
		}
	}
}
