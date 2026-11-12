# Advanced Graph Algorithms

Advanced algorithms for complex graph problems.

## Topics

| Algorithm | Description |
|-----------|-------------|
| [Topological Sort](Topological_Sort/) | Linear ordering of DAG vertices |
| [Strongly Connected Components](Strongly_Connected_Components/) | Kosaraju's and Tarjan's algorithms |
| [Bridges and Articulation Points](Tarjan_Bridges_Articulation/) | Critical edges and vertices |
| [2-SAT](2_SAT/) | Boolean satisfiability with two literals per clause |
| [Network Flow](Network_Flow/) | Maximum flow: Ford-Fulkerson and Edmonds-Karp |
| [Union-Find (DSU)](../../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/) | Disjoint sets with union by rank and path compression |

## Complexity

| Algorithm | Time | Space |
|-----------|------|-------|
| Topological Sort | O(V + E) | O(V) |
| SCC (Kosaraju/Tarjan) | O(V + E) | O(V) |
| Articulation Points | O(V + E) | O(V) |
| Bridges | O(V + E) | O(V) |

## Applications

- **Topological Sort**: Task scheduling, dependency resolution
- **SCC**: Analyzing strongly connected regions
- **Articulation Points**: Network reliability
- **Bridges**: Finding critical connections

