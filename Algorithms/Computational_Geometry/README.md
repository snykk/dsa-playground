# Computational Geometry

A comprehensive collection of **Computational Geometry** algorithms, including basic geometric operations and advanced geometric algorithms.

---

## Overview

This folder contains implementations of fundamental computational geometry algorithms in Python, C++, and Go. Each algorithm includes:
- Complete implementation
- Comprehensive test suites
- Detailed documentation
- Complexity analysis

---

## Categories

### 🔹 Basic Geometry

- **[Point, Line, Circle Operations](Basic_Geometry/Point_Line_Circle/)**
  - Fundamental geometric primitives
  - Time: O(1) for most operations
  - Foundation for advanced algorithms

- **[Line Intersection](Basic_Geometry/Line_Intersection/)**
  - Find intersections between lines and segments
  - Time: O(1) for intersection checks
  - Essential for geometric queries

---

### 🔹 Advanced Geometry

- **[Convex Hull](Advanced_Geometry/Convex_Hull/)**
  - Graham's Scan and Jarvis March algorithms
  - Time: O(n log n) for Graham's Scan, O(nh) for Jarvis March
  - Finds smallest convex polygon containing all points

- **[Closest Pair of Points](Advanced_Geometry/Closest_Pair_of_Points/)**
  - Divide and conquer algorithm
  - Time: O(n log n)
  - Finds closest pair in 2D plane

- **[Rotating Calipers](Advanced_Geometry/Rotating_Calipers/)**
  - Algorithm for various geometric problems
  - Time: O(n) after convex hull
  - Finds diameter, width, and other properties

---

## Comparison

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|-------------------|----------|
| **Point Operations** | O(1) | O(1) | Basic geometric queries |
| **Line Intersection** | O(1) | O(1) | Intersection checks |
| **Graham's Scan** | O(n log n) | O(n) | Convex hull (general) |
| **Jarvis March** | O(nh) | O(n) | Convex hull (few hull points) |
| **Closest Pair** | O(n log n) | O(n) | Finding closest points |
| **Rotating Calipers** | O(n) | O(n) | Convex hull properties |

---

## When to Use

- **Point, Line, Circle**: Basic geometric operations
- **Line Intersection**: Polygon operations, collision detection
- **Convex Hull**: Shape analysis, path planning
- **Closest Pair**: Spatial queries, clustering
- **Rotating Calipers**: Diameter, width, minimum bounding box

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 33)
- "Computational Geometry in C" by Joseph O'Rourke
- "Algorithm Design Manual" by Steven Skiena
- "Computational Geometry" by de Berg et al.

---

_Last Updated: December 2025_
