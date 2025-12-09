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
        Length of longest path
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    def dfs(node, visited, dp):
        if node in visited:
            return dp.get(node, 0)
        
        visited.add(node)
        max_path = 0
        
        for neighbor in graph.get(node, []):
            path_len = dfs(neighbor, visited, dp)
            max_path = max(max_path, path_len)
        
        dp[node] = max_path + 1
        return dp[node]
    
    visited = set()
    dp = {}
    return dfs(start, visited, dp) - 1

