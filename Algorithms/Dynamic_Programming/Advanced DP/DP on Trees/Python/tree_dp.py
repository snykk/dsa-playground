"""
Dynamic Programming on Trees

DP problems where state is defined on tree nodes.
"""


class TreeNode:
    """Simple tree node"""
    def __init__(self, val=0, children=None):
        self.val = val
        self.children = children if children else []


def tree_dp_max_independent_set(root):
    """
    Maximum Independent Set on Tree
    
    Find maximum sum of nodes such that no two selected nodes are adjacent.
    
    Args:
        root: Root of tree
        
    Returns:
        Maximum sum
        
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    def dfs(node):
        if not node:
            return 0, 0  # (include, exclude)
        
        include = node.val
        exclude = 0
        
        for child in node.children:
            child_include, child_exclude = dfs(child)
            include += child_exclude
            exclude += max(child_include, child_exclude)
        
        return include, exclude
    
    include, exclude = dfs(root)
    return max(include, exclude)


def tree_dp_max_path_sum(root):
    """
    Maximum path sum in tree
    
    Args:
        root: Root of tree
        
    Returns:
        Maximum path sum
        
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    max_sum = float('-inf')
    
    def dfs(node):
        nonlocal max_sum
        if not node:
            return 0
        
        current = node.val
        for child in node.children:
            child_sum = dfs(child)
            if child_sum > 0:
                current += child_sum
        
        max_sum = max(max_sum, current)
        return max(node.val, node.val + max((dfs(child) for child in node.children), default=0))
    
    dfs(root)
    return max_sum

