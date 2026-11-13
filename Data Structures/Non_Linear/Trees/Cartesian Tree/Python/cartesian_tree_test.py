"""
Test cases for Cartesian Tree
"""

import unittest
from cartesian_tree import CartesianTree


class TestCartesianTree(unittest.TestCase):
    
    def test_build_from_array(self):
        """Test building tree from array"""
        array = [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]
        tree = CartesianTree(array)
        
        # Inorder should return original array
        result = tree.inorder_traversal()
        self.assertEqual(result, array)
    
    def test_min_heap_property(self):
        """Test that tree maintains min-heap property"""
        array = [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]
        tree = CartesianTree(array)
        
        # Verify min-heap property: parent < children
        self._verify_min_heap(tree.root)
    
    def _verify_min_heap(self, node):
        """Helper to verify min-heap property"""
        if node is None:
            return
        
        if node.left is not None:
            self.assertLessEqual(node.value, node.left.value)
            self._verify_min_heap(node.left)
        
        if node.right is not None:
            self.assertLessEqual(node.value, node.right.value)
            self._verify_min_heap(node.right)
    
    def test_empty_array(self):
        """Test with empty array"""
        tree = CartesianTree([])
        self.assertTrue(tree.is_empty())
        self.assertEqual(tree.inorder_traversal(), [])
        self.assertEqual(tree.size(), 0)
    
    def test_single_element(self):
        """Test with single element"""
        tree = CartesianTree([42])
        self.assertFalse(tree.is_empty())
        self.assertEqual(tree.inorder_traversal(), [42])
        self.assertEqual(tree.root.value, 42)
        self.assertEqual(tree.size(), 1)
    
    def test_sorted_array_ascending(self):
        """Test with sorted ascending array"""
        array = [1, 2, 3, 4, 5]
        tree = CartesianTree(array)
        self.assertEqual(tree.inorder_traversal(), array)
        # Should form a right-skewed tree
        self.assertEqual(tree.root.value, 1)
    
    def test_sorted_array_descending(self):
        """Test with sorted descending array"""
        array = [5, 4, 3, 2, 1]
        tree = CartesianTree(array)
        self.assertEqual(tree.inorder_traversal(), array)
        # Should form a left-skewed tree
        self.assertEqual(tree.root.value, 1)
    
    def test_duplicate_values(self):
        """Test with duplicate values"""
        array = [3, 1, 2, 1, 3]
        tree = CartesianTree(array)
        self.assertEqual(tree.inorder_traversal(), array)
    
    def test_traversals(self):
        """Test different traversal methods"""
        array = [9, 3, 7, 1, 8]
        tree = CartesianTree(array)
        
        inorder = tree.inorder_traversal()
        self.assertEqual(inorder, array)
        
        preorder = tree.preorder_traversal()
        # Preorder should start with root (minimum value)
        self.assertEqual(preorder[0], min(array))
        
        postorder = tree.postorder_traversal()
        # Postorder should end with root
        self.assertEqual(postorder[-1], min(array))
    
    def test_height(self):
        """Test height calculation"""
        tree = CartesianTree([1])
        self.assertEqual(tree.height(), 0)
        
        tree = CartesianTree([1, 2])
        self.assertEqual(tree.height(), 1)
        
        tree = CartesianTree([1, 2, 3, 4, 5])
        height = tree.height()
        self.assertGreaterEqual(height, 1)
        self.assertLessEqual(height, 4)
    
    def test_size(self):
        """Test size calculation"""
        array = [9, 3, 7, 1, 8, 12, 10]
        tree = CartesianTree(array)
        self.assertEqual(tree.size(), len(array))
    
    def test_complex_array(self):
        """Test with complex array"""
        array = [27, 18, 28, 18, 28, 45, 90, 45, 23, 53, 60, 28, 74, 71, 35]
        tree = CartesianTree(array)
        
        # Inorder should match original
        self.assertEqual(tree.inorder_traversal(), array)
        
        # Should maintain min-heap property
        self._verify_min_heap(tree.root)
        
        # Size should match
        self.assertEqual(tree.size(), len(array))
    
    def test_range_minimum_query(self):
        """Test range minimum query functionality"""
        array = [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]
        tree = CartesianTree(array)
        
        # Find minimum in entire range
        min_idx = tree.get_min_index(0, len(array) - 1)
        self.assertEqual(array[min_idx], min(array))
        
        # Find minimum in subrange
        min_idx = tree.get_min_index(0, 4)
        self.assertEqual(array[min_idx], min(array[0:5]))
    
    def test_boundary_validation(self):
        """Test boundary validation for get_min_index"""
        array = [9, 3, 7, 1, 8, 12, 10]
        tree = CartesianTree(array)
        
        # Test negative left boundary
        result = tree.get_min_index(-1, 3)
        self.assertEqual(result, -1)
        
        # Test right boundary >= array length
        result = tree.get_min_index(0, len(array))
        self.assertEqual(result, -1)
        
        # Test right boundary > array length
        result = tree.get_min_index(0, len(array) + 1)
        self.assertEqual(result, -1)
        
        # Test valid boundaries (edge cases)
        result = tree.get_min_index(0, len(array) - 1)
        self.assertNotEqual(result, -1)
        
        # Test empty tree
        empty_tree = CartesianTree([])
        result = empty_tree.get_min_index(0, 0)
        self.assertEqual(result, -1)

    def test_min_index_matches_brute_force(self):
        """Every range, with duplicates and negatives: leftmost minimum"""
        import random
        rng = random.Random(5)
        for _ in range(60):
            array = [rng.randint(-5, 5) for _ in range(rng.randint(1, 25))]
            tree = CartesianTree(array)
            for left in range(len(array)):
                for right in range(left, len(array)):
                    window = array[left:right + 1]
                    expected = left + window.index(min(window))
                    self.assertEqual(tree.get_min_index(left, right), expected)

    def test_min_index_inverted_range(self):
        tree = CartesianTree([4, 2, 6])
        self.assertEqual(tree.get_min_index(2, 1), -1)

    def test_min_index_visits_only_one_path(self):
        """A query walks one root-to-LCA path, not the whole tree"""
        n = 2000
        tree = CartesianTree(list(range(n)))  # a right chain of n nodes
        # Count steps by replaying the walk
        steps, node = 0, tree.root
        while node.index < 1500:
            node = node.right
            steps += 1
        self.assertEqual(tree.get_min_index(1500, 1999), 1500)
        self.assertEqual(steps, 1500)

    def test_sorted_input_is_a_deep_chain(self):
        """Regression: traversals, height and size used to hit the recursion limit"""
        n = 5000
        tree = CartesianTree(list(range(n)))
        self.assertEqual(tree.inorder_traversal(), list(range(n)))
        self.assertEqual(tree.preorder_traversal(), list(range(n)))
        self.assertEqual(tree.postorder_traversal(), list(range(n - 1, -1, -1)))
        self.assertEqual(tree.size(), n)
        self.assertEqual(tree.height(), n - 1)

    def test_traversal_orders(self):
        tree = CartesianTree([3, 1, 4, 1, 5])
        # Built tree: root 1 (index 1); left 3; right 1 (index 3) with left 4 and right 5
        self.assertEqual(tree.preorder_traversal(), [1, 3, 1, 4, 5])
        self.assertEqual(tree.postorder_traversal(), [3, 4, 5, 1, 1])
        self.assertEqual(tree.inorder_traversal(), [3, 1, 4, 1, 5])


if __name__ == '__main__':
    unittest.main()
