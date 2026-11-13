# Doubly Linked List -- Go Implementation

## Files

| File | Contents |
| --- | --- |
| `main.go` | `Node`, `DoublyLinkedList` and a small demo `main()` |
| `main_test.go` | tests in `package main` |
| `go.mod` | module definition |

## API

- `DoublyLinkedList{}`: the zero value is an empty list.
- `InsertAtHead(data int)`: O(1).
- `InsertAtTail(data int)`: O(n).
- `DeleteValue(data int)`: removes the first match; returns nothing. O(n).
- `TraverseForward()`, `TraverseBackward()`: print values (`10 <-> 20 <-> nil`).

Fields `data`, `prev`, `next` and `head` are unexported; tests in the same package read them directly.

## Go-Specific Notes

- Garbage collection reclaims removed nodes, so there is no destructor. `DeleteValue` only needs to rewire the neighbours.
- Pointer receivers make the zero value usable.
- The stdlib `container/list` is a ready-made doubly linked list, exposing `*list.Element` handles for O(1) removal.
- The tests are sequential tests and walk the list in both directions through a small helper.

## How to Run

```bash
cd "Data_Structures/Linear/Linked_List/Doubly/Go"
go test ./...
go run .
```

## Key Takeaways

- Update `prev` and `next` together.
- No tail pointer: insert at tail is O(n).
- `container/list` is the production alternative.
