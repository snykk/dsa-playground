"""
Bit Manipulation Patterns

Common bit manipulation tricks and techniques for efficient
computation on binary representations of integers.
"""

from typing import List, Tuple


def is_power_of_two(n: int) -> bool:
    """Check if n is a power of 2.

    A power of 2 has exactly one bit set. n & (n - 1) clears
    the lowest set bit; if the result is 0, only one bit was set.

    Args:
        n: Input integer

    Returns:
        True if n is a power of 2, False otherwise

    Time Complexity: O(1)
    """
    return n > 0 and (n & (n - 1)) == 0


def count_set_bits(n: int) -> int:
    """Count the number of 1-bits using Brian Kernighan's algorithm.

    Repeatedly clears the lowest set bit until n becomes 0.

    A negative n is counted as a 64-bit two's complement value (so -1 has 64
    set bits), the same as the C++ and Go versions. Python ints have infinitely
    many sign bits, so without this mask the loop would never end.

    Args:
        n: Integer

    Returns:
        Number of set bits (1-bits)

    Time Complexity: O(k) where k is the number of set bits
    """
    if n < 0:
        n &= (1 << 64) - 1
    count = 0
    while n:
        n &= (n - 1)
        count += 1
    return count


def get_bit(n: int, i: int) -> int:
    """Get the i-th bit of n (0-indexed from least significant bit).

    Args:
        n: Input integer
        i: Bit position (0-indexed)

    Returns:
        0 or 1

    Time Complexity: O(1)
    """
    return (n >> i) & 1


def set_bit(n: int, i: int) -> int:
    """Set the i-th bit to 1.

    Args:
        n: Input integer
        i: Bit position (0-indexed)

    Returns:
        Integer with the i-th bit set

    Time Complexity: O(1)
    """
    return n | (1 << i)


def clear_bit(n: int, i: int) -> int:
    """Clear the i-th bit to 0.

    Args:
        n: Input integer
        i: Bit position (0-indexed)

    Returns:
        Integer with the i-th bit cleared

    Time Complexity: O(1)
    """
    return n & ~(1 << i)


def toggle_bit(n: int, i: int) -> int:
    """Toggle the i-th bit.

    Args:
        n: Input integer
        i: Bit position (0-indexed)

    Returns:
        Integer with the i-th bit toggled

    Time Complexity: O(1)
    """
    return n ^ (1 << i)


def lowest_set_bit(n: int) -> int:
    """Isolate the lowest set bit.

    Uses the two's complement trick: n & (-n).

    Args:
        n: Input integer

    Returns:
        Integer with only the lowest set bit of n, or 0 if n is 0

    Time Complexity: O(1)
    """
    if n == 0:
        return 0
    return n & (-n)


def highest_set_bit(n: int) -> int:
    """Find the position of the highest set bit (0-indexed).

    Args:
        n: Positive integer

    Returns:
        Position of the highest set bit, or -1 if n is 0

    Time Complexity: O(log n)
    """
    if n <= 0:
        return -1
    position = 0
    while n > 1:
        n >>= 1
        position += 1
    return position


def count_differing_bits(a: int, b: int) -> int:
    """Count the number of bits that differ between a and b (Hamming distance).

    Args:
        a: First integer
        b: Second integer

    Returns:
        Number of differing bit positions

    Time Complexity: O(k) where k is the number of differing bits
    """
    return count_set_bits(a ^ b)


def swap_without_temp(a: int, b: int) -> Tuple[int, int]:
    """Swap two values using XOR without a temporary variable.

    Args:
        a: First integer
        b: Second integer

    Returns:
        Tuple (b, a) - the swapped values

    Time Complexity: O(1)
    """
    if a == b:
        return a, b
    a ^= b
    b ^= a
    a ^= b
    return a, b


def is_even(n: int) -> bool:
    """Check if n is even using bit operation.

    The least significant bit is 0 for even numbers.

    Args:
        n: Input integer

    Returns:
        True if n is even, False otherwise

    Time Complexity: O(1)
    """
    return (n & 1) == 0


def next_power_of_two(n: int) -> int:
    """Find the next power of 2 greater than or equal to n.

    Args:
        n: Input positive integer

    Returns:
        Smallest power of 2 >= n

    Time Complexity: O(log n)
    """
    if n <= 1:
        return 1
    if is_power_of_two(n):
        return n
    power = 1
    while power < n:
        power <<= 1
    return power


def subset_generation(n: int) -> List[List[int]]:
    """Generate all subsets of an n-element set using bitmask enumeration.

    Elements are represented as indices 0 to n-1.

    Args:
        n: Number of elements in the set

    Returns:
        List of all subsets, each subset is a list of element indices

    Time Complexity: O(n * 2^n)
    """
    subsets = []
    for mask in range(1 << n):
        subset = []
        for i in range(n):
            if mask & (1 << i):
                subset.append(i)
        subsets.append(subset)
    return subsets


def main():
    """Example usage."""
    print("Bit Manipulation Examples:")
    print()

    print(f"is_power_of_two(16): {is_power_of_two(16)}")
    print(f"is_power_of_two(15): {is_power_of_two(15)}")
    print(f"count_set_bits(13): {count_set_bits(13)}")  # 1101 -> 3
    print(f"get_bit(13, 2): {get_bit(13, 2)}")  # 1
    print(f"set_bit(8, 1): {set_bit(8, 1)}")  # 10
    print(f"clear_bit(15, 2): {clear_bit(15, 2)}")  # 11
    print(f"toggle_bit(13, 1): {toggle_bit(13, 1)}")  # 15
    print(f"lowest_set_bit(12): {lowest_set_bit(12)}")  # 4
    print(f"highest_set_bit(13): {highest_set_bit(13)}")  # 3
    print(f"count_differing_bits(7, 10): {count_differing_bits(7, 10)}")
    print(f"swap_without_temp(3, 7): {swap_without_temp(3, 7)}")
    print(f"is_even(4): {is_even(4)}")
    print(f"next_power_of_two(13): {next_power_of_two(13)}")
    print(f"subset_generation(3): {subset_generation(3)}")


if __name__ == "__main__":
    main()
