"""
Monotonic Stack

A technique for solving problems that require finding the next or previous
greater/smaller element in an array using a stack that maintains monotonic order.
"""

from typing import List


def next_greater_element(arr: List[int]) -> List[int]:
    """
    For each element, find the next greater element to its right. -1 if none.

    Args:
        arr: Input array of integers

    Returns:
        List where result[i] is the next greater element for arr[i], or -1

    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    n = len(arr)
    result = [-1] * n
    stack = []  # stores indices

    for i in range(n):
        while stack and arr[stack[-1]] < arr[i]:
            result[stack.pop()] = arr[i]
        stack.append(i)

    return result


def next_smaller_element(arr: List[int]) -> List[int]:
    """
    For each element, find the next smaller element to its right. -1 if none.

    Args:
        arr: Input array of integers

    Returns:
        List where result[i] is the next smaller element for arr[i], or -1

    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    n = len(arr)
    result = [-1] * n
    stack = []  # stores indices

    for i in range(n):
        while stack and arr[stack[-1]] > arr[i]:
            result[stack.pop()] = arr[i]
        stack.append(i)

    return result


def previous_greater_element(arr: List[int]) -> List[int]:
    """
    For each element, find the previous greater element to its left. -1 if none.

    Args:
        arr: Input array of integers

    Returns:
        List where result[i] is the previous greater element for arr[i], or -1

    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    n = len(arr)
    result = [-1] * n
    stack = []  # stores indices

    for i in range(n):
        while stack and arr[stack[-1]] <= arr[i]:
            stack.pop()
        if stack:
            result[i] = arr[stack[-1]]
        stack.append(i)

    return result


def previous_smaller_element(arr: List[int]) -> List[int]:
    """
    For each element, find the previous smaller element to its left. -1 if none.

    Args:
        arr: Input array of integers

    Returns:
        List where result[i] is the previous smaller element for arr[i], or -1

    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    n = len(arr)
    result = [-1] * n
    stack = []  # stores indices

    for i in range(n):
        while stack and arr[stack[-1]] >= arr[i]:
            stack.pop()
        if stack:
            result[i] = arr[stack[-1]]
        stack.append(i)

    return result


def largest_rectangle_histogram(heights: List[int]) -> int:
    """
    Find the largest rectangular area in a histogram.

    Uses a monotonic increasing stack to find, for each bar, the nearest
    shorter bar on both sides.

    Args:
        heights: List of bar heights in the histogram

    Returns:
        Area of the largest rectangle

    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    stack = []  # stores indices
    max_area = 0
    n = len(heights)

    for i in range(n):
        while stack and heights[stack[-1]] >= heights[i]:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)

    # Process remaining elements in stack
    while stack:
        height = heights[stack.pop()]
        width = n if not stack else n - stack[-1] - 1
        max_area = max(max_area, height * width)

    return max_area


def daily_temperatures(temperatures: List[int]) -> List[int]:
    """
    For each day, find how many days until a warmer temperature. 0 if none.

    Args:
        temperatures: List of daily temperatures

    Returns:
        List where result[i] is the number of days to wait for a warmer temp

    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    n = len(temperatures)
    result = [0] * n
    stack = []  # stores indices

    for i in range(n):
        while stack and temperatures[stack[-1]] < temperatures[i]:
            prev = stack.pop()
            result[prev] = i - prev
        stack.append(i)

    return result


def stock_span(prices: List[int]) -> List[int]:
    """
    For each day, find the span (consecutive days with price <= current day,
    including the current day).

    The span of a stock's price on a given day is the maximum number of
    consecutive days (ending on that day) for which the price was less than
    or equal to the price on that day.

    Args:
        prices: List of daily stock prices

    Returns:
        List where result[i] is the span for day i

    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    n = len(prices)
    result = [0] * n
    stack = []  # stores indices

    for i in range(n):
        while stack and prices[stack[-1]] <= prices[i]:
            stack.pop()
        result[i] = i + 1 if not stack else i - stack[-1]
        stack.append(i)

    return result


def main():
    """Example usage."""
    print("Monotonic Stack Examples:")
    print()

    # Next Greater Element
    arr = [4, 5, 2, 10, 8]
    result = next_greater_element(arr)
    print(f"Next Greater Element of {arr}: {result}")
    print()

    # Next Smaller Element
    arr = [4, 5, 2, 10, 8]
    result = next_smaller_element(arr)
    print(f"Next Smaller Element of {arr}: {result}")
    print()

    # Largest Rectangle in Histogram
    heights = [2, 1, 5, 6, 2, 3]
    result = largest_rectangle_histogram(heights)
    print(f"Largest Rectangle in Histogram {heights}: {result}")
    print()

    # Daily Temperatures
    temps = [73, 74, 75, 71, 69, 72, 76, 73]
    result = daily_temperatures(temps)
    print(f"Daily Temperatures {temps}: {result}")
    print()

    # Stock Span
    prices = [100, 80, 60, 70, 60, 75, 85]
    result = stock_span(prices)
    print(f"Stock Span {prices}: {result}")


if __name__ == "__main__":
    main()
