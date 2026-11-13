"""Tests for game_theory.py, checked against brute-force game-tree search."""

import itertools
import unittest
from functools import lru_cache

from game_theory import (
    analyze_game_graph,
    can_win,
    combined_grundy,
    fibonacci_nim_winner,
    game_graph_outcomes,
    mex,
    misere_nim_winner,
    nim_winner,
    nim_winning_move,
    staircase_nim,
    stone_game_dp,
    subtraction_grundy,
    wythoff_cold_positions,
    wythoff_winner,
    zeckendorf,
)


# ---- brute-force solvers (plain game-tree search, no theory) ----

@lru_cache(maxsize=None)
def brute_nim(piles, misere):
    """True if the player to move wins. piles is a sorted tuple."""
    if sum(piles) == 0:
        # the previous player took the last object
        return misere
    for i, p in enumerate(piles):
        for take in range(1, p + 1):
            nxt = tuple(sorted(piles[:i] + (p - take,) + piles[i + 1:]))
            if not brute_nim(nxt, misere):
                return True
    return False


@lru_cache(maxsize=None)
def brute_wythoff(a, b):
    if a == 0 and b == 0:
        return False
    moves = [(a - t, b) for t in range(1, a + 1)]
    moves += [(a, b - t) for t in range(1, b + 1)]
    moves += [(a - t, b - t) for t in range(1, min(a, b) + 1)]
    return any(not brute_wythoff(x, y) for x, y in moves)


@lru_cache(maxsize=None)
def brute_staircase(stairs):
    moves = []
    for i in range(1, len(stairs)):
        for t in range(1, stairs[i] + 1):
            s = list(stairs)
            s[i] -= t
            s[i - 1] += t
            moves.append(tuple(s))
    return any(not brute_staircase(m) for m in moves)


@lru_cache(maxsize=None)
def brute_fib_nim(n, max_take):
    """n stones left, the mover may take 1..max_take; taking the last stone wins."""
    if n == 0:
        return False
    for t in range(1, min(n, max_take) + 1):
        if not brute_fib_nim(n - t, 2 * t):
            return True
    return False


def brute_sum_game(positions, moves):
    """Disjoint sum of subtraction games, brute force over the joint state."""
    @lru_cache(maxsize=None)
    def win(state):
        for i, s in enumerate(state):
            for m in moves:
                if s >= m:
                    nxt = state[:i] + (s - m,) + state[i + 1:]
                    if not win(nxt):
                        return True
        return False
    return win(tuple(positions))


class TestNim(unittest.TestCase):
    def test_normal_nim_matches_brute_force(self):
        for count in range(0, 4):
            for piles in itertools.product(range(5), repeat=count):
                self.assertEqual(nim_winner(list(piles)), brute_nim(tuple(sorted(piles)), False), piles)

    def test_winning_move_reaches_a_losing_position(self):
        for count in range(1, 4):
            for piles in itertools.product(range(6), repeat=count):
                i, take = nim_winning_move(list(piles))
                if brute_nim(tuple(sorted(piles)), False):
                    self.assertTrue(0 <= i < count and 1 <= take <= piles[i], piles)
                    nxt = list(piles)
                    nxt[i] -= take
                    self.assertFalse(brute_nim(tuple(sorted(nxt)), False), (piles, i, take))
                else:
                    self.assertEqual((i, take), (-1, -1))

    def test_misere_nim_matches_brute_force(self):
        for count in range(0, 5):
            for piles in itertools.product(range(4), repeat=count):
                self.assertEqual(
                    misere_nim_winner(list(piles)), brute_nim(tuple(sorted(piles)), True), piles
                )

    def test_misere_nim_regressions(self):
        self.assertFalse(misere_nim_winner([1]))      # must take the last object and loses
        self.assertFalse(misere_nim_winner([0, 1]))   # an empty pile must not count
        self.assertFalse(misere_nim_winner([0, 1, 0]))
        self.assertTrue(misere_nim_winner([0]))       # no move: the opponent took the last object
        self.assertTrue(misere_nim_winner([1, 1]))
        self.assertFalse(misere_nim_winner([1, 1, 1]))
        self.assertTrue(misere_nim_winner([1, 2]))


class TestSpragueGrundy(unittest.TestCase):
    def test_mex(self):
        self.assertEqual(mex(set()), 0)
        self.assertEqual(mex({0, 1, 3}), 2)

    def test_subtraction_grundy_against_win_loss(self):
        for moves in ([1, 2, 3], [1, 3, 4], [2, 5], [1]):
            g = subtraction_grundy(30, moves)
            for n in range(31):
                self.assertEqual(g[n] > 0, brute_sum_game((n,), tuple(moves)), (moves, n))

    def test_grundy_of_a_sum_matches_brute_force(self):
        moves = [1, 3, 4]
        g = subtraction_grundy(12, moves)
        for a in range(13):
            for b in range(13):
                state = [a, b]
                self.assertEqual(
                    combined_grundy(state, [g, g]) != 0,
                    brute_sum_game((a, b), tuple(moves)),
                    state,
                )

    def test_subtraction_1_2_3_is_periodic(self):
        self.assertEqual(subtraction_grundy(10, [1, 2, 3]), [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2])


class TestOtherGames(unittest.TestCase):
    def test_wythoff(self):
        for a in range(0, 30):
            for b in range(0, 30):
                self.assertEqual(wythoff_winner(a, b), brute_wythoff(a, b), (a, b))
        cold = wythoff_cold_positions(10)
        self.assertEqual(cold[:4], [(0, 0), (1, 2), (3, 5), (4, 7)])
        for a, b in cold:
            self.assertFalse(brute_wythoff(a, b))

    def test_staircase_nim(self):
        for length in range(2, 5):
            for stairs in itertools.product(range(4), repeat=length):
                if sum(stairs[1:]) > 6:
                    continue
                self.assertEqual(staircase_nim(list(stairs)), brute_staircase(tuple(stairs)), stairs)

    def test_stone_game(self):
        for k in range(1, 6):
            for n in range(0, 30):
                self.assertEqual(stone_game_dp(n, k), brute_fib_nim_like(n, k), (n, k))

    def test_fibonacci_nim(self):
        # first move: 1..n-1 stones, then up to twice the previous move
        for n in range(2, 60):
            brute = any(not brute_fib_nim(n - t, 2 * t) for t in range(1, n))
            self.assertEqual(fibonacci_nim_winner(n), brute, n)

    def test_zeckendorf(self):
        fibs = {1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144}
        for n in range(0, 150):
            z = zeckendorf(n)
            self.assertEqual(sum(z), n)
            self.assertTrue(all(x in fibs for x in z))
            for x, y in zip(z, z[1:]):
                self.assertGreater(x, y)
            # no two consecutive Fibonacci numbers
            idx = sorted(sorted(fibs).index(x) for x in z)
            self.assertTrue(all(b - a >= 2 for a, b in zip(idx, idx[1:])), (n, z))
        self.assertEqual(zeckendorf(13), [13])


def brute_fib_nim_like(n, k):
    """Take 1..k stones, last to take wins (plain DP)."""
    win = [False] * (n + 1)
    for i in range(1, n + 1):
        win[i] = any(not win[i - t] for t in range(1, min(k, i) + 1))
    return win[n]


class TestCanWin(unittest.TestCase):
    def test_generic_dp(self):
        take_one = lambda s: [s - 1] if s >= 1 else []
        take_one_or_two = lambda s: [s - t for t in (1, 2) if s >= t]
        self.assertTrue(can_win(3, take_one))
        self.assertFalse(can_win(3, take_one_or_two))

    def test_no_memo_leaks_between_games(self):
        take_one = lambda s: [s - 1] if s >= 1 else []
        take_one_or_two = lambda s: [s - t for t in (1, 2) if s >= t]
        self.assertTrue(can_win(3, take_one))
        self.assertFalse(can_win(3, take_one_or_two))
        self.assertTrue(can_win(3, take_one))


class TestGameGraph(unittest.TestCase):
    def test_dag_matches_grundy(self):
        edges = [(0, 1), (1, 2), (0, 2), (3, 2)]
        self.assertEqual(analyze_game_graph(4, edges), [True, True, False, True])
        self.assertEqual(game_graph_outcomes(4, edges), ["win", "win", "lose", "win"])

    def test_two_cycle_is_a_draw_not_a_crash(self):
        self.assertEqual(game_graph_outcomes(2, [(0, 1), (1, 0)]), ["draw", "draw"])
        self.assertEqual(analyze_game_graph(2, [(0, 1), (1, 0)]), [False, False])

    def test_cycle_with_an_exit(self):
        # 0 <-> 1, and 1 -> 2 (2 has no move): moving 1 -> 2 wins for the player at 1
        edges = [(0, 1), (1, 0), (1, 2)]
        self.assertEqual(game_graph_outcomes(3, edges), ["lose", "win", "lose"])

    def test_self_loop_is_a_draw(self):
        self.assertEqual(game_graph_outcomes(1, [(0, 0)]), ["draw"])

    def test_random_graphs_against_value_iteration(self):
        import random
        rng = random.Random(4)
        for _ in range(300):
            n = rng.randint(1, 7)
            edges = [(rng.randrange(n), rng.randrange(n)) for _ in range(rng.randint(0, 12))]
            got = game_graph_outcomes(n, edges)
            # reference: iterate "win if some move reaches lose; lose if all moves reach win"
            state = [None] * n
            changed = True
            while changed:
                changed = False
                for u in range(n):
                    if state[u] is not None:
                        continue
                    outs = [v for a, v in edges if a == u]
                    if any(state[v] == "lose" for v in outs):
                        state[u] = "win"
                        changed = True
                    elif all(state[v] == "win" for v in outs):
                        state[u] = "lose"
                        changed = True
            self.assertEqual(got, [s or "draw" for s in state], edges)


if __name__ == "__main__":
    unittest.main()
