"""
Interactive Problem Techniques for Competitive Programming (Python)

Interactive problems require communication with a judge/grader.
Key: Flush output after each query!
"""

import sys
from typing import List, Optional

# Output Flushing

def query(x: int) -> int:
    """Send a query and get response."""
    print(f"? {x}", flush=True)
    return int(input())

def query_multi(*args) -> int:
    """Query with multiple arguments."""
    print("?", *args, flush=True)
    return int(input())

def answer(x: int):
    """Submit final answer."""
    print(f"! {x}", flush=True)

def answer_multi(*args):
    """Submit answer with multiple values."""
    print("!", *args, flush=True)

# Binary Search Interactive

def guess_number(n: int):
    """
    Example: Guess a number between 1 and n
    Judge responds "higher", "lower", or "correct"
    """
    lo, hi = 1, n
    
    while lo < hi:
        mid = (lo + hi) // 2
        
        print(f"? {mid}", flush=True)
        response = input().strip()
        
        if response == "correct":
            return
        elif response == "higher":
            lo = mid + 1
        else:  # "lower"
            hi = mid - 1
    
    print(f"! {lo}", flush=True)


def binary_search_answer(n: int, predicate) -> int:
    """
    Generic interactive binary search.
    predicate(mid) returns True if answer >= mid
    """
    lo, hi = 1, n
    
    while lo < hi:
        mid = (lo + hi + 1) // 2
        
        if predicate(mid):
            lo = mid
        else:
            hi = mid - 1
    
    return lo


# Graph Exploration

def explore_graph(n: int):
    """Example: Explore unknown graph to find connectivity."""
    adj = [[] for _ in range(n + 1)]
    visited = [False] * (n + 1)
    
    def get_neighbors(u: int) -> List[int]:
        print(f"? {u}", flush=True)
        line = input().split()
        return list(map(int, line[1:]))  # First element is count
    
    # BFS exploration
    from collections import deque
    queue = deque([1])
    visited[1] = True
    
    while queue:
        u = queue.popleft()
        neighbors = get_neighbors(u)
        adj[u] = neighbors
        
        for v in neighbors:
            if not visited[v]:
                visited[v] = True
                queue.append(v)
    
    return adj


# Comparison-Based Search

def find_maximum(n: int) -> int:
    """
    Find maximum element using comparisons.
    Query: Compare two elements, get which is larger.
    """
    def compare(i: int, j: int) -> int:
        """Returns 1 if a[i] > a[j], 0 if equal, -1 if less"""
        print(f"? {i} {j}", flush=True)
        return int(input())
    
    max_idx = 1
    
    for i in range(2, n + 1):
        if compare(i, max_idx) > 0:
            max_idx = i
    
    print(f"! {max_idx}", flush=True)
    return max_idx


def tournament(n: int) -> int:
    """Find maximum using tournament-style comparisons."""
    candidates = list(range(1, n + 1))
    
    def compare(i: int, j: int) -> int:
        print(f"? {i} {j}", flush=True)
        return int(input())
    
    while len(candidates) > 1:
        next_round = []
        for i in range(0, len(candidates), 2):
            if i + 1 < len(candidates):
                winner = candidates[i] if compare(candidates[i], candidates[i+1]) > 0 else candidates[i+1]
                next_round.append(winner)
            else:
                next_round.append(candidates[i])
        candidates = next_round
    
    return candidates[0]


# Subset Queries

def guess_subset(n: int) -> List[int]:
    """
    Guess a hidden subset using subset queries.
    Query: Ask if intersection with given subset is non-empty.
    """
    def query_subset(subset: List[int]) -> int:
        print("?", len(subset), *subset, flush=True)
        return int(input())
    
    result = []
    
    # Query each element individually
    for i in range(1, n + 1):
        if query_subset([i]) == 1:
            result.append(i)
    
    print("!", len(result), *result, flush=True)
    return result


def binary_subset_search(n: int) -> List[int]:
    """Efficiently find hidden subset using binary search on bits."""
    def query_mask(mask: int) -> int:
        """Query if hidden number AND mask is non-zero."""
        print(f"? {mask}", flush=True)
        return int(input())
    
    # Find the hidden number bit by bit
    result = 0
    for bit in range(n.bit_length()):
        if query_mask(1 << bit):
            result |= (1 << bit)
    
    return result


# Handling Errors

def check_response() -> bool:
    """Check for invalid response (wrong answer from our side)."""
    response = int(input())
    
    if response == -1:
        # Wrong answer or too many queries
        sys.exit(0)  # Terminate to avoid further errors
    
    return response == 1


# Template

def solve():
    """Main solution function."""
    n = int(input())
    
    # Your interactive solution here
    
    # Remember to flush after each query!
    print("? 1", flush=True)
    response = int(input())
    
    # Final answer
    print(f"! {response}", flush=True)


def main():
    """Main function with optional multiple test cases."""
    t = 1
    # t = int(input())
    
    for _ in range(t):
        solve()


if __name__ == "__main__":
    main()

