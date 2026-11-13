package main

import (
	"bufio"
	"fmt"
	"io"
	"strings"
	"testing"
)

// runWithJudge connects the package-level reader and writer to an in-process judge.
// The judge sees every line the solution writes and answers with the handler's reply
// (an empty reply means "no response"). It returns the lines the solution printed.
func runWithJudge(t *testing.T, handler func(line string) string, solve func()) []string {
	t.Helper()
	toJudgeR, toJudgeW := io.Pipe()
	toSolverR, toSolverW := io.Pipe()

	oldReader, oldWriter := reader, writer
	reader = bufio.NewReader(toSolverR)
	writer = bufio.NewWriter(toJudgeW)
	defer func() { reader, writer = oldReader, oldWriter }()

	var lines []string
	done := make(chan struct{})
	go func() {
		defer close(done)
		sc := bufio.NewScanner(toJudgeR)
		for sc.Scan() {
			line := sc.Text()
			lines = append(lines, line)
			if reply := handler(line); reply != "" {
				fmt.Fprintln(toSolverW, reply)
			}
		}
	}()

	solve()
	writer.Flush()
	toJudgeW.Close()
	<-done
	toSolverW.Close()
	return lines
}

func countQueries(lines []string) int {
	n := 0
	for _, l := range lines {
		if strings.HasPrefix(l, "?") {
			n++
		}
	}
	return n
}

func TestQueryAndAnswer(t *testing.T) {
	lines := runWithJudge(t, func(line string) string {
		if line == "? 7" {
			return "42"
		}
		return ""
	}, func() {
		if got := Query(7); got != 42 {
			t.Errorf("Query(7) = %d, want 42", got)
		}
		Answer(5)
	})
	if len(lines) != 2 || lines[0] != "? 7" || lines[1] != "! 5" {
		t.Errorf("unexpected conversation: %v", lines)
	}
}

func TestGuessNumberFindsEverySecretWithinBudget(t *testing.T) {
	for n := 1; n < 70; n++ {
		budget := 1
		for (1 << (budget - 1)) <= n {
			budget++
		}
		for secret := 1; secret <= n; secret++ {
			solved := false
			lines := runWithJudge(t, func(line string) string {
				var kind string
				var value int
				fmt.Sscanf(line, "%s %d", &kind, &value)
				if kind == "!" {
					solved = solved || value == secret
					return ""
				}
				if value == secret {
					solved = true
					return "correct"
				}
				if secret > value {
					return "higher"
				}
				return "lower"
			}, func() { GuessNumber(n) })
			if !solved {
				t.Fatalf("n=%d secret=%d: never found (%v)", n, secret, lines)
			}
			if q := countQueries(lines); q > budget {
				t.Fatalf("n=%d secret=%d: %d queries, budget %d", n, secret, q, budget)
			}
		}
	}
}

func TestBinarySearchAnswer(t *testing.T) {
	for n := 1; n < 40; n++ {
		for k := 1; k <= n; k++ {
			k := k
			if got := BinarySearchAnswer(n, func(m int) bool { return m <= k }); got != k {
				t.Errorf("n=%d k=%d: got %d", n, k, got)
			}
		}
	}
}
