"""
Fast I/O Techniques for Competitive Programming (Python)

This file demonstrates various techniques to speed up input/output
operations which can be crucial for time-sensitive problems.
"""

import sys
from typing import List, Iterator

# ==================== Basic Fast I/O ====================

# Replace default input with faster version
input = sys.stdin.readline

def fast_input() -> str:
    """Fast single line input."""
    return sys.stdin.readline().strip()

def fast_int() -> int:
    """Fast single integer input."""
    return int(sys.stdin.readline())

def fast_ints() -> List[int]:
    """Fast list of integers input."""
    return list(map(int, sys.stdin.readline().split()))

def fast_floats() -> List[float]:
    """Fast list of floats input."""
    return list(map(float, sys.stdin.readline().split()))

def fast_strings() -> List[str]:
    """Fast list of strings input."""
    return sys.stdin.readline().split()

def fast_iter_ints() -> Iterator[int]:
    """Fast iterator of integers (memory efficient)."""
    return map(int, sys.stdin.readline().split())

# ==================== Fast Output ====================

def fast_print(*args, sep=' ', end='\n'):
    """Fast print using sys.stdout.write."""
    sys.stdout.write(sep.join(map(str, args)) + end)

def fast_print_list(lst: List, sep=' ', end='\n'):
    """Fast print for lists."""
    sys.stdout.write(sep.join(map(str, lst)) + end)

def fast_print_matrix(matrix: List[List], sep=' ', end='\n'):
    """Fast print for 2D matrices."""
    for row in matrix:
        sys.stdout.write(sep.join(map(str, row)) + end)

# ==================== Buffered I/O ====================

class BufferedInput:
    """Buffered input for very large inputs.

    Reads the whole of stdin up front and splits it into whitespace-separated
    tokens. next() raises IndexError once the tokens run out.
    """
    
    def __init__(self, buffer_size: int = 1 << 20):
        # buffer_size is accepted for API compatibility but not used: the whole
        # stream is read with one stdin.read() call.
        self.buffer = sys.stdin.read().split()
        self.index = 0
    
    def next(self) -> str:
        """Get next token."""
        result = self.buffer[self.index]
        self.index += 1
        return result
    
    def next_int(self) -> int:
        """Get next integer."""
        return int(self.next())
    
    def next_float(self) -> float:
        """Get next float."""
        return float(self.next())
    
    def next_ints(self, n: int) -> List[int]:
        """Get next n integers."""
        return [self.next_int() for _ in range(n)]
    
    def next_line(self) -> str:
        """Return the next token (a token, not a whole line: line breaks are lost)."""
        return self.next()


class BufferedOutput:
    """Buffered output for very large outputs."""
    
    def __init__(self):
        self.buffer = []
    
    def write(self, *args, sep=' ', end='\n'):
        """Write to buffer."""
        self.buffer.append(sep.join(map(str, args)) + end)
    
    def write_list(self, lst: List, sep=' ', end='\n'):
        """Write list to buffer."""
        self.buffer.append(sep.join(map(str, lst)) + end)
    
    def flush(self):
        """Flush buffer to stdout."""
        sys.stdout.write(''.join(self.buffer))
        self.buffer = []


# ==================== Read All Input at Once ====================

def read_all_ints() -> List[int]:
    """Read all integers from stdin at once (fastest for multiple test cases)."""
    return list(map(int, sys.stdin.read().split()))


class AllInputReader:
    """Process all input at once for fastest reading."""
    
    def __init__(self):
        self.data = list(map(int, sys.stdin.read().split()))
        self.idx = 0
    
    def next(self) -> int:
        """Get next integer."""
        result = self.data[self.idx]
        self.idx += 1
        return result
    
    def next_n(self, n: int) -> List[int]:
        """Get next n integers."""
        result = self.data[self.idx:self.idx + n]
        self.idx += n
        return result


# ==================== PyPy Optimization ====================

def pypy_optimizations():
    """
    Tips for PyPy optimization:
    1. Avoid using global variables inside functions
    2. Use local variables when possible
    3. Avoid using list comprehensions inside tight loops
    4. Use array module instead of lists for numeric data
    """
    import array
    
    # array is faster than list for numeric data
    arr = array.array('i', [0] * 1000)
    
    # Local variable access is faster
    local_len = len  # Cache builtin functions
    
    return arr


# ==================== Demo Functions ====================

def demo_basic_fast_io():
    """Demo: Basic fast I/O (recommended for most cases)."""
    n = fast_int()
    a = fast_ints()
    
    total = sum(a)
    fast_print(total)


def demo_buffered_io():
    """Demo: Buffered I/O for very large inputs."""
    reader = BufferedInput()
    writer = BufferedOutput()
    
    n = reader.next_int()
    a = reader.next_ints(n)
    
    total = sum(a)
    writer.write(total)
    writer.flush()


def demo_all_at_once():
    """Demo: Read all input at once (fastest for multiple test cases)."""
    reader = AllInputReader()
    output = []
    
    t = reader.next()
    for _ in range(t):
        n = reader.next()
        a = reader.next_n(n)
        output.append(sum(a))
    
    sys.stdout.write('\n'.join(map(str, output)) + '\n')


# ==================== Performance Comparison ====================

def performance_tips():
    """
    Performance tips for Python I/O:
    
    1. ALWAYS use sys.stdin.readline instead of input()
       - 5-10x faster for large inputs
    
    2. Use sys.stdout.write instead of print()
       - Faster for large outputs
       - Remember to add newlines manually
    
    3. Read all input at once when possible
       - sys.stdin.read().split() is fastest
       - Good for multiple test cases
    
    4. Use list comprehensions over loops
       - [int(x) for x in ...] is faster than loop
    
    5. Use map() for conversions
       - map(int, ...) is faster than list comprehension
    
    6. Batch output with join()
       - '\\n'.join(results) + '\\n' is faster than multiple prints
    
    7. Consider PyPy for time-sensitive problems
       - Often 5-50x faster than CPython
    """
    pass


# ==================== Template ====================

def solve():
    """Main solution function."""
    n = fast_int()
    a = fast_ints()
    
    # Your solution here
    ans = sum(a)
    
    fast_print(ans)


def main():
    """Main function with optional multiple test cases."""
    # For single test case
    solve()
    
    # For multiple test cases (uncomment below)
    # t = fast_int()
    # for _ in range(t):
    #     solve()


if __name__ == "__main__":
    main()

