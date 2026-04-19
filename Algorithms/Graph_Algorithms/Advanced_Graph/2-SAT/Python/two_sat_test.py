"""Unit tests for 2-SAT solver."""
import unittest

from two_sat import TwoSAT


def lit(x: int, positive: bool = True) -> int:
    """Helper: convert (variable, sign) to literal encoding."""
    return 2 * x if positive else 2 * x + 1


def check_assignment(clauses, assignment):
    """Verify an assignment satisfies every clause."""
    for a, b in clauses:
        va = assignment[a // 2] if a % 2 == 0 else not assignment[a // 2]
        vb = assignment[b // 2] if b % 2 == 0 else not assignment[b // 2]
        if not (va or vb):
            return False
    return True


class TestTwoSAT(unittest.TestCase):
    def test_single_clause_satisfiable(self):
        s = TwoSAT(2)
        s.add_clause(lit(0), lit(1))   # x0 ∨ x1
        ok, a = s.solve()
        self.assertTrue(ok)
        self.assertTrue(a[0] or a[1])

    def test_tautology(self):
        s = TwoSAT(1)
        s.add_clause(lit(0), lit(0, positive=False))  # x0 ∨ ¬x0 — always true
        ok, a = s.solve()
        self.assertTrue(ok)

    def test_force_true(self):
        s = TwoSAT(1)
        s.force_true(lit(0))
        ok, a = s.solve()
        self.assertTrue(ok)
        self.assertTrue(a[0])

    def test_force_false(self):
        s = TwoSAT(1)
        s.force_true(lit(0, positive=False))  # force ¬x0
        ok, a = s.solve()
        self.assertTrue(ok)
        self.assertFalse(a[0])

    def test_contradiction_direct(self):
        s = TwoSAT(1)
        s.force_true(lit(0))                 # x0 must be true
        s.force_true(lit(0, positive=False)) # x0 must be false
        ok, a = s.solve()
        self.assertFalse(ok)
        self.assertIsNone(a)

    def test_contradiction_via_chain(self):
        # x0 → x1 → ¬x0, and x0 is forced true
        s = TwoSAT(2)
        s.implies(lit(0), lit(1))                         # x0 → x1
        s.implies(lit(1), lit(0, positive=False))         # x1 → ¬x0
        s.force_true(lit(0))                              # x0 forced
        ok, _ = s.solve()
        self.assertFalse(ok)

    def test_textbook_example(self):
        # (x0 ∨ x1) ∧ (¬x0 ∨ x1) ∧ (¬x0 ∨ ¬x1)
        s = TwoSAT(2)
        clauses = [
            (lit(0), lit(1)),
            (lit(0, False), lit(1)),
            (lit(0, False), lit(1, False)),
        ]
        for a, b in clauses:
            s.add_clause(a, b)
        ok, a = s.solve()
        self.assertTrue(ok)
        self.assertTrue(check_assignment(clauses, a))

    def test_implies_helper(self):
        # x0 → x1, x1 → x2, x2 → x3, x0 forced
        s = TwoSAT(4)
        s.implies(lit(0), lit(1))
        s.implies(lit(1), lit(2))
        s.implies(lit(2), lit(3))
        s.force_true(lit(0))
        ok, a = s.solve()
        self.assertTrue(ok)
        self.assertTrue(a[0] and a[1] and a[2] and a[3])

    def test_no_constraints(self):
        # Empty formula — any assignment works
        s = TwoSAT(5)
        ok, a = s.solve()
        self.assertTrue(ok)
        self.assertEqual(len(a), 5)

    def test_multiple_vars_satisfiable(self):
        # (x0 ∨ ¬x1) ∧ (¬x0 ∨ x2) ∧ (x1 ∨ x2)
        s = TwoSAT(3)
        clauses = [
            (lit(0), lit(1, False)),
            (lit(0, False), lit(2)),
            (lit(1), lit(2)),
        ]
        for a, b in clauses:
            s.add_clause(a, b)
        ok, assignment = s.solve()
        self.assertTrue(ok)
        self.assertTrue(check_assignment(clauses, assignment))


if __name__ == "__main__":
    unittest.main()
