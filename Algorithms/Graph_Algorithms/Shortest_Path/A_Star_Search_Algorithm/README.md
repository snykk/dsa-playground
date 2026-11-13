# A* Search Algorithm

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
| **Worst Case** | O(b^d) | O(b^d) |

**Note**: 
- b = branching factor
- d = depth of solution
- Depends on quality of heuristic

---

## Key Characteristics

- ✅ **Optimal**: Guarantees optimal solution with admissible heuristic
- ✅ **Efficient**: More efficient than Dijkstra's for pathfinding
- ✅ **Informed**: Uses heuristic to guide search
- ✅ **Versatile**: Works with various heuristic functions
- ❌ **Heuristic dependent**: Performance depends on heuristic quality
- ❌ **Memory**: May use significant memory for large graphs

---

## When to Use

- ✅ Pathfinding in games
- ✅ Robotics navigation
- ✅ When good heuristic is available
- ✅ Need optimal solution
- ❌ No good heuristic available
- ❌ Very large graphs (may be slow)

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

_Last Updated: December 2025_


