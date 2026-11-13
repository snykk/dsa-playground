# Two Pointers -- Go Implementation

Opposite-end and read/write pointer scans. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `main.go` | Five functions and a demo `main` |
| `main_test.go` | One test per function |
| `go.mod` | Module definition |

## API

- `twoSumSorted(arr []int, target int) []int`: `[left, right]` or `nil`.
- `threeSum(arr []int, target int) [][]int`: works on a sorted copy.
- `isPalindrome(s string) bool`: ignores non-letter, non-digit bytes and case.
- `removeDuplicates(arr []int) int`: compacts in place, returns the new length.
- `containerWithMostWater(heights []int) int`

## Go-Specific Notes

- `threeSum` copies the input before sorting, so the caller's slice is untouched (unlike Python and C++).
- `isPalindrome` indexes the string by byte, so non-ASCII text is not handled correctly.
- The functions are unexported; call them from within the package.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Each pointer moves at most n steps, so the scans are O(n).
- Opposite-end pair search needs sorted input.
- Skip duplicates in `three_sum` to avoid repeated triplets.
