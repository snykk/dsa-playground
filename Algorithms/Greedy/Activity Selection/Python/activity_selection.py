"""
Activity Selection Problem Implementation

Given n activities with their start and finish times, select the maximum
number of activities that can be performed by a single person, assuming
that a person can only work on a single activity at a time.
"""


def activity_selection(activities):
    """
    Select maximum number of non-overlapping activities using greedy approach
    
    Args:
        activities: List of tuples (start_time, finish_time)
        
    Returns:
        List of selected activity indices (0-indexed)
        
    Time Complexity: O(n log n)
    Space Complexity: O(1) excluding output
    """
    if not activities:
        return []
    
    # Sort activities by finish time
    sorted_activities = sorted(enumerate(activities), key=lambda x: x[1][1])
    
    selected = [sorted_activities[0][0]]  # Select first activity
    last_finish = sorted_activities[0][1][1]
    
    # Select activities that don't overlap with previously selected
    for idx, (start, finish) in sorted_activities[1:]:
        if start >= last_finish:
            selected.append(idx)
            last_finish = finish
    
    return selected


def activity_selection_with_weights(activities):
    """
    Activity Selection with weights (maximize total weight)
    Uses dynamic programming approach as greedy doesn't work here
    
    Args:
        activities: List of tuples (start_time, finish_time, weight)
        
    Returns:
        Maximum total weight achievable
    """
    if not activities:
        return 0
    
    # Sort by finish time
    sorted_activities = sorted(activities, key=lambda x: x[1])
    n = len(sorted_activities)
    
    # DP[i] = maximum weight achievable considering first i activities
    dp = [0] * (n + 1)
    
    for i in range(1, n + 1):
        start, finish, weight = sorted_activities[i - 1]
        
        # Don't include current activity
        dp[i] = dp[i - 1]
        
        # Try including current activity
        # Find last activity that doesn't overlap
        for j in range(i - 1, 0, -1):
            if sorted_activities[j - 1][1] <= start:
                dp[i] = max(dp[i], dp[j] + weight)
                break
        else:
            # No previous activity, can include this one
            dp[i] = max(dp[i], weight)
    
    return dp[n]


def activity_selection_recursive(activities, selected=None, last_finish=-1):
    """
    Recursive implementation of activity selection
    
    Args:
        activities: List of tuples (index, start_time, finish_time)
        selected: List of selected indices
        last_finish: Finish time of last selected activity
        
    Returns:
        List of selected activity indices
    """
    if selected is None:
        # Sort by finish time and add index
        sorted_activities = sorted(enumerate(activities), key=lambda x: x[1][1])
        activities_with_idx = [(idx, start, finish) for idx, (start, finish) in sorted_activities]
        return activity_selection_recursive(activities_with_idx, [], -1)
    
    if not activities:
        return selected
    
    idx, start, finish = activities[0]
    
    # If current activity doesn't overlap, select it
    if start >= last_finish:
        return activity_selection_recursive(activities[1:], selected + [idx], finish)
    else:
        # Skip current activity
        return activity_selection_recursive(activities[1:], selected, last_finish)

