# Rotating Calipers - Python

This folder contains a Python implementation of the **rotating calipers** technique for solving various geometric problems.

---

## Concept

Rotating calipers is a technique used to solve several geometric problems efficiently after computing the convex hull. It uses two parallel lines that "rotate" around the convex polygon to find optimal solutions.

**Key Features:**
- Efficient: O(n) time complexity after convex hull computation
- Versatile: Solves multiple geometric problems
- Requires convex hull as input
- Clean, readable Python implementation

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `rotating_calipers_diameter(hull)` | Find maximum distance between any two points | O(n) |
| `rotating_calipers_width(hull)` | Find minimum distance between parallel lines | O(n) |
| `rotating_calipers_perimeter(hull)` | Calculate perimeter of convex hull | O(n) |
| `rotating_calipers_area(hull)` | Calculate area using shoelace formula | O(n) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Diameter | O(n) | O(1) |
| Width | O(n) | O(1) |
| Perimeter | O(n) | O(1) |
| Area | O(n) | O(1) |

**Note:** These complexities assume convex hull is already computed. Total complexity including convex hull is O(n log n).

---

## Usage

```python
from rotating_calipers import Point, rotating_calipers_diameter, rotating_calipers_width

# Convex hull (assumed to be already computed)
hull = [
    Point(0, 0), Point(4, 0), Point(4, 3), Point(0, 3)
]

# Find diameter
diameter, p1, p2 = rotating_calipers_diameter(hull)

# Find width
width = rotating_calipers_width(hull)

# Calculate perimeter
perimeter = rotating_calipers_perimeter(hull)

# Calculate area
area = rotating_calipers_area(hull)
```

---

## Run Test

```bash
python -m unittest rotating_calipers_test.py
```

Or:

```bash
python rotating_calipers_test.py
```

---

## Important Notes

1. **Convex Hull Required**: Input must be a convex hull (use Graham's Scan or Jarvis March)
2. **Counterclockwise Order**: Points should be in counterclockwise order
3. **Antipodal Pairs**: Algorithm finds antipodal pairs efficiently
4. **Shoelace Formula**: Area calculation uses shoelace formula

---

## When to Use

- **Diameter**: Finding maximum distance in point set
- **Width**: Finding minimum width of shape
- **Perimeter/Area**: Calculating geometric properties
- **After Convex Hull**: When you need additional properties of convex hull

---

## Related Files

- Main README: `../README.md`
- C++ Implementation: `../../C++/`
- Go Implementation: `../../Go/`

---

_Last Updated: December 2025_
