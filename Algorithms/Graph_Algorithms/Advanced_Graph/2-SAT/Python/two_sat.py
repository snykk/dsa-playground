"""2-SAT Solver in O(n + m) using Tarjan's SCC.

Variables are numbered 0..n-1.
Literal encoding:
    2*x       = variable x (positive)
    2*x + 1   = variable x (negated)
    lit ^ 1   = the negation of a literal

Clauses are added via `add_clause(a, b)` where a and b are literals.
"""

import sys
from typing import List, Optional, Tuple


class TwoSAT:
    """Linear-time 2-SAT solver."""

    def __init__(self, n_vars: int) -> None:
        self.n = n_vars
        self.graph: List[List[int]] = [[] for _ in range(2 * n_vars)]

    def add_clause(self, a: int, b: int) -> None:
        """Add the clause (a ∨ b). Literals are 2*x or 2*x+1."""
        # (a ∨ b)  <=>  (¬a → b) ∧ (¬b → a)
        self.graph[a ^ 1].append(b)
        self.graph[b ^ 1].append(a)

    def implies(self, a: int, b: int) -> None:
        """Shortcut for (¬a ∨ b), i.e. a → b."""
        self.add_clause(a ^ 1, b)

    def force_true(self, a: int) -> None:
        """Force literal `a` to be true: add clause (a ∨ a)."""
        self.add_clause(a, a)

    def solve(self) -> Tuple[bool, Optional[List[bool]]]:
        """Return (satisfiable, assignment). assignment[i] is the value of var i."""
        n = 2 * self.n
        comp = [-1] * n
        order: List[int] = []
        disc = [-1] * n
        low = [-1] * n
        on_stack = [False] * n
        stack: List[int] = []
        timer = [0]
        scc_id = [0]

        # Iterative Tarjan to avoid Python recursion-limit issues.
        old_limit = sys.getrecursionlimit()
        sys.setrecursionlimit(max(old_limit, n + 100))

        try:
            def dfs(start: int) -> None:
                work = [(start, 0)]
                while work:
                    u, i = work[-1]
                    if i == 0:
                        disc[u] = low[u] = timer[0]
                        timer[0] += 1
                        stack.append(u)
                        on_stack[u] = True
                    if i < len(self.graph[u]):
                        work[-1] = (u, i + 1)
                        v = self.graph[u][i]
                        if disc[v] == -1:
                            work.append((v, 0))
                        elif on_stack[v]:
                            low[u] = min(low[u], disc[v])
                    else:
                        # Finished u
                        if low[u] == disc[u]:
                            while True:
                                w = stack.pop()
                                on_stack[w] = False
                                comp[w] = scc_id[0]
                                if w == u:
                                    break
                            scc_id[0] += 1
                        work.pop()
                        if work:
                            p = work[-1][0]
                            low[p] = min(low[p], low[u])

            for i in range(n):
                if disc[i] == -1:
                    dfs(i)
        finally:
            sys.setrecursionlimit(old_limit)

        # Check satisfiability + build assignment.
        assignment = [False] * self.n
        for x in range(self.n):
            if comp[2 * x] == comp[2 * x + 1]:
                return False, None
            # Tarjan assigns lower IDs to SCCs finished first (sinks in condensation).
            # Pick the literal whose SCC has the LOWER Tarjan ID — it comes later in
            # topological order and is therefore "safely forced true".
            assignment[x] = comp[2 * x] < comp[2 * x + 1]
        return True, assignment


if __name__ == "__main__":
    # (x0 ∨ x1) ∧ (¬x0 ∨ x1) ∧ (¬x0 ∨ ¬x1)
    sat = TwoSAT(2)
    sat.add_clause(0, 2)           # x0 ∨ x1
    sat.add_clause(1, 2)           # ¬x0 ∨ x1
    sat.add_clause(1, 3)           # ¬x0 ∨ ¬x1
    ok, assignment = sat.solve()
    print(f"Satisfiable: {ok}")
    print(f"Assignment: {assignment}")
