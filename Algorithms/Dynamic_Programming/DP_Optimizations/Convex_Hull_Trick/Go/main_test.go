package main

import (
	"math/rand"
	"testing"
)

func bruteMin(lines []Line, x int64) int64 {
	best := lines[0].M*x + lines[0].B
	for _, l := range lines {
		v := l.M*x + l.B
		if v < best {
			best = v
		}
	}
	return best
}

func TestMonotonicClassic(t *testing.T) {
	cht := NewMonotonicCHT()
	lines := []Line{{2, 5}, {1, 3}, {-1, 7}}
	for _, l := range lines {
		cht.AddLine(l.M, l.B)
	}
	for _, x := range []int64{0, 1, 2, 3, 5, 10} {
		if got, want := cht.Query(x), bruteMin(lines, x); got != want {
			t.Errorf("at x=%d got %d, want %d", x, got, want)
		}
	}
}

func TestMonotonicRandom(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	var lines []Line
	m := int64(100)
	for i := 0; i < 30; i++ {
		m -= int64(1 + rng.Intn(5))
		b := int64(rng.Intn(201) - 100)
		lines = append(lines, Line{m, b})
	}
	cht := NewMonotonicCHT()
	for _, l := range lines {
		cht.AddLine(l.M, l.B)
	}
	for x := int64(-20); x <= 100; x++ {
		if got, want := cht.Query(x), bruteMin(lines, x); got != want {
			t.Errorf("at x=%d got %d, want %d", x, got, want)
		}
	}
}

func TestLiChaoClassic(t *testing.T) {
	lc := NewLiChaoTree(-20, 20)
	lines := []Line{{2, 5}, {1, 3}, {-1, 7}, {3, -2}, {0, 8}}
	for _, l := range lines {
		lc.AddLine(l.M, l.B)
	}
	for _, x := range []int64{-10, -5, 0, 3, 10} {
		if got, want := lc.Query(x), bruteMin(lines, x); got != want {
			t.Errorf("at x=%d got %d, want %d", x, got, want)
		}
	}
}

func TestLiChaoArbitraryOrder(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	var lines []Line
	for i := 0; i < 50; i++ {
		lines = append(lines, Line{
			M: int64(rng.Intn(21) - 10),
			B: int64(rng.Intn(101) - 50),
		})
	}
	lc := NewLiChaoTree(-100, 100)
	for _, l := range lines {
		lc.AddLine(l.M, l.B)
	}
	for i := 0; i < 20; i++ {
		x := int64(rng.Intn(201) - 100)
		if got, want := lc.Query(x), bruteMin(lines, x); got != want {
			t.Errorf("at x=%d got %d, want %d", x, got, want)
		}
	}
}
