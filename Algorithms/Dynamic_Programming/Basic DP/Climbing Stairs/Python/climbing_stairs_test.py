"""
Test cases for Climbing Stairs
"""

import unittest
from climbing_stairs import (
    climbing_stairs_naive,
    climbing_stairs_memoization,
    climbing_stairs_tabulation,
    climbing_stairs_optimized,
    climbing_stairs_variable_steps
)


class TestClimbingStairs(unittest.TestCase):
    
    def test_base_cases(self):
        """Test base cases"""
        self.assertEqual(climbing_stairs_tabulation(1), 1)
        self.assertEqual(climbing_stairs_tabulation(2), 2)
    
    def test_small_values(self):
        """Test small values"""
        self.assertEqual(climbing_stairs_tabulation(3), 3)
        self.assertEqual(climbing_stairs_tabulation(4), 5)
        self.assertEqual(climbing_stairs_tabulation(5), 8)
    
    def test_all_approaches_same(self):
        """Test all approaches give same result"""
        n = 10
        naive = climbing_stairs_naive(n)
        memo = climbing_stairs_memoization(n)
        tab = climbing_stairs_tabulation(n)
        opt = climbing_stairs_optimized(n)
        
        self.assertEqual(naive, memo)
        self.assertEqual(memo, tab)
        self.assertEqual(tab, opt)
    
    def test_variable_steps(self):
        """Test variable step sizes"""
        result = climbing_stairs_variable_steps(5, [1, 2, 3])
        self.assertEqual(result, 13)
    
    def test_variable_steps_base(self):
        """Test variable steps base case"""
        result = climbing_stairs_variable_steps(0, [1, 2])
        self.assertEqual(result, 1)

    def test_zero_steps_is_one_way(self):
        """Regression: ways(0) used to be 0 in four functions but 1 in variable_steps"""
        self.assertEqual(climbing_stairs_naive(0), 1)
        self.assertEqual(climbing_stairs_memoization(0), 1)
        self.assertEqual(climbing_stairs_tabulation(0), 1)
        self.assertEqual(climbing_stairs_optimized(0), 1)
        self.assertEqual(climbing_stairs_variable_steps(0, [1, 2]), 1)

    def test_negative_n_raises(self):
        """Regression: negative n used to be returned unchanged (ways(-3) gave -3)"""
        for fn in (climbing_stairs_naive, climbing_stairs_memoization,
                   climbing_stairs_tabulation, climbing_stairs_optimized):
            with self.subTest(fn=fn.__name__):
                with self.assertRaises(ValueError):
                    fn(-3)
        with self.assertRaises(ValueError):
            climbing_stairs_variable_steps(-1, [1, 2])

    def test_steps_one_two_match_fibonacci(self):
        """With steps {1, 2} every approach gives ways(n) = F(n + 1) for n = 0..20"""
        fib = [0, 1]
        while len(fib) < 23:
            fib.append(fib[-1] + fib[-2])
        for n in range(21):
            with self.subTest(n=n):
                self.assertEqual(climbing_stairs_naive(n), fib[n + 1])
                self.assertEqual(climbing_stairs_memoization(n), fib[n + 1])
                self.assertEqual(climbing_stairs_tabulation(n), fib[n + 1])
                self.assertEqual(climbing_stairs_optimized(n), fib[n + 1])
                self.assertEqual(climbing_stairs_variable_steps(n, [1, 2]), fib[n + 1])


if __name__ == '__main__':
    unittest.main()

