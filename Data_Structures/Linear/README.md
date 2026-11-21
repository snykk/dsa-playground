# Linear Data Structures

Linear structures keep items in a sequence. The array stores them side by side, the linked list chains them with links, and the stack, queue and string are built on those two ideas, each with its own rule for adding, removing or reading items.

## Topics

Read them in this order.

| # | Section | What it adds | Level |
|---|---------|--------------|-------|
| 1 | [Array](Array/) | The base layout. Items sit in one block of memory, so index access is O(1) and a middle insert is O(n). | Beginner |
| 2 | [Linked List](Linked_List/) | Items in nodes joined by links. Singly, doubly, circular and skip list kinds, with O(1) head insert (O(n) in the circular list here) and O(n) access. | 4 topics |
| 3 | [Stack Data Structure](Stack/) | Last in, first out. Static array, dynamic array and linked-list versions, all with O(1) push and pop. | 3 topics |
| 4 | [Queue](Queue/) | First in, first out, plus the deque and the priority queue. Differs in who leaves next and what the front costs. | 4 topics |
| 5 | [String Data Structures](String/) | Characters in sequence, with traps for bytes and immutability. Basics, everyday manipulation and the rope. | 3 topics |

Python, C++ and Go versions of every topic live in each topic folder.

## How They Compare

| Area | Stored as | Interface | Access | Insert or remove |
|------|-----------|-----------|--------|------------------|
| Array | one contiguous block | read or write any index | O(1) | O(n) in the middle; O(1) amortized at the end of a dynamic array |
| Linked list | nodes joined by links | walk from the head | O(n) | O(1) at the head (O(n) for the circular list); O(n) at the tail here, since only a head pointer is kept |
| Stack | array or linked list | push, pop and peek at the top | top only, O(1) | O(1) |
| Queue | array, ring or heap | enqueue at the back, dequeue at the front | front only, O(1) | O(1) with a ring, O(n) with a plain array in Python and C++, O(log n) with a heap |
| String | contiguous characters, or a tree for the rope | read, concatenate, slice, edit | O(1) flat, O(log n) rope | O(n) flat, O(log n) rope |

Memory differs as well. The array has no per-item overhead and is cache-friendly. A linked list adds at least one pointer and one allocation to every item. A ring queue and a static stack fix their size when they are created.

## Where to Start

1. **Array.** Start here. Index access, resizing and the cost of shifting explain most of what follows.
2. **Linked list.** The opposite trade: cheap inserts, slow access. Read the singly list first.
3. **Stack.** One end, last in first out. It shows how the same behavior can sit on an array or on nodes.
4. **Queue.** Two ends and a rule. The simple queue exposes the shifting cost; the circular queue, deque and priority queue each answer it.
5. **String.** An array of characters with traps of its own, and the rope for long text.

To pick a structure for a task:

| Situation | Use | Why |
|-----------|-----|-----|
| Read by index, or scan the whole sequence | Array | O(1) access and the best use of the cache |
| Many inserts and removes at the front | Linked list | O(1) at the head and no shifting |
| Undo, backtracking, depth-first search | Stack | the last item pushed is the first one you need |
| Breadth-first search, buffers, scheduling | Queue | items are served in the order they arrived |
| Items served by urgency | Priority queue | the lowest priority value leaves first |
| Text, and edits to very long text | String or rope | flat strings read fast, and ropes edit cheaply |

## Common Pitfalls

- Inserting in the middle of an array in a loop: each insert is O(n), so n inserts are O(n^2).
- Counting a linked list as fast for access: reaching index `i` follows `i` links.
- Expecting O(1) dequeue from every queue: the plain array queue shifts its items in Python and C++.
- Treating strings as mutable: in Python and Go every edit builds a new string.
- Popping or peeking when empty: the stack and queue raise an error, so check `is_empty()` first.

## Related

- [Big-O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Hashing](../Hashing/): a hash table is an array of buckets that are themselves lists, plus a hash function for O(1) average lookup by key.
- [Non-Linear Data Structures](../Non_Linear/): trees, heaps and graphs, where items have more than one next item.
- [Advanced Data Structures](../Advanced_Structures/): caches and the disjoint set union, built by combining the structures here.
- [Two Pointers](../../Problem_Patterns/Two_Pointers/): the pattern that walks an array or string from both ends.
