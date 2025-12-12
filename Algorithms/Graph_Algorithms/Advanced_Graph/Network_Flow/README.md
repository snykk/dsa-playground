# Network Flow

**Network Flow** algorithms find the maximum flow in a flow network, which represents the maximum amount of flow that can be sent from a source to a sink.

---

## Overview

Network flow problems model many real-world scenarios:
- Transportation networks
- Communication networks
- Resource allocation
- Bipartite matching

---

## Algorithms

### 1. Ford-Fulkerson Algorithm
- **Time Complexity**: O(E × max_flow)
- **Approach**: DFS to find augmenting paths
- **Best For**: Simple implementation

### 2. Edmonds-Karp Algorithm
- **Time Complexity**: O(V × E²)
- **Approach**: BFS to find shortest augmenting paths
- **Best For**: Guaranteed polynomial time

---

## Key Concepts

- **Residual Graph**: Graph with residual capacities
- **Augmenting Path**: Path from source to sink with positive capacity
- **Max-Flow Min-Cut Theorem**: Maximum flow equals minimum cut capacity

---

## Implementations

- **[Ford-Fulkerson](./Ford-Fulkerson/)** - DFS-based algorithm
- **[Edmonds-Karp](./Edmonds-Karp/)** - BFS-based algorithm

---

## Applications

1. **Network Flow**: Maximum flow in networks
2. **Bipartite Matching**: Maximum matching
3. **Image Segmentation**: Min-cut for segmentation
4. **Resource Allocation**: Optimal resource allocation

---

_Last Updated: December 2025_

