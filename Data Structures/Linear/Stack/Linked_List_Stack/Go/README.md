# Linked List Stack -- Go Implementation

A LIFO stack of `int` on a singly linked list. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `main.go` | the `Node` and `LinkedListStack` types and a small `main` demo |
| `main_test.go` | tests for basic behaviour, empty-stack errors and LIFO order over 100 items |
| `go.mod` | module definition (`stack_linked_list`), so `go test ./...` and CI run this folder |

## API

| Function | Description | Time |
| --- | --- | --- |
| `NewStack() *LinkedListStack` | create an empty stack | O(1) |
| `Push(value int)` | new node becomes the top | O(1) |
| `Pop() (int, error)` | remove and return the top; error if empty | O(1) |
| `Peek() (int, error)` | return the top; error if empty | O(1) |
| `IsEmpty()`, `Size()` | state queries | O(1) |

## Go-Specific Notes

- Nodes are plain structs referenced by pointer; the garbage collector reclaims popped nodes.
- `Pop` and `Peek` return `(int, error)`: `fmt.Println(s.Peek())` prints the value followed by `<nil>`, so the demo in `main.go` ignores the error explicitly.
- The `Size()` method reads a counter field, so it does not walk the list.

## How to Run

```bash
cd "Data Structures/Linear/Stack/Linked_List_Stack/Go"
go test ./...
go run main.go
```

## Key Takeaways

- A pointer to the head node is the whole stack.
- Check the error from `Pop` and `Peek`.
