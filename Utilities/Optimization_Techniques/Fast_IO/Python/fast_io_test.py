"""
Test suite for Fast I/O utilities
"""

import unittest
import io
import sys
from fast_io import (
    BufferedOutput, AllInputReader
)


class TestFastIO(unittest.TestCase):
    """Test cases for fast I/O utilities."""
    
    def test_buffered_output(self):
        """Test BufferedOutput class."""
        output = BufferedOutput()
        output.write("Hello")
        output.write(123)
        output.write_list([1, 2, 3])
        
        # Capture output
        old_stdout = sys.stdout
        sys.stdout = io.StringIO()
        output.flush()
        result = sys.stdout.getvalue()
        sys.stdout = old_stdout
        
        self.assertIn("Hello", result)
        self.assertIn("123", result)
        self.assertIn("1 2 3", result)
    
    def test_parse_int(self):
        """Test integer parsing."""
        self.assertEqual(int("123"), 123)
        self.assertEqual(int("-456"), -456)
        self.assertEqual(int("0"), 0)
        self.assertEqual(int("1000000000"), 1000000000)
    
    def test_int_to_string(self):
        """Test integer to string conversion."""
        self.assertEqual(str(123), "123")
        self.assertEqual(str(-456), "-456")
        self.assertEqual(str(0), "0")
        self.assertEqual(str(1000000000), "1000000000")
    
    def test_map_int_conversion(self):
        """Test map-based integer conversion."""
        data = "1 2 3 4 5"
        result = list(map(int, data.split()))
        self.assertEqual(result, [1, 2, 3, 4, 5])
    
    def test_join_output(self):
        """Test join-based output."""
        data = [1, 2, 3, 4, 5]
        result = " ".join(map(str, data))
        self.assertEqual(result, "1 2 3 4 5")
    
    def test_large_numbers(self):
        """Test handling of large numbers."""
        large = 10**18
        self.assertEqual(int(str(large)), large)
        
        # Test conversion
        s = str(large)
        self.assertEqual(len(s), 19)
    
    def test_multiple_values_per_line(self):
        """Test reading multiple values from single line."""
        line = "10 20 30 40 50"
        values = list(map(int, line.split()))
        
        self.assertEqual(len(values), 5)
        self.assertEqual(values[0], 10)
        self.assertEqual(values[-1], 50)
        self.assertEqual(sum(values), 150)
    
    def test_matrix_parsing(self):
        """Test 2D matrix parsing."""
        lines = [
            "1 2 3",
            "4 5 6",
            "7 8 9"
        ]
        matrix = [list(map(int, line.split())) for line in lines]
        
        self.assertEqual(len(matrix), 3)
        self.assertEqual(len(matrix[0]), 3)
        self.assertEqual(matrix[1][1], 5)
        
        # Sum of all elements
        total = sum(sum(row) for row in matrix)
        self.assertEqual(total, 45)
    
    def test_performance_string_join(self):
        """Test that join is efficient."""
        numbers = list(range(1000))
        result = '\n'.join(map(str, numbers))
        
        self.assertIn("0", result)
        self.assertIn("999", result)
        self.assertEqual(result.count('\n'), 999)


class TestIOEdgeCases(unittest.TestCase):
    """Test edge cases for I/O."""
    
    def test_empty_input(self):
        """Test handling of empty input."""
        data = ""
        result = data.split()
        self.assertEqual(result, [])
    
    def test_single_value(self):
        """Test single value input."""
        data = "42"
        result = int(data.strip())
        self.assertEqual(result, 42)
    
    def test_negative_numbers(self):
        """Test negative number handling."""
        data = "-1 -2 -3"
        result = list(map(int, data.split()))
        self.assertEqual(result, [-1, -2, -3])
        self.assertEqual(sum(result), -6)
    
    def test_mixed_sign_numbers(self):
        """Test mixed positive and negative numbers."""
        data = "-5 10 -15 20"
        result = list(map(int, data.split()))
        self.assertEqual(sum(result), 10)
    
    def test_zero_values(self):
        """Test zero handling."""
        data = "0 0 0 0"
        result = list(map(int, data.split()))
        self.assertEqual(result, [0, 0, 0, 0])
        self.assertEqual(sum(result), 0)


if __name__ == '__main__':
    unittest.main()

