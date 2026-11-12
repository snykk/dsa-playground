# Circular Linked List -- Go Implementation

## Files

| File | Contents |
| --- | --- |
| `main.go` | `Node`, `CircularLinkedList` and a small demo `main()` |
| `main_test.go` | tests in `package main` |
| `go.mod` | module definition |

## API

- `CircularLinkedList{}`: the zero value is an empty list (`head == nil`).
- `InsertAtHead(val int)`, `InsertAtTail(val int)`: O(n) each.
- `DeleteValue(key int)`: removes the first match; the only node leaves `head == nil`.
- `Traverse(limit int)`: prints values from the head, stopping when back at the head or after `limit` values. The limit is a required argument.

Fields `data`, `next` and `head` are unexported; the tests are in the same package and walk them directly.

## Go-Specific Notes

- Garbage collection frees unreachable rings, so no destructor is needed.
- The zero value is usable: methods have pointer receivers and `head` starts `nil`.
- `Traverse` prints with `fmt.Print`; to assert on the output the tests walk `head` and `next` with a helper instead.
- The tests are plain sequential tests, not table-driven.

## How to Run

```bash
cd "Data Structures/Linear/Linked List/Circular/Go"
go test ./...
go run .
```

## Key Takeaways

- Handle the one-node list first in delete.
- Compare node pointers, not values, to detect a full lap.
- A tail pointer would make both inserts O(1).
