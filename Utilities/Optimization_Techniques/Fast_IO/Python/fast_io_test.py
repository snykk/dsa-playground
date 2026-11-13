"""
Test suite for Fast I/O utilities
"""

import unittest
import io
import sys
from fast_io import (
    BufferedInput, BufferedOutput, AllInputReader, fast_input, fast_int,
    fast_ints, fast_floats, fast_strings, fast_iter_ints, fast_print,
    fast_print_list, fast_print_matrix, read_all_ints,
)


class FakeStdin:
    """Context manager that replaces sys.stdin (and optionally captures stdout)."""

    def __init__(self, text):
        self.text = text

    def __enter__(self):
        self.old_in, self.old_out = sys.stdin, sys.stdout
        sys.stdin = io.StringIO(self.text)
        sys.stdout = io.StringIO()
        return self

    def __exit__(self, *exc):
        self.output = sys.stdout.getvalue()
        sys.stdin, sys.stdout = self.old_in, self.old_out
        return False


class TestRealFunctions(unittest.TestCase):
    """Tests that run the module's own readers and writers on fake stdin."""

    def test_line_readers(self):
        with FakeStdin("hello world\n42\n1 2 3\n1.5 2.5\na b c\n4 5\n"):
            self.assertEqual(fast_input(), "hello world")
            self.assertEqual(fast_int(), 42)
            self.assertEqual(fast_ints(), [1, 2, 3])
            self.assertEqual(fast_floats(), [1.5, 2.5])
            self.assertEqual(fast_strings(), ["a", "b", "c"])
            self.assertEqual(list(fast_iter_ints()), [4, 5])

    def test_fast_int_at_end_of_input(self):
        """An exhausted stream gives an empty line, which is not an integer"""
        with FakeStdin(""):
            self.assertEqual(fast_input(), "")
            with self.assertRaises(ValueError):
                fast_int()
            self.assertEqual(fast_ints(), [])

    def test_negative_and_large(self):
        with FakeStdin("-5 123456789012345678901234567890\n"):
            self.assertEqual(fast_ints(), [-5, 123456789012345678901234567890])

    def test_writers(self):
        with FakeStdin("") as ctx:
            fast_print(1, "a", 2.5)
            fast_print(7, 8, sep=",", end="!")
            fast_print_list([1, 2, 3], sep="-")
            fast_print_matrix([[1, 2], [3, 4]])
        self.assertEqual(ctx.output, "1 a 2.5\n7,8!1-2-3\n1 2\n3 4\n")

    def test_buffered_input_tokens(self):
        with FakeStdin("3\n10 20\n30 1.5\nword\n"):
            reader = BufferedInput()
            self.assertEqual(reader.next_int(), 3)
            self.assertEqual(reader.next_ints(3), [10, 20, 30])
            self.assertEqual(reader.next_float(), 1.5)
            self.assertEqual(reader.next_line(), "word")
            with self.assertRaises(IndexError):
                reader.next()

    def test_buffered_output_flush_clears(self):
        out = BufferedOutput()
        out.write("a", "b")
        out.write_list([1, 2], sep=",")
        with FakeStdin("") as ctx:
            out.flush()
            out.flush()  # second flush writes nothing
        self.assertEqual(ctx.output, "a b\n1,2\n")

    def test_read_all(self):
        with FakeStdin("1 2\n3\n4 5 6\n"):
            self.assertEqual(read_all_ints(), [1, 2, 3, 4, 5, 6])

    def test_all_input_reader(self):
        with FakeStdin("2\n3 1 2 3\n2 10 20\n"):
            reader = AllInputReader()
            self.assertEqual(reader.next(), 2)
            n = reader.next()
            self.assertEqual(reader.next_n(n), [1, 2, 3])
            n = reader.next()
            self.assertEqual(reader.next_n(n), [10, 20])


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

