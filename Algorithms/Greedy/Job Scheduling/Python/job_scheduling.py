"""
Job Scheduling Problem Implementation

Given jobs with deadlines and profits, schedule jobs to maximize profit.
Each job takes 1 unit of time to complete.
"""


def job_scheduling_deadline(jobs):
    """
    Schedule jobs with deadlines to maximize profit
    
    Args:
        jobs: List of tuples (job_id, deadline, profit)
        
    Returns:
        Tuple of (max_profit, scheduled_jobs)
        
    Time Complexity: O(n log n + n * min(D, n)), D = largest deadline
    Space Complexity: O(n)
    """
    if not jobs:
        return 0, []
    
    # Sort jobs by profit (descending)
    sorted_jobs = sorted(jobs, key=lambda x: x[2], reverse=True)
    
    # Find maximum deadline
    max_deadline = max(job[1] for job in sorted_jobs)
    
    # Time slots: None means empty (a job id such as -1 must not look like a free slot)
    time_slots = [None] * (max_deadline + 1)
    scheduled = []
    total_profit = 0
    
    for job_id, deadline, profit in sorted_jobs:
        # Find latest available slot before deadline
        for slot in range(deadline, 0, -1):
            if time_slots[slot] is None:
                time_slots[slot] = job_id
                scheduled.append(job_id)
                total_profit += profit
                break
    
    return total_profit, scheduled


def job_scheduling_earliest_deadline(jobs):
    """
    Schedule jobs to minimize maximum lateness
    Uses earliest deadline first (EDF) strategy
    
    Args:
        jobs: List of tuples (job_id, deadline, processing_time)
        
    Returns:
        List of scheduled job IDs in order
    """
    if not jobs:
        return []
    
    # Sort by deadline (earliest first)
    sorted_jobs = sorted(jobs, key=lambda x: x[1])
    
    return [job[0] for job in sorted_jobs]


def job_scheduling_weighted_completion_time(jobs):
    """
    Minimize weighted sum of completion times
    Sort by weight/processing_time ratio (descending)
    
    Args:
        jobs: List of tuples (job_id, processing_time, weight)
        
    Returns:
        List of scheduled job IDs and total weighted completion time
    """
    if not jobs:
        return [], 0
    
    # Sort by weight/processing_time ratio (descending)
    sorted_jobs = sorted(jobs, key=lambda x: x[2]/x[1], reverse=True)
    
    scheduled = [job[0] for job in sorted_jobs]
    completion_time = 0
    total_weighted = 0
    
    for _, processing_time, weight in sorted_jobs:
        completion_time += processing_time
        total_weighted += weight * completion_time
    
    return scheduled, total_weighted

