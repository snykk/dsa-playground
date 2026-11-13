"""Generate golden fixtures for the stack and queue visualizations from the repository's Python code.

The web visualizer re-implements the three stacks and four queues of
Data_Structures/Linear/Stack and Data_Structures/Linear/Queue in TypeScript
(web/src/viz/algorithms/stack.ts, queue.ts and priorityQueue.ts). These fixtures run the
Python classes on fixed operation scripts and record, after every operation, the return
value or the exception it raised and the state the class holds:

- the static stack's array and top index (overflow at capacity),
- the dynamic stack's list and the slots CPython has allocated for it (read with
  sys.getsizeof; list_resize grows and shrinks the block, which the visualization draws),
- the linked stack's chain from top,
- the simple queue's list and the deque's list,
- the circular queue's array with front and rear (the wrap-around and the -1 sentinel),
- the priority queue's heap list of (priority, count, item) tuples and its counter, which
  pins heapq's sift order and the dequeue order of equal priorities.

Run from anywhere:

    python3 web/scripts/gen_stacksQueues_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/stacksQueues.json. CI regenerates the
file and fails if it changed, which means the implementations drifted.
"""

import importlib.util
import json
import random
import struct
import sys
from pathlib import Path

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]
LINEAR = ROOT / "Data_Structures" / "Linear"
OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "stacksQueues.json"


def load(name, path):
    """Import a file under its own module name (both array stacks are called array_stack.py)."""
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


StaticStack = load("static_array_stack", LINEAR / "Stack" / "Static_Array_Stack" / "Python" / "array_stack.py").ArrayStack
DynamicStack = load("dynamic_array_stack", LINEAR / "Stack" / "Dynamic_Array_Stack" / "Python" / "array_stack.py").ArrayStack
LinkedStack = load("linked_list_stack", LINEAR / "Stack" / "Linked_List_Stack" / "Python" / "linked_list_stack.py").LinkedListStack
SimpleQueue = load("simple_queue", LINEAR / "Queue" / "Simple_Queue" / "Python" / "simple_queue.py").SimpleQueue
CircularQueue = load("circular_queue", LINEAR / "Queue" / "Circular_Queue" / "Python" / "circular_queue.py").CircularQueue
Deque = load("deque_impl", LINEAR / "Queue" / "Deque" / "Python" / "deque.py").Deque
PriorityQueue = load("priority_queue", LINEAR / "Queue" / "Priority_Queue" / "Python" / "priority_queue.py").PriorityQueue

POINTER = struct.calcsize("P")
EMPTY_LIST = sys.getsizeof([])
RNG = random.Random(20261113)


def allocated(lst):
    """Slots CPython keeps allocated behind a list."""
    return (sys.getsizeof(lst) - EMPTY_LIST) // POINTER


def call(obj, op):
    """Run one operation; return (result, exception name)."""
    try:
        return getattr(obj, op[0])(*op[1:]), None
    except (OverflowError, IndexError) as exc:
        return None, type(exc).__name__


def values(n):
    """n distinct short values, numbers and words, as the visualization's parser keeps them."""
    pool = [str(v) for v in range(-9, 100)] + ["A", "B", "C", "D", "E", "F", "G", "H", "ab", "x1", "Zed", "q"]
    return RNG.sample(pool, n)


def script(n, weights, pushes):
    """A random operation list: each entry is (name, argument count) drawn by weight."""
    names = list(weights)
    vals = iter(values(n))
    ops = []
    for _ in range(n):
        name = RNG.choices(names, [weights[k] for k in names])[0]
        ops.append([name, next(vals)] if name in pushes else [name])
    return ops


STACK_OPS = {"push": 5, "pop": 3, "peek": 1, "size": 1, "is_empty": 1}
QUEUE_OPS = {"enqueue": 5, "dequeue": 3, "peek": 1, "size": 1, "is_empty": 1}


def static_stack_cases():
    fixed = [
        (3, [["push", "A"], ["push", "B"], ["push", "C"], ["push", "D"], ["pop"], ["pop"], ["peek"], ["size"]]),
        (1, [["pop"], ["peek"], ["push", "7"], ["push", "8"], ["is_empty"], ["pop"], ["is_empty"], ["pop"]]),
        (5, [["push", "10"], ["push", "20"], ["push", "30"], ["pop"], ["push", "40"], ["peek"], ["size"]]),
    ]
    cases = fixed + [(RNG.randint(1, 6), script(RNG.randint(1, 16), STACK_OPS, {"push"})) for _ in range(35)]
    out = []
    for capacity, ops in cases:
        s = StaticStack(capacity)
        steps = []
        for op in ops:
            result, error = call(s, op)
            steps.append({"result": result, "error": error, "stack": list(s.stack), "top": s.top})
        out.append({"capacity": capacity, "ops": ops, "steps": steps})
    return out


def dynamic_stack_cases():
    grow = [["push", str(v)] for v in range(1, 18)]
    fixed = [
        grow + [["pop"]] * 18,
        [["pop"], ["push", "1"], ["pop"], ["push", "2"], ["push", "3"], ["peek"], ["size"], ["is_empty"]],
        [["push", str(v)] for v in range(26)] + [["pop"]] * 24 + [["push", "x1"]],
    ]
    cases = fixed + [script(RNG.randint(1, 24), {"push": 6, "pop": 3, "peek": 1, "size": 1, "is_empty": 1}, {"push"}) for _ in range(30)]
    out = []
    for ops in cases:
        s = DynamicStack()
        steps = []
        for op in ops:
            result, error = call(s, op)
            steps.append({"result": result, "error": error, "stack": list(s.stack), "allocated": allocated(s.stack)})
        out.append({"ops": ops, "steps": steps})
    return out


def linked_stack_cases():
    fixed = [[["push", "10"], ["push", "20"], ["push", "30"], ["pop"], ["pop"], ["pop"], ["pop"], ["peek"], ["size"], ["is_empty"]]]
    cases = fixed + [script(RNG.randint(1, 18), STACK_OPS, {"push"}) for _ in range(28)]
    out = []
    for ops in cases:
        s = LinkedStack()
        steps = []
        for op in ops:
            result, error = call(s, op)
            items, node = [], s.top
            while node is not None:
                items.append(node.value)
                node = node.next
            steps.append({"result": result, "error": error, "items": items, "size": s.size()})
        out.append({"ops": ops, "steps": steps})
    return out


def simple_queue_cases():
    fixed = [[["enqueue", "10"], ["enqueue", "20"], ["enqueue", "30"], ["dequeue"], ["enqueue", "40"], ["peek"], ["dequeue"], ["dequeue"], ["dequeue"], ["dequeue"]]]
    cases = fixed + [script(RNG.randint(1, 18), QUEUE_OPS, {"enqueue"}) for _ in range(28)]
    out = []
    for ops in cases:
        q = SimpleQueue()
        steps = []
        for op in ops:
            result, error = call(q, op)
            steps.append({"result": result, "error": error, "queue": list(q.queue)})
        out.append({"ops": ops, "steps": steps})
    return out


def circular_queue_cases():
    letters = [["enqueue", c] for c in "ABCDE"]
    fixed = [
        (5, letters + [["dequeue"], ["dequeue"], ["enqueue", "F"], ["enqueue", "G"], ["is_full"], ["enqueue", "H"], ["size"]]),
        (1, [["dequeue"], ["enqueue", "7"], ["is_full"], ["enqueue", "8"], ["dequeue"], ["is_empty"], ["peek"]]),
        (3, [op for i in range(7) for op in (["enqueue", str(i)], ["dequeue"])] + [["enqueue", "a"], ["enqueue", "b"], ["enqueue", "c"], ["size"]]),
        (4, [["enqueue", "1"], ["enqueue", "2"], ["dequeue"], ["dequeue"], ["enqueue", "3"], ["enqueue", "4"], ["enqueue", "5"], ["size"], ["is_full"]]),
    ]
    weights = {"enqueue": 5, "dequeue": 4, "peek": 1, "size": 1, "is_empty": 1, "is_full": 1}
    cases = fixed + [(RNG.randint(1, 7), script(RNG.randint(1, 20), weights, {"enqueue"})) for _ in range(36)]
    out = []
    for capacity, ops in cases:
        q = CircularQueue(capacity)
        steps = []
        for op in ops:
            result, error = call(q, op)
            steps.append({"result": result, "error": error, "queue": list(q.queue), "front": q.front, "rear": q.rear})
        out.append({"capacity": capacity, "ops": ops, "steps": steps})
    return out


def deque_cases():
    fixed = [
        [["push_front", "1"], ["push_back", "2"], ["push_front", "3"], ["push_back", "4"], ["display"], ["peek_front"], ["peek_back"], ["pop_front"], ["pop_back"], ["size"]],
        [["pop_front"], ["pop_back"], ["peek_front"], ["peek_back"], ["push_front", "9"], ["pop_back"], ["is_empty"]],
    ]
    weights = {"push_front": 3, "push_back": 3, "pop_front": 2, "pop_back": 2, "peek_front": 1, "peek_back": 1, "size": 1, "is_empty": 1, "display": 1}
    cases = fixed + [script(RNG.randint(1, 18), weights, {"push_front", "push_back"}) for _ in range(28)]
    out = []
    for ops in cases:
        d = Deque()
        steps = []
        for op in ops:
            result, error = call(d, op)
            steps.append({"result": result, "error": error, "deque": list(d.deque)})
        out.append({"ops": ops, "steps": steps})
    return out


def priority_queue_cases():
    tasks = [["enqueue", "rep", 3], ["enqueue", "fix", 1], ["enqueue", "eml", 3], ["enqueue", "dep", 2], ["enqueue", "rev", 1]]
    fixed = [
        tasks + [["dequeue"]] * 6,
        [["enqueue", "A", 1], ["enqueue", "B", 1], ["enqueue", "C", 1], ["dequeue"], ["dequeue"], ["dequeue"], ["peek"]],
        [["enqueue", "x", 5], ["clear"], ["enqueue", "y", 5], ["enqueue", "z", 5], ["dequeue"], ["size"], ["is_empty"]],
        [["enqueue", "i1", -10], ["enqueue", "i2", -5], ["enqueue", "i3", -1], ["dequeue"]],
    ]
    cases = list(fixed)
    for _ in range(40):
        ops = []
        names = iter(values(30))
        for _ in range(RNG.randint(1, 20)):
            r = RNG.random()
            if r < 0.5:
                ops.append(["enqueue", next(names), RNG.randint(0, 4) if RNG.random() < 0.7 else RNG.randint(-20, 20)])
            elif r < 0.85:
                ops.append(["dequeue"])
            else:
                ops.append([RNG.choice(["peek", "size", "is_empty", "clear"])])
        cases.append(ops)
    out = []
    for ops in cases:
        pq = PriorityQueue()
        steps = []
        for op in ops:
            result, error = call(pq, op)
            steps.append({"result": result, "error": error, "heap": [list(e) for e in pq.heap], "count": pq.count})
        out.append({"ops": ops, "steps": steps})
    return out


def main():
    sections = {
        "staticStack": static_stack_cases(),
        "dynamicStack": dynamic_stack_cases(),
        "linkedStack": linked_stack_cases(),
        "simpleQueue": simple_queue_cases(),
        "circularQueue": circular_queue_cases(),
        "deque": deque_cases(),
        "priorityQueue": priority_queue_cases(),
    }
    header = {
        "generator": "web/scripts/gen_stacksQueues_fixtures.py",
        "reference": "Data_Structures/Linear/Stack (Static_Array_Stack, Dynamic_Array_Stack, Linked_List_Stack) and Data_Structures/Linear/Queue (Simple_Queue, Circular_Queue, Deque, Priority_Queue), Python",
    }
    parts = []
    for key, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(key) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    counts = ", ".join(f"{len(c)} {k}" for k, c in sections.items())
    print(f"wrote {counts} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
