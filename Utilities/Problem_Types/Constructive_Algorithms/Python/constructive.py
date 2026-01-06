"""
Constructive Algorithm Techniques for Competitive Programming (Python)

Constructive problems ask you to build an object satisfying given constraints.
"""

from typing import List, Optional, Tuple
import heapq
from collections import defaultdict

# Common Patterns

def construct_permutation(n: int, k: int) -> Optional[List[int]]:
    """
    Pattern 1: Permutation Construction
    Build a permutation with exactly k distinct adjacent differences
    """
    if k >= n:
        return None  # Impossible
    
    perm = list(range(1, n + 1))
    
    # Reverse suffix to create k differences
    perm[n - k - 1:] = reversed(perm[n - k - 1:])
    
    return perm


def construct_array_with_sum(n: int, total: int, min_val: int, max_val: int) -> Optional[List[int]]:
    """
    Pattern 2: Array with Given Sum and Constraints
    Build array of size n with elements in [min_val, max_val] summing to total
    """
    if total < n * min_val or total > n * max_val:
        return None  # Impossible
    
    arr = [min_val] * n
    remaining = total - n * min_val
    
    for i in range(n):
        add = min(max_val - min_val, remaining)
        arr[i] += add
        remaining -= add
        if remaining == 0:
            break
    
    return arr


def construct_graph(degrees: List[int]) -> Optional[List[Tuple[int, int]]]:
    """
    Pattern 3: Graph Construction
    Build a simple graph with given degree sequence (Erdős–Gallai)
    """
    n = len(degrees)
    edges = []
    
    # Max heap: (-degree, node)
    pq = [(-d, i) for i, d in enumerate(degrees) if d > 0]
    heapq.heapify(pq)
    
    while pq:
        neg_deg, u = heapq.heappop(pq)
        deg = -neg_deg
        
        if deg == 0:
            continue
        
        # Connect to deg highest-degree nodes
        neighbors = []
        for _ in range(deg):
            if not pq:
                return None  # Impossible
            neighbors.append(heapq.heappop(pq))
        
        for neg_d, v in neighbors:
            edges.append((u, v))
            d = -neg_d
            if d > 1:
                heapq.heappush(pq, (-(d - 1), v))
    
    return edges


def construct_string(n: int, count_a: int, count_b: int) -> Optional[str]:
    """
    Pattern 4: String Construction
    Build string with given character counts, no two same adjacent
    """
    if count_a > count_b + 1 or count_b > count_a + 1:
        return None  # Impossible
    
    result = []
    more = 'a' if count_a >= count_b else 'b'
    less = 'b' if count_a >= count_b else 'a'
    count_more = max(count_a, count_b)
    count_less = min(count_a, count_b)
    
    for i in range(n):
        if i % 2 == 0 and count_more > 0:
            result.append(more)
            count_more -= 1
        elif count_less > 0:
            result.append(less)
            count_less -= 1
        else:
            result.append(more)
            count_more -= 1
    
    return ''.join(result)


def greedy_construction(n: int, constraints: List[int]) -> Optional[List[int]]:
    """
    Pattern 5: Greedy Construction
    Build sequence by greedily choosing elements
    """
    result = []
    available = set(range(1, n + 1))
    
    for c in constraints:
        # Find smallest available element >= constraint
        valid = [x for x in available if x >= c]
        if not valid:
            return None  # Impossible
        
        chosen = min(valid)
        result.append(chosen)
        available.remove(chosen)
    
    return result


def construct_matrix(row_sums: List[int], col_sums: List[int]) -> Optional[List[List[int]]]:
    """
    Pattern 6: Matrix Construction
    Build matrix with given row and column sums
    """
    n, m = len(row_sums), len(col_sums)
    
    if sum(row_sums) != sum(col_sums):
        return None  # Impossible
    
    row_sums = row_sums.copy()
    col_sums = col_sums.copy()
    matrix = [[0] * m for _ in range(n)]
    
    for i in range(n):
        for j in range(m):
            val = min(row_sums[i], col_sums[j])
            matrix[i][j] = val
            row_sums[i] -= val
            col_sums[j] -= val
    
    return matrix


def construct_by_decomposition(target: int) -> List[int]:
    """
    Pattern 7: Decomposition
    Express target as sum of powers of 2
    """
    result = []
    for bit in range(30):
        if target & (1 << bit):
            result.append(1 << bit)
    return result


# Advanced Patterns

def construct_tree(n: int, parent_constraints: List[int]) -> Optional[List[Tuple[int, int]]]:
    """
    Construct a tree with n nodes given parent constraints
    parent_constraints[i] = required parent of node i (0 if any)
    """
    edges = []
    adj = defaultdict(list)
    
    for i in range(1, n):
        parent = parent_constraints[i] if parent_constraints[i] > 0 else i - 1
        if parent >= i:
            return None  # Invalid parent
        edges.append((parent, i))
        adj[parent].append(i)
    
    return edges


def construct_balanced_string(s: str) -> Optional[str]:
    """
    Construct a balanced string from given characters
    (equal number of each character type)
    """
    from collections import Counter
    count = Counter(s)
    
    n = len(s)
    if n % len(count) != 0:
        return None
    
    target = n // len(count)
    
    result = []
    chars = sorted(count.keys())
    
    for _ in range(n):
        for c in chars:
            if count[c] > 0:
                result.append(c)
                count[c] -= 1
                break
    
    return ''.join(result)


# Tips

"""
Tips for Constructive Problems:

1. Start with extreme cases:
   - What if n = 1?
   - What if all values are minimum/maximum?

2. Try small examples by hand first

3. Look for patterns:
   - Sorted arrays
   - Alternating patterns
   - Powers of 2

4. Work backwards:
   - If you know the answer, how was it built?

5. Greedy often works:
   - Build step by step, making locally optimal choices

6. Consider impossibility conditions early:
   - Sum too large/small
   - Parity constraints
   - Graph degree constraints

7. Use invariants:
   - What properties must hold at each step?
"""


if __name__ == "__main__":
    # Example usage
    perm = construct_permutation(5, 3)
    print(f"Permutation: {perm}")
    
    arr = construct_array_with_sum(5, 15, 1, 5)
    print(f"Array with sum 15: {arr}")
    
    s = construct_string(6, 3, 3)
    print(f"String: {s}")
    
    decomp = construct_by_decomposition(13)
    print(f"13 = {' + '.join(map(str, decomp))}")

