# A* Search Algorithm - Python

**A* Search Algorithm** is an informed search algorithm that finds the shortest path from a start node to a goal node using a heuristic function to guide the search.

---

## Overview

A* is a best-first search algorithm that:
- Uses heuristic function to guide search
- Guarantees optimal solution if heuristic is admissible
- More efficient than Dijkstra's for pathfinding
- Commonly used in games and robotics

**Key Insight**: Uses f(n) = g(n) + h(n) where g(n) is actual cost and h(n) is heuristic estimate.

---

## Algorithm

1. **Initialize**: Add start to priority queue with f_score = g_score + h_score
2. **Process**: While queue is not empty:
   - Extract node with minimum f_score
   - If goal reached, return path
   - For each neighbor:
     - Calculate tentative g_score
     - If better path found, update and add to queue
3. **Repeat**: Until goal found or queue empty

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(b^d) | O(b^d) |

**Note**: 
- b = branching factor
- d = depth of solution
- Depends on quality of heuristic

---

## Implementation Details

### Functions

1. **`astar(graph, start, goal, heuristic)`**
   - Finds shortest path from start to goal
   - Returns (distance, path) or None
   - Time: O(b^d), Space: O(b^d)

2. **`manhattan_distance(pos1, pos2)`**
   - Manhattan distance heuristic for grid problems
   - Returns integer distance

3. **`euclidean_distance(pos1, pos2)`**
   - Euclidean distance heuristic
   - Returns float distance

---

## Usage

```python
from astar import astar, manhattan_distance

graph = {
    0: [(1, 4), (2, 2)],
    1: [(3, 5)],
    2: [(3, 1)],
    3: []
}

# Simple heuristic
def heuristic(node):
    return 0 if node == 3 else 1

result = astar(graph, 0, 3, heuristic)
if result:
    distance, path = result
    print(f"Distance: {distance}, Path: {path}")  # Distance: 3, Path: [0, 2, 3]
```

---

## Important Notes

1. **Admissible heuristic**: Heuristic must never overestimate actual cost
2. **Consistent heuristic**: For optimal performance, heuristic should be consistent
3. **Optimal**: Guarantees optimal solution if heuristic is admissible
4. **Efficient**: More efficient than Dijkstra's for pathfinding

---

## Advantages

1. ✅ **Optimal**: Guarantees optimal solution with admissible heuristic
2. ✅ **Efficient**: More efficient than Dijkstra's for pathfinding
3. ✅ **Informed**: Uses heuristic to guide search
4. ✅ **Versatile**: Works with various heuristic functions

---

## Disadvantages

1. ❌ **Heuristic dependent**: Performance depends on heuristic quality
2. ❌ **Memory**: May use significant memory for large graphs
3. ❌ **Complexity**: More complex than Dijkstra's

---

## When to Use

- ✅ Pathfinding in games
- ✅ Robotics navigation
- ✅ When good heuristic is available
- ✅ Need optimal solution
- ❌ No good heuristic available
- ❌ Very large graphs (may be slow)

---

## Testing

```bash
python astar_test.py
```

---

## Related Algorithms

- **Dijkstra's**: Uninformed search (h(n) = 0)
- **Greedy Best-First**: Uses only heuristic (g(n) = 0)
- **BFS**: Uninformed search for unweighted graphs

---

## Applications

1. **Game AI**: Pathfinding in games
2. **Robotics**: Navigation and path planning
3. **GPS**: Route finding
4. **Puzzle Solving**: Solving puzzles with heuristics

---

## References

- "Artificial Intelligence: A Modern Approach" by Russell & Norvig
- "Introduction to Algorithms" by CLRS

---

_Last Updated: December 2025_


