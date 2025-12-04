# Graphs

This folder contains implementations of various **Graph Data Structures** and representations - non-linear data structures consisting of vertices (nodes) connected by edges.

---

## Overview

Graphs are fundamental non-linear data structures that represent relationships between objects. A graph consists of a set of vertices (nodes) and a set of edges (connections) between pairs of vertices.

---

## Graph Types

### 1. Graph Representations

- **Edge List**: Simple list of all edges
- **Adjacency Matrix**: 2D array representation (V × V)
- **Adjacency List**: Dictionary/map of lists representation

### 2. Graph Classifications

- **Directed Graph**: Edges have direction (A → B)
- **Undirected Graph**: Edges are bidirectional (A ↔ B)
- **Weighted Graph**: Edges have associated weights (costs, distances)
- **Unweighted Graph**: All edges have equal weight (default: 1)

---

## Graph Characteristics

| Representation | Space | Edge Lookup | Get Neighbors | Add Edge | Best For |
| -------------- | ----- | ---------- | ------------- |--------- | -------- |
| Edge List | O(E) | O(E) | O(E) | O(1) | Sparse graphs, edge iteration |
| Adjacency Matrix | O(V²) | O(1) | O(V) | O(1) | Dense graphs, fast lookups |
| Adjacency List | O(V + E) | O(V) | O(1) | O(1) | Sparse graphs, most common |

---

## Graph Properties

### Directed vs Undirected

**Directed Graph:**
- Edges have direction (A → B)
- Edge from A to B does not imply edge from B to A
- Example: Web links, dependencies, one-way streets

**Undirected Graph:**
- Edges are bidirectional (A ↔ B)
- Edge between A and B works both ways
- Example: Social networks, friendships, two-way roads

### Weighted vs Unweighted

**Weighted Graph:**
- Edges have weights (costs, distances, values)
- Useful for finding shortest paths, minimum spanning trees
- Example: Road networks with distances, network latency

**Unweighted Graph:**
- All edges have equal weight (typically 1)
- Simpler representation
- Example: Social networks, organizational charts

---

## Common Operations

| Operation | Edge List | Adjacency Matrix | Adjacency List |
| --------- | --------- | ---------------- | -------------- |
| Add Vertex | O(1) | O(V²) | O(1) |
| Add Edge | O(1) | O(1) | O(1) |
| Remove Edge | O(E) | O(1) | O(V) |
| Check Edge | O(E) | O(1) | O(V) |
| Get Neighbors | O(E) | O(V) | O(1) |
| BFS/DFS | O(V + E) | O(V²) | O(V + E) |
| Space | O(E) | O(V²) | O(V + E) |

---

## Graph Traversal Algorithms

### Breadth-First Search (BFS)
- Uses queue
- Explores level by level
- Finds shortest path (unweighted graphs)
- Time: O(V + E)

### Depth-First Search (DFS)
- Uses stack (iterative) or recursion
- Explores as deep as possible
- Useful for cycle detection, topological sort
- Time: O(V + E)

---

## Implementations

### 1. Edge List
- **Location**: `Edge List/`
- **Description**: Simple list of edges representation
- **Best For**: Sparse graphs, edge iteration, Kruskal's algorithm
- **Space**: O(E)

### 2. Directed & Undirected Graph
- **Location**: `Directed & Undirected/`
- **Description**: Basic graph with direction support
- **Best For**: Understanding graph direction concepts
- **Space**: O(V + E)

### 3. Weighted & Unweighted Graph
- **Location**: `Weighted & Unweighted/`
- **Description**: Graph with edge weight support
- **Best For**: Shortest path algorithms, MST algorithms
- **Space**: O(V + E)

### 4. Adjacency Matrix
- **Location**: `Adjacency Matrix/`
- **Description**: 2D array representation
- **Best For**: Dense graphs, fast edge lookups
- **Space**: O(V²)

### 5. Adjacency List
- **Location**: `Adjacency List/`
- **Description**: Dictionary/map of lists representation
- **Best For**: Sparse graphs, most real-world applications
- **Space**: O(V + E)

---

## When to Use Each Representation

### Use Edge List when:
- Graph is **sparse** (few edges, E << V²)
- Need to **iterate all edges** frequently
- Working with **edge-based algorithms** (Kruskal's MST)
- **Memory is limited**

### Use Adjacency Matrix when:
- Graph is **dense** (many edges, E ≈ V²)
- Need **fast edge lookups** (O(1))
- **Fixed number of vertices** known in advance
- Performing **matrix operations**

### Use Adjacency List when:
- Graph is **sparse** (few edges, E << V²)
- Need **frequent neighbor queries**
- **Dynamic graph** (adding/removing vertices)
- Most **real-world graphs** (social networks, web graphs)

---

## Applications

- **Social Networks**: Friend connections, follower relationships
- **Web Crawling**: Page links, hyperlink structure
- **Network Routing**: Internet routing, shortest path finding
- **Dependency Resolution**: Package dependencies, build systems
- **Recommendation Systems**: User-item relationships
- **Game Development**: Pathfinding, game maps
- **Compiler Design**: Control flow graphs, dependency graphs
- **Database Systems**: Entity relationships, query optimization

---

## Learning Path

1. **Start with Basic Concepts**
   - Understand vertices and edges
   - Learn directed vs undirected
   - Learn weighted vs unweighted

2. **Learn Representations**
   - Edge List (simplest)
   - Adjacency List (most common)
   - Adjacency Matrix (for dense graphs)

3. **Master Traversal**
   - BFS (Breadth-First Search)
   - DFS (Depth-First Search)

4. **Advanced Algorithms**
   - Shortest path (Dijkstra's, Bellman-Ford)
   - Minimum spanning tree (Kruskal's, Prim's)
   - Topological sort
   - Strongly connected components

---

## Complexity Summary

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Vertex | O(1) | O(1) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(V) to O(E) | O(1) |
| Check Edge | O(1) to O(E) | O(1) |
| Get Neighbors | O(1) to O(V) | O(degree) |
| BFS/DFS | O(V + E) | O(V) |
| Shortest Path | O(V log V + E) | O(V) |
| MST | O(E log E) | O(V) |

---

## Related Data Structures

- **Trees**: Special case of graphs (connected, acyclic)
- **Heaps**: Used in graph algorithms (priority queues)
- **Hash Tables**: Used for efficient vertex lookups

---

## Subfolders

- **Edge List/**: Simple edge list representation
- **Directed & Undirected/**: Graph direction support
- **Weighted & Unweighted/**: Edge weight support
- **Adjacency Matrix/**: 2D array representation
- **Adjacency List/**: Dictionary/map representation

Each subfolder contains:
- Python implementation (`Python/`)
- C++ implementation (`C++/`)
- Go implementation (`Go/`)
- Comprehensive README.md files
- Test files for each language

---

## Next Steps

After mastering graph data structures, explore:
- **Graph Algorithms**: BFS, DFS, shortest paths, MST
- **Advanced Graph**: Topological sort, SCC, network flow
- **Graph Problems**: Pathfinding, connectivity, cycles

---

**Happy Learning! 🚀**

