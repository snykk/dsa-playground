"""
Closest Pair of Points Implementation

Finds the closest pair of points in a 2D plane using divide and conquer algorithm.
Time Complexity: O(n log n): the points are sorted by x and by y once, and every
level of the recursion splits and merges in linear time.
"""

import math
from collections import Counter


def distance(p1, p2):
    """Calculate Euclidean distance between two points"""
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)


def brute_force_closest_pair(points):
    """
    Find closest pair using brute force (for small sets)
    
    Args:
        points: List of (x, y) tuples
        
    Returns:
        Tuple of (min_distance, point1, point2)
        
    Time Complexity: O(n^2)
    """
    n = len(points)
    min_dist = float('inf')
    closest_pair = None
    
    for i in range(n):
        for j in range(i + 1, n):
            dist = distance(points[i], points[j])
            if dist < min_dist:
                min_dist = dist
                closest_pair = (points[i], points[j])
    
    return min_dist, closest_pair[0], closest_pair[1]


def split_by_membership(points_y, left_x):
    """
    Split points_y (sorted by y) into the points that belong to left_x and the rest,
    keeping the y order. Membership is by coordinates with multiplicity, so repeated x
    values and duplicate points are split exactly like points_x was.

    Returns:
        Tuple of (left_y, right_y)
    """
    remaining = Counter((p[0], p[1]) for p in left_x)
    left_y, right_y = [], []
    for p in points_y:
        key = (p[0], p[1])
        if remaining[key] > 0:
            remaining[key] -= 1
            left_y.append(p)
        else:
            right_y.append(p)
    return left_y, right_y


def closest_pair_recursive(points_x, points_y):
    """
    Recursive function to find closest pair
    
    Args:
        points_x: Points sorted by x-coordinate
        points_y: Points sorted by y-coordinate
        
    Returns:
        Tuple of (min_distance, point1, point2)
    """
    n = len(points_x)
    
    # Base case: use brute force for small sets
    if n <= 3:
        return brute_force_closest_pair(points_x)
    
    # Divide: split points into left and right halves
    mid = n // 2
    mid_point = points_x[mid]
    
    # Split points_x
    left_x = points_x[:mid]
    right_x = points_x[mid:]
    
    # Split points_y maintaining y-sort. Split by membership in left_x, not by x <= mid_x:
    # with repeated x values the two lists would no longer match the two halves.
    left_y, right_y = split_by_membership(points_y, left_x)
    
    # Conquer: find closest pair in each half
    dist_left, p1_left, p2_left = closest_pair_recursive(left_x, left_y)
    dist_right, p1_right, p2_right = closest_pair_recursive(right_x, right_y)
    
    # Find minimum distance from both halves
    if dist_left < dist_right:
        min_dist = dist_left
        closest_pair = (p1_left, p2_left)
    else:
        min_dist = dist_right
        closest_pair = (p1_right, p2_right)
    
    # Combine: check for closer pairs across the dividing line
    strip = [p for p in points_y if abs(p[0] - mid_point[0]) < min_dist]
    
    # Check points in strip (at most 6 points need to be checked)
    for i in range(len(strip)):
        j = i + 1
        # Only check next 7 points (geometric property)
        while j < len(strip) and (strip[j][1] - strip[i][1]) < min_dist:
            dist = distance(strip[i], strip[j])
            if dist < min_dist:
                min_dist = dist
                closest_pair = (strip[i], strip[j])
            j += 1
    
    return min_dist, closest_pair[0], closest_pair[1]


def closest_pair(points):
    """
    Find the closest pair of points in 2D plane
    
    Args:
        points: List of (x, y) tuples
        
    Returns:
        Tuple of (min_distance, point1, point2)
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    if len(points) < 2:
        raise ValueError("Need at least 2 points")
    
    # Sort points by x-coordinate
    points_x = sorted(points, key=lambda p: p[0])
    
    # Sort points by y-coordinate
    points_y = sorted(points, key=lambda p: p[1])
    
    return closest_pair_recursive(points_x, points_y)


def closest_pair_optimized(points):
    """
    Same algorithm with a cap on the strip scan (at most 6 following points per point)
    and ties in the sort broken by the other coordinate.
    
    Args:
        points: List of (x, y) tuples
        
    Returns:
        Tuple of (min_distance, point1, point2)
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    if len(points) < 2:
        raise ValueError("Need at least 2 points")
    
    # Pre-sort by x and y
    points_x = sorted(points, key=lambda p: (p[0], p[1]))
    points_y = sorted(points, key=lambda p: (p[1], p[0]))
    
    return closest_pair_recursive_optimized(points_x, points_y)


def closest_pair_recursive_optimized(points_x, points_y):
    """Optimized recursive function"""
    n = len(points_x)
    
    if n <= 3:
        return brute_force_closest_pair(points_x)
    
    mid = n // 2
    mid_point = points_x[mid]
    
    # Split maintaining sorted order
    left_x = points_x[:mid]
    right_x = points_x[mid:]
    
    left_y, right_y = split_by_membership(points_y, left_x)
    
    # Recursive calls
    dist_left, p1_left, p2_left = closest_pair_recursive_optimized(left_x, left_y)
    dist_right, p1_right, p2_right = closest_pair_recursive_optimized(right_x, right_y)
    
    if dist_left < dist_right:
        min_dist = dist_left
        closest_pair = (p1_left, p2_left)
    else:
        min_dist = dist_right
        closest_pair = (p1_right, p2_right)
    
    # Build strip efficiently
    strip = [p for p in points_y if abs(p[0] - mid_point[0]) < min_dist]
    
    # Check strip (geometric property: at most 6 points per point)
    for i in range(len(strip)):
        for j in range(i + 1, min(i + 7, len(strip))):
            if (strip[j][1] - strip[i][1]) >= min_dist:
                break
            dist = distance(strip[i], strip[j])
            if dist < min_dist:
                min_dist = dist
                closest_pair = (strip[i], strip[j])
    
    return min_dist, closest_pair[0], closest_pair[1]

