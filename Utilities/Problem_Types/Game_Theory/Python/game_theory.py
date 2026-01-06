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
    Misère Nim: Last to move loses.
    Different from normal Nim only when all piles are 1.
    """
    xor_sum = 0
    all_ones = True
    
    for pile in piles:
        xor_sum ^= pile
        if pile > 1:
            all_ones = False
    
    if all_ones:
        # Odd number of piles = second player wins
        return len(piles) % 2 == 0
    return xor_sum != 0


def staircase_nim(stairs: List[int]) -> bool:
    """
    Staircase Nim: Only odd-indexed stairs matter.
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

def analyze_game_graph(n: int, edges: List[Tuple[int, int]]) -> List[bool]:
    """
    Analyze directed game graph where players move a token.
    edges[i] = (from, to) representing possible moves.
    Returns winning[i] = True if player to move at node i wins.
    """
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    
    # Calculate Grundy numbers
    grundy = [-1] * n
    
    def calc_grundy(u: int) -> int:
        if grundy[u] != -1:
            return grundy[u]
        
        if not adj[u]:  # No moves
            grundy[u] = 0
            return 0
        
        reachable = set()
        for v in adj[u]:
            reachable.add(calc_grundy(v))
        
        grundy[u] = mex(reachable)
        return grundy[u]
    
    for i in range(n):
        calc_grundy(i)
    
    # Non-zero Grundy = winning position
    return [g > 0 for g in grundy]


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

