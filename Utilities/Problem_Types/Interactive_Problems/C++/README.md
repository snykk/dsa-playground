# Interactive Problems (C++)

C++ implementation for interactive competitive programming problems.

## Key Points

- Always flush output after queries
- Use `cout.flush()` or `endl` after each query
- Handle responses carefully

## Functions

- `queryWithEndl(x)` - Query with endl (auto-flush)
- `queryWithFlush(x)` - Query with explicit flush
- `answer(x)` - Submit final answer
- `guessNumber(n)` - Binary search to guess number
- `findMinimumInteractive(n)` - Find minimum in rotated array

## Usage

```cpp
cout << "? " << x << "\n";
cout.flush();
cin >> response;
cout << "! " << result << "\n";
cout.flush();
```

