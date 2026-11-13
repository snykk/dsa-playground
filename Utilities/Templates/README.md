# Templates

Boilerplate to copy at the start of a contest. Each of the three folders holds one source file with fast input, math helpers and a few structures, plus its tests. Copy the file, then write your solution in `solve()`.

## Topics

| # | Template | Language | What it gives you |
|---|----------|----------|-------------------|
| 1 | [C++ Competitive Programming Boilerplate](Cpp_Boilerplate/) | C++ | Type aliases (`ll`, `vi`, `pii`) and macros (`pb`, `all`, `rep`), constants, `gcd`, `lcm`, modular `power` and `modInverse`, `nCr`, a DSU and a segment tree, and BFS and DFS. |
| 2 | [Go Competitive Programming Boilerplate](Go_Boilerplate/) | Go | Buffered input (`readInt`, `readInts`, `readString`) and output, constants such as `MOD`, math helpers including `isPrime`, and combinatorics, DSU, segment tree and graph types. |
| 3 | [Python Competitive Programming Boilerplate](Python_Boilerplate/) | Python | Fast input (`inp`, `inlt`, `insr`) and output (`out`, `outl`), constants, math helpers including a sieve, combinatorics, DSU, segment tree, and `build_graph` with BFS and DFS. |

All three have the modulus constants `MOD` (10^9 + 7) and `MOD2` (998244353), a modular power and inverse, and a DSU with path compression.

## How They Compare

| Template | Input | Entry point | Run the tests |
|----------|-------|-------------|---------------|
| C++ | `fastIO()` setup with `cin` | `solve()` called from `main` | compile `cpp_boilerplate_test.cpp` |
| Go | buffered reader and writer | `solve()` called from `main`, with `defer writer.Flush()` | `go test` |
| Python | `sys.stdin.readline` helpers | `solve()` called from `main` | run `python_boilerplate_test.py` |

## Common Pitfalls

- Trusting a template blindly. Read it first and test it on small inputs; a helper you do not understand can fail silently.
- Forgetting to flush in Go. Output is buffered, so keep `defer writer.Flush()` in `main`.
- Overflow in C++. Use `ll`, and write `1LL` in products.
- Pasting the whole template when you need one helper. Unused code only adds noise.

## Related

- [Optimization Techniques](../Optimization_Techniques/): the Fast I/O and modular arithmetic ideas behind the templates.
- [Disjoint Set Union](../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/): the structure behind the templates' DSU.
- [Segment Tree](../../Data_Structures/Non_Linear/Trees/Segment_Tree/): the structure behind the templates' segment tree.
