// Package main implements a linear-time 2-SAT solver via implication graph
// + iterative Tarjan's SCC.
//
// Literal encoding:
//
//	2*x     = variable x (positive)
//	2*x + 1 = variable x (negated)
//	lit ^ 1 = negation of a literal
package main

import "fmt"

// TwoSAT is a 2-SAT solver over n_vars boolean variables.
type TwoSAT struct {
	n     int
	graph [][]int
	comp  []int
}

// NewTwoSAT constructs a solver with n boolean variables.
func NewTwoSAT(n int) *TwoSAT {
	return &TwoSAT{n: n, graph: make([][]int, 2*n)}
}

// AddClause adds (a ∨ b). Literals are 2*x or 2*x+1.
func (s *TwoSAT) AddClause(a, b int) {
	s.graph[a^1] = append(s.graph[a^1], b)
	s.graph[b^1] = append(s.graph[b^1], a)
}

// Implies adds a → b.
func (s *TwoSAT) Implies(a, b int) { s.AddClause(a^1, b) }

// ForceTrue pins literal a to true via (a ∨ a).
func (s *TwoSAT) ForceTrue(a int) { s.AddClause(a, a) }

// Solve returns (sat, assignment). On UNSAT, assignment is nil.
func (s *TwoSAT) Solve() (bool, []bool) {
	s.runTarjan()
	a := make([]bool, s.n)
	for x := 0; x < s.n; x++ {
		if s.comp[2*x] == s.comp[2*x+1] {
			return false, nil
		}
		a[x] = s.comp[2*x] < s.comp[2*x+1]
	}
	return true, a
}

func (s *TwoSAT) runTarjan() {
	n := 2 * s.n
	s.comp = make([]int, n)
	for i := range s.comp {
		s.comp[i] = -1
	}
	disc := make([]int, n)
	low := make([]int, n)
	for i := range disc {
		disc[i] = -1
		low[i] = -1
	}
	onStack := make([]bool, n)
	var stack []int
	timer := 0
	sccCount := 0

	type frame struct{ node, nextIdx int }

	for start := 0; start < n; start++ {
		if disc[start] != -1 {
			continue
		}
		work := []frame{{start, 0}}
		for len(work) > 0 {
			top := &work[len(work)-1]
			u := top.node
			if top.nextIdx == 0 {
				disc[u] = timer
				low[u] = timer
				timer++
				stack = append(stack, u)
				onStack[u] = true
			}
			if top.nextIdx < len(s.graph[u]) {
				v := s.graph[u][top.nextIdx]
				top.nextIdx++
				if disc[v] == -1 {
					work = append(work, frame{v, 0})
				} else if onStack[v] && disc[v] < low[u] {
					low[u] = disc[v]
				}
			} else {
				if low[u] == disc[u] {
					for {
						w := stack[len(stack)-1]
						stack = stack[:len(stack)-1]
						onStack[w] = false
						s.comp[w] = sccCount
						if w == u {
							break
						}
					}
					sccCount++
				}
				finishedLow := low[u]
				work = work[:len(work)-1]
				if len(work) > 0 {
					p := &work[len(work)-1]
					if finishedLow < low[p.node] {
						low[p.node] = finishedLow
					}
				}
			}
		}
	}
}

func main() {
	sat := NewTwoSAT(2)
	sat.AddClause(0, 2)  // x0 ∨ x1
	sat.AddClause(1, 2)  // ¬x0 ∨ x1
	sat.AddClause(1, 3)  // ¬x0 ∨ ¬x1
	ok, a := sat.Solve()
	fmt.Printf("Satisfiable: %v, assignment: %v\n", ok, a)
}
