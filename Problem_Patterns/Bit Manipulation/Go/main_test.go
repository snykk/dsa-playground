package main

import "testing"

func TestIsPowerOfTwo(t *testing.T) {
	tests := []struct {
		n    int64
		want bool
	}{
		{1, true}, {2, true}, {4, true}, {1024, true},
		{0, false}, {3, false}, {6, false}, {15, false}, {-4, false},
	}
	for _, tt := range tests {
		if got := IsPowerOfTwo(tt.n); got != tt.want {
			t.Errorf("IsPowerOfTwo(%d) = %v, want %v", tt.n, got, tt.want)
		}
	}
}

func TestCountSetBits(t *testing.T) {
	tests := []struct {
		n    int64
		want int
	}{
		{0, 0}, {1, 1}, {7, 3}, {13, 3}, {255, 8}, {1024, 1},
	}
	for _, tt := range tests {
		if got := CountSetBits(tt.n); got != tt.want {
			t.Errorf("CountSetBits(%d) = %d, want %d", tt.n, got, tt.want)
		}
	}
}

func TestGetBit(t *testing.T) {
	// 13 = 1101
	if GetBit(13, 0) != 1 {
		t.Errorf("GetBit(13, 0) should be 1")
	}
	if GetBit(13, 1) != 0 {
		t.Errorf("GetBit(13, 1) should be 0")
	}
	if GetBit(13, 2) != 1 {
		t.Errorf("GetBit(13, 2) should be 1")
	}
	if GetBit(13, 3) != 1 {
		t.Errorf("GetBit(13, 3) should be 1")
	}
	if GetBit(0, 0) != 0 {
		t.Errorf("GetBit(0, 0) should be 0")
	}
}

func TestSetBit(t *testing.T) {
	if SetBit(0, 0) != 1 {
		t.Errorf("SetBit(0, 0) should be 1")
	}
	if SetBit(0, 3) != 8 {
		t.Errorf("SetBit(0, 3) should be 8")
	}
	if SetBit(8, 1) != 10 {
		t.Errorf("SetBit(8, 1) should be 10")
	}
	if SetBit(7, 0) != 7 {
		t.Errorf("SetBit(7, 0) should be 7 (already set)")
	}
}

func TestClearBit(t *testing.T) {
	if ClearBit(15, 2) != 11 {
		t.Errorf("ClearBit(15, 2) should be 11")
	}
	if ClearBit(7, 1) != 5 {
		t.Errorf("ClearBit(7, 1) should be 5")
	}
	if ClearBit(8, 0) != 8 {
		t.Errorf("ClearBit(8, 0) should be 8 (already clear)")
	}
}

func TestToggleBit(t *testing.T) {
	if ToggleBit(0, 3) != 8 {
		t.Errorf("ToggleBit(0, 3) should be 8")
	}
	if ToggleBit(15, 2) != 11 {
		t.Errorf("ToggleBit(15, 2) should be 11")
	}
	// Double toggle
	if ToggleBit(ToggleBit(42, 3), 3) != 42 {
		t.Errorf("Double toggle should return original value")
	}
}

func TestLowestSetBit(t *testing.T) {
	tests := []struct {
		n    int64
		want int64
	}{
		{12, 4}, {10, 2}, {1, 1}, {8, 8}, {0, 0},
	}
	for _, tt := range tests {
		if got := LowestSetBit(tt.n); got != tt.want {
			t.Errorf("LowestSetBit(%d) = %d, want %d", tt.n, got, tt.want)
		}
	}
}

func TestHighestSetBit(t *testing.T) {
	tests := []struct {
		n    int64
		want int
	}{
		{1, 0}, {8, 3}, {13, 3}, {255, 7}, {0, -1}, {-1, -1},
	}
	for _, tt := range tests {
		if got := HighestSetBit(tt.n); got != tt.want {
			t.Errorf("HighestSetBit(%d) = %d, want %d", tt.n, got, tt.want)
		}
	}
}

func TestCountDifferingBits(t *testing.T) {
	tests := []struct {
		a, b int64
		want int
	}{
		{0, 0, 0}, {1, 4, 2}, {7, 0, 3}, {42, 42, 0}, {7, 10, 3},
	}
	for _, tt := range tests {
		if got := CountDifferingBits(tt.a, tt.b); got != tt.want {
			t.Errorf("CountDifferingBits(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
		}
	}
}

func TestSwapWithoutTemp(t *testing.T) {
	a, b := SwapWithoutTemp(3, 7)
	if a != 7 || b != 3 {
		t.Errorf("SwapWithoutTemp(3, 7) = (%d, %d), want (7, 3)", a, b)
	}
	a, b = SwapWithoutTemp(0, 5)
	if a != 5 || b != 0 {
		t.Errorf("SwapWithoutTemp(0, 5) = (%d, %d), want (5, 0)", a, b)
	}
	a, b = SwapWithoutTemp(4, 4)
	if a != 4 || b != 4 {
		t.Errorf("SwapWithoutTemp(4, 4) = (%d, %d), want (4, 4)", a, b)
	}
}

func TestIsEven(t *testing.T) {
	evens := []int64{0, 2, 100, -4}
	for _, n := range evens {
		if !IsEven(n) {
			t.Errorf("IsEven(%d) should be true", n)
		}
	}
	odds := []int64{1, 3, 99, -1}
	for _, n := range odds {
		if IsEven(n) {
			t.Errorf("IsEven(%d) should be false", n)
		}
	}
}

func TestNextPowerOfTwo(t *testing.T) {
	tests := []struct {
		n    int64
		want int64
	}{
		{0, 1}, {1, 1}, {3, 4}, {5, 8}, {13, 16}, {4, 4}, {16, 16}, {1024, 1024},
	}
	for _, tt := range tests {
		if got := NextPowerOfTwo(tt.n); got != tt.want {
			t.Errorf("NextPowerOfTwo(%d) = %d, want %d", tt.n, got, tt.want)
		}
	}
}

func TestSubsetGeneration(t *testing.T) {
	empty := SubsetGeneration(0)
	if len(empty) != 1 {
		t.Errorf("SubsetGeneration(0) should return 1 subset, got %d", len(empty))
	}

	single := SubsetGeneration(1)
	if len(single) != 2 {
		t.Errorf("SubsetGeneration(1) should return 2 subsets, got %d", len(single))
	}

	three := SubsetGeneration(3)
	if len(three) != 8 {
		t.Errorf("SubsetGeneration(3) should return 8 subsets, got %d", len(three))
	}

	four := SubsetGeneration(4)
	if len(four) != 16 {
		t.Errorf("SubsetGeneration(4) should return 16 subsets, got %d", len(four))
	}
}
