# Singly Linked List -- Go Implementation

## Files

| File | Contents |
| --- | --- |
| `main.go` | `Node`, `SinglyLinkedList` and a small demo `main()` |
| `main_test.go` | tests in `package main` |
| `go.mod` | module definition |

## API

- `SinglyLinkedList{}`: the zero value is an empty list.
- `InsertAtHead(data int)`: O(1).
- `InsertAtTail(data int)`: O(n).
- `Delete(key int)`: removes the first match; no effect if absent. O(n).
- `Display() []int`: the values from head to tail; `nil` for an empty list.

Fields `data`, `next` and `head` are unexported; tests in the same package could read them directly.

## Go-Specific Notes

- Garbage collection reclaims removed nodes.
- Pointer receivers make the zero value usable.
- `Display` returns `nil` (not an empty slice) for an empty list; compare with `reflect.DeepEqual(got, []int(nil))` or check `len`.
- The tests are sequential and compare with `reflect.DeepEqual`; the delete cases run in one step list.
- The standard library has `container/list`, a doubly linked list.

## How to Run

```bash
cd "Data Structures/Linear/Linked List/Singly/Go"
go test ./...
go run .
```

## Key Takeaways

- Zero-value-friendly types keep the API small.
- Track `prev` while searching, and handle the head separately.
- Insert at tail is O(n) without a tail pointer.
