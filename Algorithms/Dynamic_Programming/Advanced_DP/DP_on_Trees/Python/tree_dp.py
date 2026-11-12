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
    Maximum path sum in tree (a path has at least one node, may start and
    end anywhere and uses each node at most once)
    
    Args:
        root: Root of tree
        
    Returns:
        Maximum path sum; float('-inf') for an empty tree
        
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    max_sum = float('-inf')
    
    def dfs(node):
        """Best sum of a downward chain that starts at node."""
        nonlocal max_sum
        if not node:
            return 0
        
        # A path through node can use at most two child chains: keep the
        # two largest positive ones (negative chains are never worth taking).
        best1 = best2 = 0
        for child in node.children:
            gain = dfs(child)
            if gain > best1:
                best1, best2 = gain, best1
            elif gain > best2:
                best2 = gain
        
        max_sum = max(max_sum, node.val + best1 + best2)
        return node.val + best1
    
    dfs(root)
    return max_sum
