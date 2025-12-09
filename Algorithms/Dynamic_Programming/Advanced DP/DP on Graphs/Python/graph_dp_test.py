"""
Test cases for Graph DP
"""

import unittest
from graph_dp import dag_longest_path


class TestGraphDP(unittest.TestCase):
    
    def test_dag_longest_path(self):
        """Test longest path in DAG"""
        graph = {
            0: [1, 2],
            1: [3],
            2: [3],
            3: []
        }
        result = dag_longest_path(graph, 0)
        self.assertGreater(result, 0)


if __name__ == '__main__':
    unittest.main()

