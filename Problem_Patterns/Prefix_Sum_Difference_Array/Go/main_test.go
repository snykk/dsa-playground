package main

import "testing"

func TestPrefixSum(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5}
	ps := NewPrefixSum(arr)
	if ps.Query(0, 4) != 15 {
		t.Errorf("Query failed")
	}
}

func TestPrefixSumRanges(t *testing.T) {
	ps := NewPrefixSum([]int{3, 1, 4, 1, 5})
	cases := []struct{ l, r, want int }{{1, 3, 6}, {0, 0, 3}, {4, 4, 5}, {0, 4, 14}}
	for _, c := range cases {
		if got := ps.Query(c.l, c.r); got != c.want {
			t.Errorf("Query(%d, %d) = %d, want %d", c.l, c.r, got, c.want)
		}
	}
}

func TestDifferenceArray(t *testing.T) {
	da := NewDifferenceArray(5)
	da.Update(0, 2, 5)
	da.Update(1, 3, 3)
	want := []int{5, 8, 8, 3, 0}
	got := da.GetArray()
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("GetArray() = %v, want %v", got, want)
		}
	}

	// an update that reaches the last cell
	tail := NewDifferenceArray(4)
	tail.Update(1, 3, 10)
	want = []int{0, 10, 10, 10}
	got = tail.GetArray()
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("GetArray() = %v, want %v", got, want)
		}
	}
}
