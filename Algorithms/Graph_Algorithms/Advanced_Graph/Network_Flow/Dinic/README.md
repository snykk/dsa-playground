# Dinic's Algorithm

Dinic's algorithm finds the maximum flow from a source to a sink in a flow network, in **phases**. Each phase runs one BFS to sort the vertices into **levels** by their distance from the source, then pushes a **blocking flow** through the level graph: depth-first searches that only go one level deeper at every step, many augmenting paths per phase. A **current-arc pointer** per vertex keeps those searches from walking past the same entries twice. It runs in **O(V^2 E)**, and in **O(E sqrt(V))** on unit networks such as the one built for bipartite matching. The vertices the last BFS reaches are the source side of a minimum cut.

## Intuition

Edmonds-Karp runs a whole BFS for every augmenting path it finds. Dinic keeps the BFS but uses it better: one BFS gives every vertex its **level**, the fewest residual edges from the source, and then the algorithm pushes flow along shortest paths until none of that length is left before it runs the next BFS.

- **Level graph.** An entry `u -> v` of the residual graph is in the level graph when it has room and `level[v] == level[u] + 1`. Every source-to-sink path in it is a shortest augmenting path.
- **Blocking flow.** Keep pushing along level-graph paths until every one of them has a full entry. Then no augmenting path of that length is left, so the next BFS finds the sink at least one level deeper, or not at all. The sink's level is at most V - 1, so there are at most V - 1 phases that push flow.
- **Current arc.** Within a phase an entry that is full, points to the wrong level or leads to a dead end stays useless: pushing flow only empties level-graph entries, and the reverse entries it fills point one level back. So each vertex keeps a pointer to the first entry that may still work, and the searches resume there instead of at the start of the list.
- **Max-flow min-cut.** When the BFS no longer reaches the sink, the vertices it did reach form a set `S` whose leaving edges are all full and whose entering edges carry nothing: the flow equals the capacity of the cut `(S, rest)`, so both are optimal.

## Visual

The classic network with source 0 and sink 5 (capacities on the edges), with the level the first BFS gives each column of vertices:

```text
   0           1          2          3   <- level

             16         12         20
       +----->(1)------->(3)------->(5)
       |       | ^        ^          ^
  (0)--+      10 | 4      | 7        | 4
       |       v |        |          |
       +----->(2)------->(4)---------+
         13         14

   plus the edge 3 -> 2 with capacity 9
```

Edges: 0->1 16, 0->2 13, 1->2 10, 1->3 12, 2->1 4, 2->4 14, 3->2 9, 3->5 20, 4->3 7, 4->5 4. The level graph of phase 1 keeps only the edges that go one level deeper: `0->1`, `0->2`, `1->3`, `2->4`, `3->5` and `4->5`. The edges `1->2` and `2->1` join two vertices of level 1, `4->3` two of level 2, and `3->2` goes back a level, so phase 1 ignores them.

## How It Works

1. **Build the residual graph.** Copy the capacities and add a reverse entry of 0 for every edge that has none (the map-of-maps residual graph Edmonds-Karp uses). Sort each vertex's residual entries by neighbour: `adj[u]`.
2. **BFS from the source.** Give every vertex it reaches over entries with room its level. If the sink has no level, stop: the flow is maximum, and the vertices with a level are the source side of a minimum cut.
3. **Reset the current arcs.** `current[u] = 0` for every vertex.
4. **DFS from the source** through the level graph. Standing on `u`, look at `v = adj[u][current[u]]`:
   - if `residual[u][v] > 0` and `level[v] == level[u] + 1`, step to `v`;
   - otherwise move the pointer, `current[u] += 1`;
   - if the pointer of `u` runs off the end, `u` is a dead end for the rest of the phase: back up, and move the pointer of the vertex before it past the entry to `u`.
5. **Push.** When the search reaches the sink, push the bottleneck of the path along it (subtract it forward, add it backward) and run the next search from step 4. The pointers stay where they are.
6. When the search backs out of the source, the flow of the phase is blocking: go back to step 2.

### Which flow is returned, and the edge cases

A network can have many maximum flows. The one returned is fixed by the rule in step 1: **every search tries the residual entries of a vertex in increasing order of the neighbour**. Python, C++ and Go follow the same order and return the same flow on every edge, the same number of phases and the same count of entry visits; the C++ and Go tests check that against the Python code on 40 networks. The value and the source side of the cut are the same for any order.

- **`source == sink`**: the value is 0, every edge carries 0, there are no phases, and the source side is just the source.
- **Unreachable sink**: the value is 0 after one BFS, and the source side is what that BFS reached.
- **Parallel edges**: the map holds one capacity per edge, so give two parallel edges as one edge with the sum of their capacities. The maximum flow is the same.
- **Anti-parallel edges** `u -> v` and `v -> u` share their two residual entries. Only their net flow is defined: `dinic_flow` gives it to the edge it runs along and 0 to the other.
- **Zero capacities and self-loops** stay in the residual graph but never carry flow.
- A vertex may be missing as a key of the map (a sink with no outgoing edges, or a source that only receives edges), and vertex ids may be any integers.

## Step-by-Step Trace

The network above, as `python3 dinic.py` runs it. A search "passes" an entry when the entry has no room or does not go one level deeper.

**Phase 1.** Levels: 0 for vertex 0, 1 for 1 and 2, 2 for 3 and 4, 3 for 5.

| Search | What it does | Path | Pushed | Entries looked at |
|--------|--------------|------|--------|-------------------|
| 1 | 0 takes 1; 1 passes 0 and 2 and takes 3; 3 passes 1, 2 and 4 and takes 5 | 0 -> 1 -> 3 -> 5 | 12 | 8 |
| 2 | 0 takes 1 again; 1 resumes at 3, now full, and is a dead end; 0 moves on to 2; 2 passes 0, 1 and 3 and takes 4; 4 passes 2 and 3 and takes 5 | 0 -> 2 -> 4 -> 5 | 4 | 10 |
| 3 | 0 resumes at 2, 2 at 4 and 4 at 5, now full: 4, 2 and 0 are dead ends | none | - | 3 |

**Phase 2.** Levels: 0 for vertex 0, 1 for 1 and 2, 2 for 4, 3 for 3, 4 for 5. The sink is one level deeper than in phase 1.

| Search | What it does | Path | Pushed | Entries looked at |
|--------|--------------|------|--------|-------------------|
| 1 | 0 takes 1, which passes 0, 2 and 3 (full) and is a dead end; 0 moves on to 2, which passes 0, 1 and 3 and takes 4; 4 passes 2 and takes 3; 3 passes 1, 2 and 4 and takes 5 | 0 -> 2 -> 4 -> 3 -> 5 | 7 | 15 |
| 2 | 0 resumes at 2, 2 at 4; 4 passes 3 and 5, both full | none | - | 4 |

**Phase 3.** The BFS reaches 0, 1, 2 and 4 but not the sink: the maximum flow is 12 + 4 + 7 = **23**, after 3 phases (the last BFS included) and 40 entry visits. The edges leaving `{0, 1, 2, 4}` are `1->3` (12), `4->3` (7) and `4->5` (4), and 12 + 7 + 4 = 23. `dinic_flow` returns the flows `0->1` 12, `0->2` 11, `1->3` 12, `2->4` 11, `3->5` 19, `4->3` 7, `4->5` 4 and 0 on the other three edges.

Search 2 of phase 1 shows the current arc at work: vertex 1 does not look at its entries to 0 and 2 again, because search 1 already moved its pointer past them. Edmonds-Karp takes the same three paths on this network, but needs a BFS for each of them and a fourth one to stop, where Dinic needs three.

## Complexity

| Quantity | Bound | Why |
|----------|-------|-----|
| Phases | at most V - 1 that push flow, plus the last BFS | a blocking flow leaves no augmenting path of the same length, so the sink's level grows every phase, and it is at most V - 1 |
| One BFS | O(V + E) | each residual entry is read once |
| One blocking flow | O(V E) | moving a pointer past an entry, or backing out of a dead end through it, happens at most once per entry and phase: O(E). Each path has at most V - 1 entries and fills at least one, so there are at most E paths, O(V E) steps along them |
| Total | O(V^2 E) | V phases times O(V E) |
| Unit networks | O(E sqrt(V)) | see below |
| Space | O(V + E) | the residual graph, the sorted entry lists, the levels and the pointers |

**Unit networks.** Every capacity is 1, and every vertex other than the source and the sink has a single entering edge or a single leaving edge, as in the network built for bipartite matching. A path fills every entry it uses, so a phase costs O(E). After sqrt(V) phases every augmenting path is longer than sqrt(V); the flow still missing splits into paths that share no vertex, so at most sqrt(V) units are missing, and every later phase adds at least one. That is at most 2 sqrt(V) phases that push flow.

Counted on the Python code (`phases` includes the last BFS; `edge_visits` counts the entries the depth-first searches looked at):

| Network | V | E | Phases | Entry visits |
|---------|---|---|--------|--------------|
| the comb below, k = 320 | 643 | 961 | 2 | 2,241 = 7k + 1 |
| matching network, 8000 vertices a side, 32,000 random edges | 16,002 | 47,994 | 16 | 1,045,875 |
| matching network, 80 components, the k-th needing an augmenting path of 2k + 1 edges | 6,482 | 12,880 | 81 | 824,054 |
| matching network, complete, 200 vertices a side | 402 | 40,400 | 2 | 60,899 |

The **comb** has an edge `0 -> 1` of capacity k, k edges from 1 to dead ends 2 .. k+1, and k paths `1 -> b -> sink` of capacity 1 through the vertices k+2 .. 2k+1. Vertex 1 meets the dead ends before the vertices that lead on. With the current arc it passes them once in the phase; without it, every one of the k searches walks past them again, and the count grows to 257,441 for k = 320, about 2.5 k^2. The 80-component network is close to the worst case for unit networks: one phase per path length, about sqrt(V) phases. On the random matching networks with 250 to 2000 vertices a side, Edmonds-Karp ran one BFS per unit of flow plus one, 247 to 1959 of them, where Dinic needed 8 to 14 phases.

## When to Use

Use it when:

- you need a maximum flow or a minimum cut and the network has thousands of edges or more, where one BFS per augmenting path is too slow;
- the network is a unit network, such as bipartite matching or vertex-disjoint paths with every vertex split in two: the bound drops to O(E sqrt(V)). With capacity 1 alone, as for edge-disjoint paths, each phase still costs only O(E);
- you need the flow on each edge or the cut itself: `dinic_flow` returns both.

Do not use it when:

- the problem is plain bipartite matching and nothing else: Hopcroft-Karp has the same O(E sqrt(V)) bound and works on the bipartite graph directly, without a flow network;
- the edges have costs and you want the cheapest maximum flow: that is min-cost flow;
- the graph is small and you want the shortest code: Edmonds-Karp is shorter.

## Dinic vs. Alternatives

| Algorithm | Augmenting step | Time | Notes |
|-----------|-----------------|------|-------|
| Ford-Fulkerson | any path, by DFS here | O(E f) | f is the maximum flow, integer capacities |
| Edmonds-Karp | one shortest path per BFS | O(V E^2) | one BFS for every augmenting path |
| Dinic | a blocking flow per BFS | O(V^2 E); O(E sqrt(V)) on unit networks | many shortest paths per BFS |
| Hopcroft-Karp | vertex-disjoint shortest paths per BFS | O(E sqrt(V)) | the same kind of phases, on the bipartite graph directly |
| Push-relabel | local pushes, no paths | O(V^3) for the FIFO variant | not in this repository |

## Common Pitfalls

1. **No current arc.** Without it every search starts each vertex at its first entry again and walks past the same full entries and dead ends; the comb above takes about 2.5 k^2 entry visits instead of 7k + 1. The answer stays right, the bound is lost.
2. **Not resetting the pointers each phase.** The levels change between phases, so an entry passed in one phase may be useful in the next. With the pointers kept from the last phase, the BFS keeps reaching the sink while every search fails at once, and the loop never ends (on the classic network it stalls at a flow of 16).
3. **Moving the pointers after a successful push.** An entry on the path may still have room. The phase then ends before its flow is blocking, and the next BFS can find the sink at the same level again. The pointer moves only when its entry is found useless.
4. **Recursion depth.** A path can be as long as the graph. The searches here keep the path in a list, so a 5000-vertex chain works in Python, and a 200000-vertex chain in C++ and Go.
5. **Overflow in C++.** Capacities are `int`, but the residual graph, the flows and the total are `long long`: two paths of `INT_MAX` give 4294967294.
6. **Expecting one particular flow.** Only the value and the source side of the cut are unique; another neighbour order gives other flows on the edges.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `dinic.py` | `dinic`, `dinic_flow`; unbounded integers; dict of dicts |
| C++ | [C++/](C++/) | `dinic.cpp` | `dinic`, `dinicFlow` returning a `DinicResult`; `int` capacities, `long long` residual and flows |
| Go | [Go/](Go/) | `main.go` | `dinic`, `dinicFlow` returning a `DinicResult`; 64-bit `int`; map of maps |

All three take the map of maps Edmonds-Karp takes and return 0 for `source == sink` or an unreachable sink, without an error. Each searches with an explicit path, tries the entries in increasing order of the neighbour and returns the same flows, cut and counts.

## Practice Problems

- [Download Speed (CSES 1694)](https://cses.fi/problemset/task/1694)
- [Maximum Flow (Kattis maxflow)](https://open.kattis.com/problems/maxflow)
- [Minimum Cut (Kattis mincut)](https://open.kattis.com/problems/mincut)
- [Distinct Routes (CSES 1711)](https://cses.fi/problemset/task/1711)
- [Builder Takahashi (AtCoder abc239_g)](https://atcoder.jp/contests/abc239/tasks/abc239_g)

## Related

- [Edmonds-Karp](../Edmonds_Karp/README.md): one shortest augmenting path per BFS; Dinic takes them until none of that length is left
- [Ford-Fulkerson](../Ford_Fulkerson/README.md): the method both refine
- [Network Flow](../README.md): the category overview
- [Bipartite Matching](../../Bipartite_Matching/README.md): Hopcroft-Karp runs the same kind of phases on the bipartite graph itself
- [BFS](../../../Traversal/BFS/README.md) and [DFS](../../../Traversal/DFS/README.md): the two searches of every phase
