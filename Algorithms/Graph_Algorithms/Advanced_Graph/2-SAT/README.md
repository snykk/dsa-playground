# 2-SAT (2-Satisfiability)

Given `n` boolean variables and `m` clauses, each an OR of exactly two literals (a variable or its negation), decide whether some assignment makes every clause true, and produce one if so. It runs in **O(n + m)** time by turning the formula into an implication graph and finding its strongly connected components.

## Intuition

General SAT (clauses of any length) is NP-complete, but with clauses of length 2 the problem is polynomial. A clause `(a or b)` says "if `a` is false, `b` must be true, and if `b` is false, `a` must be true". That is two implications:

```text
(a or b)  ==  (~a -> b) and (~b -> a)
```

Build a directed graph with one node per literal (`2n` nodes) and two edges per clause. Truth flows along edges: if a literal is true, everything it points to must be true.

**Invariant.** A satisfying assignment exists if and only if no variable `x` lies in the same strongly connected component (SCC) as `~x`. If it did, `x -> ~x -> x` would force `x` and `~x` to be equal, which is impossible.

When no variable collides, an assignment is built from the SCC order: for each variable, make the literal that comes **later in topological order** true.

## Visual

Formula `(x0 or x1) and (~x0 or x1) and (~x0 or ~x1)`. Each clause adds two edges:

```text
(x0 or x1)    ->   ~x0 -> x1        ~x1 -> x0
(~x0 or x1)   ->    x0 -> x1        ~x1 -> ~x0
(~x0 or ~x1)  ->    x0 -> ~x1        x1 -> ~x0

   SCC A = { x0, ~x1 }                 SCC B = { x1, ~x0 }

     x0 <------------ ~x1                 x1 -------------> ~x0
      |   (~x1 -> x0)                      ^   (~x0 -> x1)    |
      +-------------> ~x1                  +------------------+
          (x0 -> ~x1)                         (x1 -> ~x0)

   A -> B through x0 -> x1 and ~x1 -> ~x0; nothing leaves B, so B is the sink.
```

`x0` and `~x0` are in different SCCs, and so are `x1` and `~x1`, so the formula is satisfiable. The sink SCC B is chosen to be true: `x1 = true`, `x0 = false`.

## How It Works

Variables are numbered `0..n-1`. Literal `x` is node `2x`, literal `~x` is node `2x + 1`, and `lit ^ 1` negates a literal.

1. **Build the implication graph.** For each clause `(a or b)` add the edges `~a -> b` and `~b -> a`. A one-literal clause `(a)` is written `(a or a)`.
2. **Find the SCCs** with Tarjan's algorithm (all three implementations here are iterative).
3. **Check satisfiability.** If `comp[2x] == comp[2x + 1]` for any `x`, return UNSAT.
4. **Build the assignment.** Tarjan numbers an SCC when it finishes, so sink components get the **smallest** ids and the numbering is a reverse topological order. Set `x = true` iff `comp[2x] < comp[2x + 1]`: the literal with the smaller id is later in topological order, so it is the safe one to make true.

## Step-by-Step Trace

Same formula as above. Node ids: `x0 = 0`, `~x0 = 1`, `x1 = 2`, `~x1 = 3`. `TwoSAT.add_clause` produces this adjacency list (checked by running the Python code):

| Node | Literal | Edges to |
|------|---------|----------|
| 0 | x0 | 2 (x1), 3 (~x1) |
| 1 | ~x0 | 2 (x1) |
| 2 | x1 | 1 (~x0) |
| 3 | ~x1 | 0 (x0), 1 (~x0) |

Tarjan finishes `{1, 2}` first (id 0) and `{0, 3}` second (id 1):

| Variable | comp[x] | comp[~x] | x = (comp[x] < comp[~x]) |
|----------|---------|----------|--------------------------|
| x0 | 1 | 0 | false |
| x1 | 0 | 1 | true |

Result `[False, True]`: `(F or T)`, `(T or T)` and `(T or F)` are all true. This is exactly what `python3 two_sat.py` prints.

## Complexity

| Step | Time | Space |
|------|------|-------|
| Build graph (2n nodes, 2m edges) | O(n + m) | O(n + m) |
| Tarjan SCC | O(n + m) | O(n) |
| Check and assign | O(n) | O(n) |
| **Total** | **O(n + m)** | **O(n + m)** |

Each clause adds a constant number of edges and Tarjan touches every node and edge once. A 3-literal clause `(a or b or c)` cannot be written as implications between single literals, which is why 3-SAT stays NP-complete.

## When to Use

Use it when:

- every constraint relates at most two boolean choices ("A or B", "not both A and B", "A requires B");
- each object has two options (left or right, slot 1 or slot 2) and conflicts exist between pairs;
- you only need to know whether a valid configuration exists, or to get one.

Do not use it when:

- clauses have three or more literals: use a SAT solver;
- you want the best assignment under weights (MAX-2-SAT is NP-hard);
- you need all solutions or their number (#2-SAT is #P-complete).

## 2-SAT vs. Related Problems

| Problem | Clause length | Complexity | Technique |
|---------|---------------|-----------|-----------|
| 2-SAT | exactly 2 | O(n + m) | Implication graph + SCC |
| Horn-SAT | at most 1 positive literal | linear | Unit propagation |
| 3-SAT | 3 | NP-complete | SAT solvers (CDCL) |
| MAX-2-SAT | 2, maximise satisfied clauses | NP-hard | Approximation |

## Common Pitfalls

1. **Literal encoding.** Use `2x` for `x` and `2x + 1` for `~x` everywhere, and negate with `lit ^ 1`.
2. **Only one edge per clause.** Each clause needs both `~a -> b` and `~b -> a`.
3. **Single-literal clauses.** `(x)` must be added as `(x or x)`, which creates the edge `~x -> x` that forces `x`.
4. **Wrong comparison direction.** With Tarjan ids the rule is `x = true iff comp[2x] < comp[2x + 1]`. With Kosaraju, which numbers components in topological order, the comparison flips.
5. **Not really 2-SAT.** Sudoku needs "at least one of nine" clauses, so it does not reduce to 2-SAT.
6. **Unchecked literals.** A literal `>= 2n` is not validated: Python raises `IndexError`, C++ has undefined behaviour and Go panics.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `two_sat.py` | `TwoSAT` class; returns `(bool, list or None)` |
| C++ | [C++/](C++/) | `two_sat.h` | Header-only; returns `std::optional<std::vector<bool>>` |
| Go | [Go/](Go/) | `main.go` | `TwoSAT` type; returns `(bool, []bool)` |

All three use an iterative Tarjan and the same assignment rule.

## Practice Problems

- [CSES 1684. Giant Pizza](https://cses.fi/problemset/task/1684): each person wants two toppings in or out; a direct 2-SAT.
- [Codeforces 568C. New Language](https://codeforces.com/problemset/problem/568/C): 2-SAT with letter-type constraints, combined with a search for the smallest string.

## Related

- [Strongly Connected Components](../Strongly_Connected_Components/README.md): the building block
- [Tarjan's Algorithm](../Strongly_Connected_Components/Tarjan's_Algorithm/README.md): the SCC numbering the assignment rule relies on
- [Kosaraju's Algorithm](../Strongly_Connected_Components/Kosaraju's_Algorithm/README.md): the alternative, with the opposite numbering
- [Topological Sort](../Topological_Sort/README.md): order of the condensation graph
- [DFS](../../Traversal/DFS/README.md): the traversal inside Tarjan
