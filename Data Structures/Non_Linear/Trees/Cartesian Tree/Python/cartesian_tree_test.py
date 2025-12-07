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


if __name__ == '__main__':
    unittest.main()

