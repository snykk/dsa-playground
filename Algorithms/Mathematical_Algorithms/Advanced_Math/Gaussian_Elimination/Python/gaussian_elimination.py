"""
Gaussian Elimination

Solves A x = b, n equations in m unknowns, by reducing the augmented matrix [A | b] to row
echelon form and then substituting back from the last pivot up. Two versions:

- solve(A, b, eps): floating point with partial pivoting. In each column the pivot is the entry
  of largest absolute value at or below the current row (the upper row wins a tie), and an
  entry with |v| <= eps (EPS = 1e-9 by default) counts as zero. solve_without_pivoting takes
  the first entry that is not zero instead, which is what shows why pivoting matters.
- solve_mod(A, b, p): exact arithmetic modulo a prime p. The pivot is the first nonzero entry,
  and dividing by it multiplies by its inverse a^(p - 2) mod p (Fermat's little theorem, which
  is Euler's theorem with phi(p) = p - 1).

Both report one of three kinds: NO_SOLUTION (a row reads 0 = c with c not zero), UNIQUE (a
pivot in every column) or INFINITE (some column has no pivot: its unknown is free). For
INFINITE, x is the particular solution with every free unknown set to 0. The rank is the
number of pivots. determinant and determinant_mod run the same forward elimination on a square
matrix: the product of the pivots, negated once per row swap.

Time: the forward elimination is three nested loops (a pivot per column, the rows below it,
the entries to its right): at most min(n, m) * n * (m + 1) updates, O(n^3) for a square
system. Back substitution is O(n * m).
"""

from enum import Enum
from typing import List, NamedTuple, Optional, Tuple

EPS = 1e-9


class Kind(Enum):
    NO_SOLUTION = "no solution"
    UNIQUE = "unique"
    INFINITE = "infinite"


class Solution(NamedTuple):
    """What solve, solve_without_pivoting and solve_mod return."""

    kind: Kind
    x: Optional[list]  # one solution, free unknowns 0; None for Kind.NO_SOLUTION
    rank: int  # the number of pivots: the rank of A
    pivot_cols: List[int]  # the column of each pivot row, increasing
    swaps: int  # row swaps made while choosing pivots
    updates: int  # entries the forward elimination recomputed: the work


# ---------- shared checks ----------


def _check_shape(A, b) -> Tuple[int, int]:
    """(n, m) for n >= 1 equations in m >= 1 unknowns; ValueError otherwise."""
    n = len(A)
    if n == 0:
        raise ValueError("A has no rows: a system needs at least one equation")
    m = len(A[0])
    if m == 0:
        raise ValueError("A has no columns: a system needs at least one unknown")
    for i, row in enumerate(A):
        if len(row) != m:
            raise ValueError(f"row {i} of A has {len(row)} entries, but row 0 has {m}")
    if len(b) != n:
        raise ValueError(f"b has {len(b)} entries, but A has {n} rows")
    return n, m


def _check_square(A) -> int:
    n = len(A)
    if n == 0:
        raise ValueError("A has no rows: the determinant needs a square matrix of size at least 1")
    for i, row in enumerate(A):
        if len(row) != n:
            raise ValueError(f"row {i} of A has {len(row)} entries, but A has {n} rows: the determinant needs a square matrix")
    return n


# ---------- floating point ----------


def _choose_pivot(M, row: int, col: int, eps: float, partial: bool) -> int:
    """The row, from row down, whose entry in col becomes the pivot; -1 if all are zero.

    Partial pivoting takes the largest |M[r][col]|, the upper row on a tie (the test is a
    strict >). Without pivoting it takes the first row whose entry is not zero. Either way an
    entry with |v| <= eps counts as zero.
    """
    if partial:
        best = row
        for r in range(row + 1, len(M)):
            if abs(M[r][col]) > abs(M[best][col]):
                best = r
        return best if abs(M[best][col]) > eps else -1
    for r in range(row, len(M)):
        if abs(M[r][col]) > eps:
            return r
    return -1


def _subtract_row(M, target: int, source: int, col: int, factor: float) -> int:
    """Row target -= factor * row source. Column col becomes exactly 0; only the entries to
    its right are computed, since the source row is zero to the left of col. Returns how many
    entries were computed."""
    src, dst = M[source], M[target]
    dst[col] = 0.0
    for c in range(col + 1, len(dst)):
        dst[c] -= factor * src[c]
    return len(dst) - col - 1


def _forward(M, cols: int, eps: float, partial: bool) -> Tuple[List[int], int, int]:
    """Reduce M to row echelon form in place, with pivots in columns 0..cols-1.

    Returns (pivot_cols, swaps, updates). A column with no entry above eps at or below the
    current row gets no pivot and the next column is tried with the same row.
    """
    n = len(M)
    pivot_cols: List[int] = []
    swaps = updates = 0
    row = 0
    for col in range(cols):
        if row == n:
            break
        r = _choose_pivot(M, row, col, eps, partial)
        if r < 0:
            continue
        if r != row:
            M[row], M[r] = M[r], M[row]
            swaps += 1
        for target in range(row + 1, n):
            if M[target][col] == 0.0:
                continue  # already zero: nothing to subtract
            factor = M[target][col] / M[row][col]
            updates += _subtract_row(M, target, row, col, factor)
        pivot_cols.append(col)
        row += 1
    return pivot_cols, swaps, updates


def _back_substitute(M, pivot_cols: List[int], m: int) -> List[float]:
    """x from the echelon form, from the last pivot row up; free unknowns stay 0."""
    x = [0.0] * m
    for i in range(len(pivot_cols) - 1, -1, -1):
        c = pivot_cols[i]
        s = M[i][m]
        for j in range(c + 1, m):
            s -= M[i][j] * x[j]
        x[c] = s / M[i][c]
    return x


def _solve(A, b, eps: float, partial: bool) -> Solution:
    n, m = _check_shape(A, b)
    M = [[float(v) for v in row] + [float(b[i])] for i, row in enumerate(A)]
    pivot_cols, swaps, updates = _forward(M, m, eps, partial)
    rank = len(pivot_cols)
    for r in range(rank, n):
        if abs(M[r][m]) > eps:  # the row reads 0 = M[r][m]
            return Solution(Kind.NO_SOLUTION, None, rank, pivot_cols, swaps, updates)
    x = _back_substitute(M, pivot_cols, m)
    kind = Kind.UNIQUE if rank == m else Kind.INFINITE
    return Solution(kind, x, rank, pivot_cols, swaps, updates)


def solve(A, b, eps: float = EPS) -> Solution:
    """Solve A x = b in floating point with partial pivoting.

    A is n x m (n, m >= 1), b has n entries; ints and floats are both accepted. An entry with
    |v| <= eps counts as zero, both when choosing a pivot and when testing a row 0 = c.
    Raises ValueError for an empty or ragged A, or a b of the wrong length.

    Time: O(min(n, m) * n * m), O(n^3) for a square system.
    """
    return _solve(A, b, eps, True)


def solve_without_pivoting(A, b, eps: float = EPS) -> Solution:
    """Like solve, but the pivot is the first entry with |v| > eps, however small: no
    partial pivoting. A tiny pivot makes huge multipliers, and rounding then swamps the
    answer. Kept to show why solve pivots."""
    return _solve(A, b, eps, False)


def determinant(A, eps: float = EPS) -> float:
    """det(A) for a square A: the product of the pivots of the forward elimination with
    partial pivoting, negated once per row swap; 0.0 when a column has no pivot (|v| <= eps).
    Raises ValueError unless A is square with at least one row. Time: O(n^3)."""
    n = _check_square(A)
    M = [[float(v) for v in row] for row in A]
    pivot_cols, swaps, _ = _forward(M, n, eps, True)
    if len(pivot_cols) < n:
        return 0.0
    det = -1.0 if swaps % 2 else 1.0
    for i in range(n):
        det *= M[i][i]
    return det


# ---------- modulo a prime ----------


def _check_modulus(p: int) -> None:
    if p < 2:
        raise ValueError(f"p = {p}: the modulus must be a prime, so at least 2")


def _inverse(a: int, p: int) -> int:
    """The inverse of a nonzero a modulo a prime p: a^(p - 2) mod p (Fermat's little theorem).

    The result is checked: if a * inv is not 1 modulo p, p was not prime, and ValueError says so.
    """
    inv = pow(a, p - 2, p)
    if a * inv % p != 1:
        raise ValueError(f"{a} has no inverse modulo {p} by Fermat's little theorem: p must be prime")
    return inv


def _subtract_row_mod(M, target: int, source: int, col: int, factor: int, p: int) -> int:
    """Row target -= factor * row source, modulo p, from column col on; returns how many
    entries were computed (those right of col; column col becomes 0)."""
    src, dst = M[source], M[target]
    dst[col] = 0
    for c in range(col + 1, len(dst)):
        dst[c] = (dst[c] - factor * src[c]) % p
    return len(dst) - col - 1


def _forward_mod(M, cols: int, p: int) -> Tuple[List[int], List[int], int, int]:
    """Row echelon form modulo p, in place. The pivot is the first nonzero entry at or below
    the current row. Returns (pivot_cols, inverses of the pivots, swaps, updates): one inverse
    per pivot, reused for every row below it and again in back substitution."""
    n = len(M)
    pivot_cols: List[int] = []
    inverses: List[int] = []
    swaps = updates = 0
    row = 0
    for col in range(cols):
        if row == n:
            break
        r = next((r for r in range(row, n) if M[r][col] != 0), -1)
        if r < 0:
            continue
        if r != row:
            M[row], M[r] = M[r], M[row]
            swaps += 1
        inv = _inverse(M[row][col], p)
        for target in range(row + 1, n):
            if M[target][col] == 0:
                continue
            factor = M[target][col] * inv % p
            updates += _subtract_row_mod(M, target, row, col, factor, p)
        pivot_cols.append(col)
        inverses.append(inv)
        row += 1
    return pivot_cols, inverses, swaps, updates


def solve_mod(A, b, p: int) -> Solution:
    """Solve A x = b modulo a prime p, exactly.

    Entries may be any integers (negative ones too); they are reduced into [0, p) first, and
    every entry of x is in [0, p). Raises ValueError for p < 2, for an empty or ragged A or a
    b of the wrong length, and when a pivot has no inverse, which happens only for a p that
    is not prime (the code does not test primality itself).

    Time: O(min(n, m) * n * m) operations modulo p, plus O(log p) per pivot for its inverse.
    """
    _check_modulus(p)
    n, m = _check_shape(A, b)
    M = [[v % p for v in row] + [b[i] % p] for i, row in enumerate(A)]
    pivot_cols, inverses, swaps, updates = _forward_mod(M, m, p)
    rank = len(pivot_cols)
    for r in range(rank, n):
        if M[r][m] != 0:
            return Solution(Kind.NO_SOLUTION, None, rank, pivot_cols, swaps, updates)
    x = [0] * m
    for i in range(rank - 1, -1, -1):
        c = pivot_cols[i]
        s = M[i][m]
        for j in range(c + 1, m):
            s = (s - M[i][j] * x[j]) % p
        x[c] = s * inverses[i] % p
    kind = Kind.UNIQUE if rank == m else Kind.INFINITE
    return Solution(kind, x, rank, pivot_cols, swaps, updates)


def determinant_mod(A, p: int) -> int:
    """det(A) mod p for a square A, in [0, p): the product of the pivots, negated once per
    row swap. Raises ValueError for p < 2, a matrix that is not square, or a pivot with no
    inverse (p not prime)."""
    _check_modulus(p)
    n = _check_square(A)
    M = [[v % p for v in row] for row in A]
    pivot_cols, _, swaps, _ = _forward_mod(M, n, p)
    if len(pivot_cols) < n:
        return 0
    det = p - 1 if swaps % 2 else 1
    for i in range(n):
        det = det * M[i][i] % p
    return det


def main() -> None:
    A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]
    b = [8, -11, -3]
    print("solve:", solve(A, b))
    print("determinant:", determinant(A))
    print("solve_mod(p = 7):", solve_mod(A, b, 7))
    print("determinant_mod(p = 7):", determinant_mod(A, 7))
    print("singular, consistent:", solve([[1, 2], [2, 4]], [3, 6]))
    print("singular, inconsistent:", solve([[1, 2], [2, 4]], [3, 7]))


if __name__ == "__main__":
    main()
