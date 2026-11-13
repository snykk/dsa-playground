"""
Fractional Knapsack Problem Implementation

Given items with weights and values, fill a knapsack of capacity W to maximize
total value. Unlike 0/1 knapsack, we can take fractions of items.
"""


def fractional_knapsack(items, capacity):
    """
    Solve fractional knapsack using greedy approach
    
    Args:
        items: List of tuples (value, weight)
        capacity: Maximum weight capacity
        
    Returns:
        Tuple of (max_value, selected_items) where selected_items is
        list of tuples (value, weight, fraction)
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    if not items or capacity <= 0:
        return 0, []
    
    # Calculate value/weight ratio and sort by ratio (descending).
    # A zero-weight item uses no capacity: its ratio is infinite, so it is taken first.
    items_with_ratio = [(v, w, v / w if w else float('inf')) for v, w in items]
    items_with_ratio.sort(key=lambda x: x[2], reverse=True)
    
    total_value = 0
    remaining_capacity = capacity
    selected = []
    
    for value, weight, ratio in items_with_ratio:
        if remaining_capacity <= 0:
            break
        
        if weight <= remaining_capacity:
            # Take entire item
            total_value += value
            remaining_capacity -= weight
            selected.append((value, weight, 1.0))
        else:
            # Take fraction of item
            fraction = remaining_capacity / weight
            total_value += value * fraction
            selected.append((value, weight, fraction))
            remaining_capacity = 0
    
    return total_value, selected


def fractional_knapsack_value_only(items, capacity):
    """
    Return only maximum value (more efficient)
    
    Args:
        items: List of tuples (value, weight)
        capacity: Maximum weight capacity
        
    Returns:
        Maximum value achievable
    """
    if not items or capacity <= 0:
        return 0
    
    # Sort by value/weight ratio (a zero-weight item is free: infinite ratio)
    items_with_ratio = [(v, w, v / w if w else float('inf')) for v, w in items]
    items_with_ratio.sort(key=lambda x: x[2], reverse=True)
    
    total_value = 0
    remaining = capacity
    
    for value, weight, _ in items_with_ratio:
        if remaining <= 0:
            break
        
        take = min(weight, remaining)
        total_value += value * (take / weight) if weight else value
        remaining -= take
    
    return total_value

