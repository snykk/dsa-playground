"""
Static Array implementation using Python's array module.

Demonstrates a fixed-type array where all elements share the same
type code. Covers basic operations: creation, element access, and
element update.
"""

import array

def main():
    """
    Demonstrate static array operations including creation, access, and update.

    Creates an integer array, accesses an element by index, and updates
    an element in place.
    """
    # Static array of integers
    arr = array.array('i', [1, 2, 3, 4, 5])
    print("Initial array:", arr)

    # Access element
    print("Element at index 2:", arr[2])

    # Update element
    arr[2] = 10
    print("After update:", arr)

if __name__ == "__main__":
    main()
