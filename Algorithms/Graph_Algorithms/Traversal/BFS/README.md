# BFS (Breadth-First Search)

Breadth-First Search visits a graph in rings around a start vertex, nearest first, using a queue. In an unweighted graph it finds the fewest-edge path to every reachable vertex in O(V + E) time and O(V) space.

## Intuition

Drop a stone in a pond: the ripple reaches everything one step away, then two steps away, and so on. BFS does the same with a FIFO queue. Vertices discovered earlier are expanded earlier, so the queue always holds vertices of distance d followed by vertices of distance d + 1.

That is the invariant that makes BFS correct: a vertex of distance d + 1 can only be discovered while a distance-d vertex is being expanded, and all distance-d vertices leave the queue first. So the first time a vertex is discovered, it is discovered along a shortest path, and its distance never needs to be revised.

## Visual

```text
Graph (start A):            Rings (BFS distance):

    B --- D --- F           distance 0:  A
   /      |     |           distance 1:  B  C
  A       |     |           distance 2:  D  E
   \      |     |           distance 3:  F  G
    C --- +     |
     \          |           Queue over time (front on the left):
      E --------+--- G      [A] -> [B C] -> [C D] -> [D E] -> [E F] -> [F G] -> [G] -> []
```

(The edges are A-B, A-C, B-D, C-D, C-E, D-F, E-F, E-G.)

## How It Works

1. Mark the start vertex visited and put it in the queue.
2. While the queue is not empty, dequeue a vertex and report it.
3. For each neighbor not yet visited, mark it visited **now** and enqueue it.
4. When the queue is empty, every vertex reachable from the start has been visited once.

For paths, store `parent[w] = v` when `w` is discovered and walk the parents back from the target. Copying the whole path into each queue entry would cost O(V^2) on a long path.

## Step-by-Step Trace

Graph above with A to G numbered 0 to 6 and neighbors scanned in increasing order (output of `bfs_adjacency_list`, `bfs_level_order` and `bfs_with_path` on this graph):

| Dequeue | New neighbors queued | Queue after |
|---------|----------------------|-------------|
| A | B, C | B C |
| B | D | C D |
| C | E | D E |
| D | F | E F |
| E | G | F G |
| F | none | G |
| G | none | empty |

- Visit order: A, B, C, D, E, F, G
- Levels: `[[0], [1, 2], [3, 4], [5, 6]]`
- Shortest path from A to G: `[0, 2, 4, 6]` (A, C, E, G)

## Complexity

| Quantity | Cost | Why |
|----------|------|-----|
| Time | O(V + E) | each vertex is queued and dequeued once, each adjacency list is scanned once |
| Space | O(V) | visited set and queue hold each vertex at most once |

With an adjacency matrix the neighbor scan costs O(V) per vertex, so the total becomes O(V^2).

## When to Use

Use BFS when you need:

- the fewest edges between two vertices, or to every vertex;
- vertices grouped by distance (level order);
- the connected components of an undirected graph;
- multi-source distances: start with all sources in the queue.

Do not use it for weighted shortest paths (use Dijkstra's algorithm), or when you need cycle detection by edge type or a topological order (use DFS).

## BFS vs. Alternatives

| Algorithm | Time | Edge weights | Finds |
|-----------|------|--------------|-------|
| BFS | O(V + E) | all equal | fewest edges |
| DFS | O(V + E) | ignored | any path, structure of the graph |
| Dijkstra's | O((V + E) log V) | non-negative | least total weight |
| Bellman-Ford | O(V * E) | negative allowed | least total weight |

## Common Pitfalls

- **Marking on dequeue.** A vertex can be queued many times before it is first dequeued. Mark on enqueue.
- **Weighted graphs.** BFS counts edges, not weights.
- **List as a queue.** `list.pop(0)` makes each dequeue O(V). Use `collections.deque`.
- **Target must be a key.** A vertex that appears only in neighbor lists is still reachable. The code reads neighbors with an empty default, so this works.
- **Directed input to components.** `bfs_connected_components` expects a symmetric adjacency list. On a directed graph it returns the vertices first reached from each unvisited key, not strongly connected components.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `bfs.py` | five functions, including `bfs_connected_components`; `deque` queue; "not found" is `None` |
| C++ | [C++/](C++/) | `bfs.cpp` | four functions; `std::queue`; "not found" is an empty vector |
| Go | [Go/](Go/) | `main.go` | four functions; slice as queue; "not found" is an empty slice |

## Practice Problems

- [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) (LeetCode)
- [Shortest Path in Binary Matrix](https://leetcode.com/problems/shortest-path-in-binary-matrix/) (LeetCode)
- [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) (LeetCode, multi-source)
- [Word Ladder](https://leetcode.com/problems/word-ladder/) (LeetCode)
- [Message Route](https://cses.fi/problemset/task/1667) and [Labyrinth](https://cses.fi/problemset/task/1193) (CSES)

## Related

- [DFS](../DFS/) - the stack-based counterpart
- [Dijkstra's Algorithm](../../Shortest_Path/Dijkstra's_Algorithm/) - weighted shortest paths
- [A* Search](../../Shortest_Path/A_Star_Search_Algorithm/) - BFS guided by a heuristic
- [Queue](../../../../Data%20Structures/Linear/Queue/) - the data structure BFS relies on
