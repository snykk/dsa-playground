# Activity Selection -- C++ Implementation

Greedy activity selection (earliest finish first) in C++17.

## Files

| File | Contents |
|------|----------|
| `activity_selection.cpp` | `Activity` alias and `activitySelection` |
| `activity_selection_test.cpp` | 5 assert-based tests (basic, no overlap, touching, empty and single, input untouched) |

## API

| Name | Description |
|------|-------------|
| `using Activity = std::pair<int, int>` | `(start, finish)` |
| `std::vector<int> activitySelection(std::vector<Activity>& activities)` | original indices of a maximum compatible set, in finish order; empty for empty input |

```cpp
std::vector<Activity> a = {{1, 4}, {3, 5}, {0, 6}, {5, 7}, {8, 9}};
std::vector<int> picked = activitySelection(a);  // {0, 3, 4}
```

Only the greedy function exists in C++. The weighted and recursive variants are Python only.

## C++-Specific Notes

- The parameter is a non-const reference, but the function does not change it: it sorts an indexed copy (O(n) extra space).
- It uses a generic lambda in `std::sort`, which needs C++14 or newer; compile with `-std=c++17`. `-std=c++11` does not compile.
- `std::sort` is not stable, so among activities with equal finish times the chosen index is unspecified. The count of selected activities is not affected.
- Times are `int`; no overflow handling is needed because only comparisons are done.

## How to Run

```bash
cd "Algorithms/Greedy/Activity Selection/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD activity_selection_test.cpp -o activity_test
./activity_test
```

## Key Takeaways

- Sort an indexed copy by finish time, then scan once.
- Use `>=` so that touching activities both fit.
- Needs C++14 or newer.
