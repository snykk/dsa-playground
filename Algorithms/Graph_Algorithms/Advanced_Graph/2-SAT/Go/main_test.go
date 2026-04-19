package main

import "testing"

func lit(x int, positive ...bool) int {
	if len(positive) > 0 && !positive[0] {
		return 2*x + 1
	}
	return 2 * x
}

func checkAssignment(clauses [][2]int, a []bool) bool {
	for _, c := range clauses {
		vp := a[c[0]/2]
		if c[0]%2 != 0 {
			vp = !vp
		}
		vq := a[c[1]/2]
		if c[1]%2 != 0 {
			vq = !vq
		}
		if !(vp || vq) {
			return false
		}
	}
	return true
}

func TestSingleClauseSatisfiable(t *testing.T) {
	s := NewTwoSAT(2)
	s.AddClause(lit(0), lit(1))
	ok, a := s.Solve()
	if !ok {
		t.Fatal("expected SAT")
	}
	if !(a[0] || a[1]) {
		t.Errorf("clause unsatisfied: %v", a)
	}
}

func TestForceTrue(t *testing.T) {
	s := NewTwoSAT(1)
	s.ForceTrue(lit(0))
	ok, a := s.Solve()
	if !ok || !a[0] {
		t.Errorf("expected x0=true, got ok=%v a=%v", ok, a)
	}
}

func TestForceFalse(t *testing.T) {
	s := NewTwoSAT(1)
	s.ForceTrue(lit(0, false))
	ok, a := s.Solve()
	if !ok || a[0] {
		t.Errorf("expected x0=false, got ok=%v a=%v", ok, a)
	}
}

func TestContradiction(t *testing.T) {
	s := NewTwoSAT(1)
	s.ForceTrue(lit(0))
	s.ForceTrue(lit(0, false))
	if ok, _ := s.Solve(); ok {
		t.Errorf("expected UNSAT")
	}
}

func TestContradictionChain(t *testing.T) {
	s := NewTwoSAT(2)
	s.Implies(lit(0), lit(1))
	s.Implies(lit(1), lit(0, false))
	s.ForceTrue(lit(0))
	if ok, _ := s.Solve(); ok {
		t.Errorf("expected UNSAT")
	}
}

func TestTextbook(t *testing.T) {
	s := NewTwoSAT(2)
	clauses := [][2]int{
		{lit(0), lit(1)},
		{lit(0, false), lit(1)},
		{lit(0, false), lit(1, false)},
	}
	for _, c := range clauses {
		s.AddClause(c[0], c[1])
	}
	ok, a := s.Solve()
	if !ok {
		t.Fatal("expected SAT")
	}
	if !checkAssignment(clauses, a) {
		t.Errorf("assignment %v fails a clause", a)
	}
}

func TestImpliesChain(t *testing.T) {
	s := NewTwoSAT(4)
	s.Implies(lit(0), lit(1))
	s.Implies(lit(1), lit(2))
	s.Implies(lit(2), lit(3))
	s.ForceTrue(lit(0))
	ok, a := s.Solve()
	if !ok {
		t.Fatal("expected SAT")
	}
	for i, v := range a {
		if !v {
			t.Errorf("expected x%d=true, got false", i)
		}
	}
}

func TestNoConstraints(t *testing.T) {
	s := NewTwoSAT(5)
	ok, a := s.Solve()
	if !ok || len(a) != 5 {
		t.Errorf("expected SAT with 5 vars, got ok=%v a=%v", ok, a)
	}
}

func TestMultipleVars(t *testing.T) {
	s := NewTwoSAT(3)
	clauses := [][2]int{
		{lit(0), lit(1, false)},
		{lit(0, false), lit(2)},
		{lit(1), lit(2)},
	}
	for _, c := range clauses {
		s.AddClause(c[0], c[1])
	}
	ok, a := s.Solve()
	if !ok {
		t.Fatal("expected SAT")
	}
	if !checkAssignment(clauses, a) {
		t.Errorf("assignment %v fails a clause", a)
	}
}
