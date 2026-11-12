# Monotonic Stack -- Python Implementation

Next and previous greater or smaller element, histogram, temperatures and stock span. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `monotonic_stack.py` | Seven functions and a demo `main` |
| `monotonic_stack_test.py` | Unit tests including duplicates and empty input |

## API

- `next_greater_element(arr)`, `next_smaller_element(arr)`: value of the next strictly greater (smaller) element to the right, `-1` if none.
- `previous_greater_element(arr)`, `previous_smaller_element(arr)`: the same to the left.
- `largest_rectangle_histogram(heights)`: area of the largest rectangle.
- `daily_temperatures(temperatures)`: days until a warmer day, `0` if none.
- `stock_span(prices)`: consecutive days up to today with price `<=` today's, including today.

## Python-Specific Notes

- The stack is a plain `list` of indices.
- `-1` is the "no answer" value, so an input containing -1 is ambiguous.
- Integers do not overflow, so the histogram area is exact.

## How to Run

```bash
python3 -m unittest monotonic_stack_test
python3 monotonic_stack.py
```

## Key Takeaways

- Each index is pushed and popped at most once.
- Store indices, not values.
- Pop on `<` for next greater and `<=` for previous greater to answer with strictly greater values.
