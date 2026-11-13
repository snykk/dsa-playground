"""
Dynamic Programming on Graphs

DP problems on graph structures (DAG, trees, etc.)
"""


def dag_longest_path(graph, start):
    """
    Longest path in DAG using DP
    
    Args:
        graph: Adjacency list representation
        start: Starting node
        
    Returns:
        Length (in edges) of the longest path starting at start

    Raises:
        ValueError: if a cycle is reachable from start
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    def dfs(node):
        if node in dp:
            return dp[node]
        if node in on_stack:
            raise ValueError("graph has a cycle: longest path is undefined")

        on_stack.add(node)
        max_path = 0

        for neighbor in graph.get(node, []):
            max_path = max(max_path, dfs(neighbor))

        on_stack.discard(node)
        dp[node] = max_path + 1
        return dp[node]

    on_stack = set()  # nodes whose DFS call is still running
    dp = {}  # finished nodes: number of nodes on the longest path starting there
    return dfs(start) - 1
