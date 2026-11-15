"""Generate golden backtracking fixtures from the repository's Python implementations.

The web visualizer re-implements the four backtracking searches in TypeScript
(web/src/viz/algorithms/nQueens.ts, sudoku.ts, ratInMaze.ts, graphColoring.ts). These fixtures
pin each port to its reference in Algorithms/Advanced_Algorithms/Backtracking by recording
the search itself, not only its answer:

- N-Queens: every is_safe(row, col) call and its answer, every write to the board
  (a queen placed or lifted) and the solutions, for first-solution and find_all runs;
- Sudoku: is_valid_puzzle's answer, every find_empty result, every is_valid(row, col, num)
  call and its answer, every write to the board, the return value and the final board;
- Rat in a Maze: every solve_maze_util(x, y) call and what it returned, and the solution;
- Graph Coloring: every is_safe(v, c) call, its answer and the color array it saw, the
  coloring returned for m colors, and chromatic_number with every m it tried.

The calls are recorded by wrapping the module functions (the recursion looks them up as
module globals) and by giving the code board rows that log their writes. No randomness
reaches the code itself: the random cases come from a seeded generator and are fixed inputs.

Run from anywhere:

    python3 web/scripts/gen_backtracking_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/backtracking.json. CI regenerates the file and
fails if it changed, which means the two implementations drifted.
"""

import copy
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BT = ROOT / "Algorithms" / "Advanced_Algorithms" / "Backtracking"
for folder in ("N_Queens_Problem", "Sudoku_Solver", "Rat_in_a_Maze", "Graph_Coloring"):
    sys.path.insert(0, str(BT / folder / "Python"))

import graph_coloring  # noqa: E402
import n_queens  # noqa: E402
import rat_in_maze  # noqa: E402
import sudoku_solver  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "backtracking.json"
RNG = random.Random(20261115)

LOG = []


class LoggedRow(list):
    """A board row that records every write as ["set", row, col, value]."""

    def __init__(self, items, row):
        super().__init__(items)
        self.row = row

    def __setitem__(self, col, value):
        LOG.append(["set", self.row, col, value])
        super().__setitem__(col, value)


def logged_board(board):
    return [LoggedRow(r, i) for i, r in enumerate(board)]


def wrap(module, name, record):
    """Replace module.name by a wrapper that calls record(args, result) after each call."""
    original = getattr(module, name)

    def wrapper(*args):
        result = original(*args)
        record(args, result)
        return result

    setattr(module, name, wrapper)
    return original


# ---------- N-Queens ----------

wrap(n_queens, "is_safe", lambda a, r: LOG.append(["check", a[1], a[2], r]))


def queens_case(n, find_all):
    del LOG[:]
    board = logged_board([[0] * n for _ in range(n)])
    solutions = []
    n_queens.solve_n_queens_util(board, 0, n, solutions, find_all)
    events = list(LOG)
    # The public function gives the same boards (its own board is not logged).
    assert n_queens.solve_n_queens(n, find_all) == solutions
    return {"n": n, "findAll": find_all, "solutions": [[row.index(1) for row in b] for b in solutions], "events": events}


def queens_cases():
    cases = [queens_case(n, False) for n in range(1, 9)]
    cases += [queens_case(n, True) for n in range(1, 7)]
    return cases


# ---------- Sudoku ----------

wrap(sudoku_solver, "is_valid", lambda a, r: LOG.append(["check", a[1], a[2], a[3], r]))
wrap(sudoku_solver, "find_empty", lambda a, r: LOG.append(["find", r[0], r[1]] if r is not None else ["find", None]))
wrap(sudoku_solver, "is_valid_puzzle", lambda a, r: LOG.append(["puzzle", r]))

SOLUTION = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
]

PUZZLE = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
]


def sudoku_case(board):
    del LOG[:]
    work = logged_board(copy.deepcopy(board))
    result = sudoku_solver.solve_sudoku(work)
    return {"board": board, "result": result, "final": [list(r) for r in work], "events": list(LOG)}


def mixed(rows):
    """The example puzzle in the given rows, its solution everywhere else."""
    return [list(PUZZLE[i]) if i in rows else list(SOLUTION[i]) for i in range(9)]


def random_solved():
    """The example solution with its digits relabelled and rows and columns shuffled within bands."""
    relabel = list(range(1, 10))
    RNG.shuffle(relabel)

    def lines():
        bands = [0, 1, 2]
        RNG.shuffle(bands)
        out = []
        for band in bands:
            inner = [0, 1, 2]
            RNG.shuffle(inner)
            out += [band * 3 + k for k in inner]
        return out

    rows, cols = lines(), lines()
    return [[relabel[SOLUTION[r][c] - 1] for c in cols] for r in rows]


def sudoku_cases():
    duplicate = copy.deepcopy(SOLUTION)
    duplicate[0][0] = duplicate[0][1]
    box_clash = copy.deepcopy(PUZZLE)
    box_clash[2][0] = 3
    column_clash = copy.deepcopy(PUZZLE)
    column_clash[4][1] = 9
    no_solution = [[0] * 9 for _ in range(9)]
    no_solution[0][:8] = [1, 2, 3, 4, 5, 6, 7, 8]
    no_solution[1][8] = 9
    two_ways = copy.deepcopy(SOLUTION)
    for r, c in ((0, 0), (0, 1), (1, 0), (1, 4), (3, 3), (5, 5)):
        two_ways[r][c] = 0
    boards = [mixed([0]), mixed([0, 1]), mixed([0, 1, 2]), mixed([6, 7, 8]), mixed([3, 4, 5]), copy.deepcopy(SOLUTION)]
    boards += [duplicate, box_clash, column_clash, no_solution, two_ways]
    while len(boards) < 40:
        board = random_solved()
        for x in RNG.sample(range(81), RNG.randint(6, 20)):
            board[x // 9][x % 9] = 0
        boards.append(board)
    return [sudoku_case(b) for b in boards]


# ---------- Rat in a Maze ----------


_maze_util = rat_in_maze.solve_maze_util


def maze_util(maze, x, y, n, solution, visited):
    LOG.append(["call", x, y])
    result = _maze_util(maze, x, y, n, solution, visited)
    LOG.append(["ret", x, y, result])
    return result


rat_in_maze.solve_maze_util = maze_util


def maze_case(maze):
    del LOG[:]
    solution = rat_in_maze.solve_maze(copy.deepcopy(maze))
    return {"maze": maze, "solution": solution, "events": list(LOG)}


def maze_cases():
    mazes = [
        [[1, 1, 0, 0, 0], [1, 0, 0, 1, 1], [1, 1, 1, 1, 0], [0, 0, 0, 1, 1], [0, 0, 0, 0, 1]],
        [[1, 0, 1, 1, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [1, 1, 1, 0, 1], [0, 0, 0, 0, 1]],
        [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 0], [1, 1, 1, 0, 1]],
        [[1, 0, 0, 0], [1, 1, 0, 1], [0, 1, 0, 0], [1, 1, 1, 1]],
        [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 1]],
        [[1, 1, 1], [1, 1, 1]],
        [[1]],
        [[0]],
        [[1, 1], [1, 0]],
        [[0, 1], [1, 1]],
    ]
    while len(mazes) < 60:
        n = RNG.randint(2, 8)
        p = RNG.choice([0.55, 0.65, 0.75, 0.85])
        maze = [[1 if RNG.random() < p else 0 for _ in range(n)] for _ in range(n)]
        if RNG.random() < 0.85:
            maze[0][0] = maze[n - 1][n - 1] = 1
        mazes.append(maze)
    return [maze_case(m) for m in mazes]


# ---------- Graph Coloring ----------

wrap(graph_coloring, "is_safe", lambda a, r: LOG.append(["check", a[1], a[3], r, list(a[2])]))
_coloring = graph_coloring.graph_coloring


def logged_coloring(graph, m):
    LOG.append(["m", m])
    return _coloring(graph, m)


def matrix(n, edges):
    g = [[0] * n for _ in range(n)]
    for a, b in edges:
        g[a][b] = g[b][a] = 1
    return g


def coloring_case(n, edges, m):
    del LOG[:]
    result = graph_coloring.graph_coloring(matrix(n, edges), m)
    return {"n": n, "edges": edges, "m": m, "result": result, "events": list(LOG)}


def chromatic_case(n, edges):
    del LOG[:]
    graph_coloring.graph_coloring = logged_coloring
    try:
        result = graph_coloring.chromatic_number(matrix(n, edges))
    finally:
        graph_coloring.graph_coloring = _coloring
    return {"n": n, "edges": edges, "result": result, "events": list(LOG)}


def random_graph():
    n = RNG.randint(1, 7)
    p = RNG.choice([0.25, 0.4, 0.55, 0.7])
    edges = [[a, b] for a in range(n) for b in range(a + 1, n) if RNG.random() < p]
    return n, edges


ARTICLE = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3]]
CYCLE5 = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4]]
K4 = [[a, b] for a in range(4) for b in range(a + 1, 4)]


def coloring_cases():
    fixed = [(4, ARTICLE, 3), (4, ARTICLE, 2), (4, [[0, 2], [2, 3], [1, 3]], 2), (5, CYCLE5, 2), (5, CYCLE5, 3), (4, K4, 3), (4, K4, 4), (3, [], 1), (1, [], 1)]
    cases = [coloring_case(n, e, m) for n, e, m in fixed]
    while len(cases) < 50:
        n, edges = random_graph()
        cases.append(coloring_case(n, edges, RNG.randint(1, 4)))
    return cases


def chromatic_cases():
    fixed = [(4, ARTICLE), (5, CYCLE5), (4, K4), (6, [[a, (a + 1) % 6] for a in range(6)]), (3, []), (1, [])]
    cases = [chromatic_case(n, e) for n, e in fixed]
    while len(cases) < 25:
        cases.append(chromatic_case(*random_graph()))
    return cases


def main():
    sections = {
        "nQueens": queens_cases(),
        "sudoku": sudoku_cases(),
        "maze": maze_cases(),
        "coloring": coloring_cases(),
        "chromatic": chromatic_cases(),
    }
    header = {
        "generator": "web/scripts/gen_backtracking_fixtures.py",
        "reference": "Algorithms/Advanced_Algorithms/Backtracking (n_queens.py, sudoku_solver.py, rat_in_maze.py, graph_coloring.py)",
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
