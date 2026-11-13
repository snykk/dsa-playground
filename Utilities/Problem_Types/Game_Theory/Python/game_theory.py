"""
Game Theory Basics for Competitive Programming (Python)

Covers Nim, Sprague-Grundy theorem, and common game patterns.
"""

from typing import List, Tuple, Set, Dict, Callable, Optional
from functools import lru_cache
import math

# Nim Game

def nim_winner(piles: List[int]) -> bool:
    """
    Classic Nim: First player wins if XOR of all piles is non-zero.
    """
    xor_sum = 0
    for pile in piles:
        xor_sum ^= pile
    return xor_sum != 0


def nim_winning_move(piles: List[int]) -> Tuple[int, int]:
    """
    Find a winning move in Nim.
    Returns (pile_index, take_amount) or (-1, -1) if losing.
    """
    xor_sum = 0
    for pile in piles:
        xor_sum ^= pile
    
    if xor_sum == 0:
        return (-1, -1)  # Losing position
    
    for i, pile in enumerate(piles):
        target = pile ^ xor_sum
        if target < pile:
            return (i, pile - target)
    
    return (-1, -1)


# Sprague-Grundy Theorem

def mex(s: Set[int]) -> int:
    """Minimum excludant: smallest non-negative integer not in set."""
    result = 0
    while result in s:
        result += 1
    return result


def subtraction_grundy(n: int, moves: List[int]) -> List[int]:
    """
    Calculate Grundy numbers for subtraction game.
    Players can remove any amount in 'moves' from a pile.
    """
    grundy = [0] * (n + 1)
    
    for i in range(1, n + 1):
        reachable = set()
        for move in moves:
            if i >= move:
                reachable.add(grundy[i - move])
        grundy[i] = mex(reachable)
    
    return grundy


def combined_grundy(states: List[int], grundy_tables: List[List[int]]) -> int:
    """
    Combined game: XOR of individual Grundy numbers.
    """
    result = 0
    for i, state in enumerate(states):
        result ^= grundy_tables[i][state]
    return result


# Common Game Patterns

def misere_nim_winner(piles: List[int]) -> bool:
    """
    Misere Nim: the player who takes the last object loses.
    Same as normal Nim unless every pile has at most one object. Then the
    first player wins exactly when the number of NON-EMPTY piles is even
    (empty piles do not count).
    """
    xor_sum = 0
    big_pile = False
    non_empty = 0

    for pile in piles:
        xor_sum ^= pile
        if pile > 1:
            big_pile = True
        if pile > 0:
            non_empty += 1

    if not big_pile:
        return non_empty % 2 == 0
    return xor_sum != 0


def staircase_nim(stairs: List[int]) -> bool:
    """
    Staircase Nim: a move shifts any number of stones from stairs[i] down to
    stairs[i - 1]; stairs[0] is the ground, where stones are out of play.
    Only the odd-indexed stairs matter; the first player wins iff their XOR
    is non-zero.
    """
    xor_sum = 0
    for i in range(1, len(stairs), 2):
        xor_sum ^= stairs[i]
    return xor_sum != 0


# Wythoff's Game

def wythoff_winner(a: int, b: int) -> bool:
    """
    Wythoff's game: Two piles, can take any from one or equal from both.
    Cold positions are (floor(k*phi), floor(k*phi^2)) for k = 0, 1, 2, ...
    """
    if a > b:
        a, b = b, a
    
    phi = (1 + math.sqrt(5)) / 2  # Golden ratio
    k = b - a
    n = int(k * phi)
    
    return a != n  # First player wins if not a cold position


def wythoff_cold_positions(limit: int) -> List[Tuple[int, int]]:
    """Generate cold (losing) positions in Wythoff's game."""
    phi = (1 + math.sqrt(5)) / 2
    phi2 = phi * phi
    
    positions = []
    for k in range(limit):
        a = int(k * phi)
        b = int(k * phi2)
        positions.append((a, b))
    
    return positions


# DP-based Game Analysis

def can_win(state: int, get_moves: Callable[[int], List[int]], memo: Dict = None) -> bool:
    """
    Generic game state DP.
    Returns True if current player wins from state.
    """
    if memo is None:
        memo = {}
    
    if state in memo:
        return memo[state]
    
    moves = get_moves(state)
    
    if not moves:
        memo[state] = False  # No moves = current player loses
        return False
    
    # Current player wins if any move leads to opponent losing
    for next_state in moves:
        if not can_win(next_state, get_moves, memo):
            memo[state] = True
            return True
    
    memo[state] = False
    return False


def stone_game_dp(n: int, k: int) -> bool:
    """
    Stone game: Take 1 to k stones, last to take wins.
    Pattern repeats every k+1.
    """
    return n % (k + 1) != 0


# Fibonacci Nim

def zeckendorf(n: int) -> List[int]:
    """
    Zeckendorf representation: express n as sum of non-consecutive Fibonacci numbers.
    """
    if n == 0:
        return []
    
    fibs = [1, 2]
    while fibs[-1] < n:
        fibs.append(fibs[-1] + fibs[-2])
    
    result = []
    for i in range(len(fibs) - 1, -1, -1):
        if fibs[i] <= n:
            result.append(fibs[i])
            n -= fibs[i]
    
    return result


def fibonacci_nim_winner(n: int) -> bool:
    """
    Fibonacci Nim: First move 1 to n-1, then up to 2x previous.
    First player wins iff n is not a Fibonacci number.
    """
    a, b = 1, 2
    while b < n:
        a, b = b, a + b
    return b != n and a != n


# Game Graph Analysis

WIN, LOSE, DRAW = "win", "lose", "draw"


def game_graph_outcomes(n: int, edges: List[Tuple[int, int]]) -> List[str]:
    """
    Outcome of a token-moving game on a directed graph (cycles allowed), for
    the player to move at each node: "win", "lose" or "draw" (the game never
    ends with best play). A player with no move loses.

    Retrograde analysis: start from the nodes with no moves (lose), mark a
    node "win" as soon as one move reaches a "lose" node, mark it "lose" when
    all its moves reach "win" nodes. Nodes never settled are draws.
    """
    adj = [[] for _ in range(n)]
    rev = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        rev[v].append(u)

    outcome = [None] * n
    remaining = [len(adj[u]) for u in range(n)]
    queue = []
    for u in range(n):
        if remaining[u] == 0:
            outcome[u] = LOSE
            queue.append(u)

    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        for u in rev[v]:
            if outcome[u] is not None:
                continue
            if outcome[v] == LOSE:
                outcome[u] = WIN
                queue.append(u)
            else:
                remaining[u] -= 1
                if remaining[u] == 0:
                    outcome[u] = LOSE
                    queue.append(u)

    return [o if o is not None else DRAW for o in outcome]


def analyze_game_graph(n: int, edges: List[Tuple[int, int]]) -> List[bool]:
    """
    Analyze directed game graph where players move a token.
    edges[i] = (from, to) representing possible moves.
    Returns winning[i] = True if the player to move at node i wins.
    Cycles are allowed: a draw counts as not winning (see game_graph_outcomes
    to tell draws and losses apart). On an acyclic graph this is the same as
    "Grundy number is non-zero".
    """
    return [o == WIN for o in game_graph_outcomes(n, edges)]


if __name__ == "__main__":
    # Example: Standard Nim
    piles = [3, 4, 5]
    print(f"Nim with piles {piles}: {'First wins' if nim_winner(piles) else 'Second wins'}")
    
    # Example: Winning move
    move = nim_winning_move(piles)
    print(f"Winning move: take {move[1]} from pile {move[0]}")
    
    # Example: Subtraction game
    moves = [1, 2, 3]
    grundy = subtraction_grundy(10, moves)
    print(f"Grundy numbers for subtraction game: {grundy}")
    
    # Example: Wythoff's game
    print(f"Wythoff (3, 5): {'First wins' if wythoff_winner(3, 5) else 'Second wins'}")
    
    # Example: Zeckendorf representation
    print(f"Zeckendorf(13) = {zeckendorf(13)}")

