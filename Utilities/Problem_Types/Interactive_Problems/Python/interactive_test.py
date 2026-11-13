"""Tests for interactive.py using an in-process fake judge.

The judge replaces stdout and input(): every complete line the solution
prints is handed to a handler, which returns the text the solution reads next.
"""

import builtins
import random
import sys
import unittest
from unittest import mock

import interactive


class FakeJudge:
    def __init__(self, handler):
        self.handler = handler      # handler(line) -> response text or None (for "!" lines)
        self.pending = []
        self.log = []               # every line the solution printed
        self.buffer = ""
        self.flushed = True

    # --- stdout replacement ---
    def write(self, text):
        self.buffer += text
        self.flushed = False
        while "\n" in self.buffer:
            line, self.buffer = self.buffer.split("\n", 1)
            self.log.append(line)
            reply = self.handler(line)
            if reply is not None:
                self.pending.append(str(reply))
        return len(text)

    def flush(self):
        self.flushed = True

    # --- input() replacement ---
    def input(self, prompt=""):
        # a real judge sees nothing until the solution flushes
        assert self.flushed, "the solution read a response before flushing its query"
        if not self.pending:
            raise AssertionError("the solution waited for a response that never comes")
        return self.pending.pop(0)

    def run(self, fn, *args):
        with mock.patch.object(sys, "stdout", self), mock.patch.object(builtins, "input", self.input):
            return fn(*args)

    def queries(self):
        return [line for line in self.log if line.startswith("?")]

    def answers(self):
        return [line for line in self.log if line.startswith("!")]


class TestBasicIO(unittest.TestCase):
    def test_query_and_answer(self):
        judge = FakeJudge(lambda line: 42 if line == "? 7" else None)
        self.assertEqual(judge.run(interactive.query, 7), 42)
        judge.run(interactive.answer, 5)
        self.assertEqual(judge.log, ["? 7", "! 5"])

    def test_multi_argument_forms(self):
        judge = FakeJudge(lambda line: 1 if line.startswith("?") else None)
        self.assertEqual(judge.run(interactive.query_multi, 3, 4), 1)
        judge.run(interactive.answer_multi, 1, 2, 3)
        self.assertEqual(judge.log, ["? 3 4", "! 1 2 3"])

    def test_check_response_exits_on_minus_one(self):
        judge = FakeJudge(lambda line: None)
        judge.pending.append("-1")
        with self.assertRaises(SystemExit):
            judge.run(interactive.check_response)
        judge.pending.append("1")
        self.assertTrue(judge.run(interactive.check_response))


class TestGuessNumber(unittest.TestCase):
    def test_every_secret_is_found_within_the_budget(self):
        for n in range(1, 70):
            budget = n.bit_length() + 1
            for secret in range(1, n + 1):
                state = {"solved": False}

                def handler(line, secret=secret, state=state):
                    kind, value = line.split()
                    value = int(value)
                    if kind == "!":
                        state["solved"] = state["solved"] or value == secret
                        return None
                    if value == secret:
                        state["solved"] = True
                        return "correct"
                    return "higher" if secret > value else "lower"

                judge = FakeJudge(handler)
                judge.run(interactive.guess_number, n)
                self.assertTrue(state["solved"], (n, secret))
                self.assertLessEqual(len(judge.queries()), budget, (n, secret))

    def test_binary_search_answer(self):
        for n in range(1, 40):
            for k in range(1, n + 1):
                self.assertEqual(interactive.binary_search_answer(n, lambda m, k=k: m <= k), k)


class TestComparisons(unittest.TestCase):
    @staticmethod
    def comparer(values):
        def handler(line):
            if line.startswith("!"):
                return None
            _, i, j = line.split()
            a, b = values[int(i) - 1], values[int(j) - 1]
            return (a > b) - (a < b)
        return handler

    def test_find_maximum_and_tournament(self):
        rng = random.Random(8)
        for _ in range(100):
            n = rng.randint(1, 20)
            values = rng.sample(range(100), n)
            best = values.index(max(values)) + 1
            judge = FakeJudge(self.comparer(values))
            self.assertEqual(judge.run(interactive.find_maximum, n), best)
            self.assertEqual(len(judge.queries()), n - 1)
            self.assertEqual(judge.answers(), ["! %d" % best])
            judge = FakeJudge(self.comparer(values))
            self.assertEqual(judge.run(interactive.tournament, n), best)
            self.assertEqual(len(judge.queries()), n - 1)
            self.assertEqual(judge.answers(), ["! %d" % best])


class TestSubsetsAndGraphs(unittest.TestCase):
    def test_guess_subset(self):
        hidden = {2, 5, 6}

        def handler(line):
            if line.startswith("!"):
                return None
            parts = line.split()[1:]
            return 1 if any(int(x) in hidden for x in parts[1:]) else 0

        judge = FakeJudge(handler)
        self.assertEqual(judge.run(interactive.guess_subset, 7), [2, 5, 6])
        self.assertEqual(judge.answers(), ["! 3 2 5 6"])

    def test_binary_subset_search_finds_the_number(self):
        for n in range(0, 40):
            for hidden in range(0, n + 1):
                def handler(line, hidden=hidden):
                    if line.startswith("!"):
                        return None
                    return 1 if hidden & int(line.split()[1]) else 0
                judge = FakeJudge(handler)
                self.assertEqual(judge.run(interactive.binary_subset_search, n), hidden, (n, hidden))
                self.assertLessEqual(len(judge.queries()), max(1, n.bit_length()))
                self.assertEqual(judge.answers(), ["! %d" % hidden])

    def test_explore_graph(self):
        graph = {1: [2, 3], 2: [1, 4], 3: [1], 4: [2], 5: []}  # node 5 is unreachable

        def handler(line):
            u = int(line.split()[1])
            return "%d %s" % (len(graph[u]), " ".join(map(str, graph[u]))) if graph[u] else "0"

        judge = FakeJudge(handler)
        adj = judge.run(interactive.explore_graph, 5)
        self.assertEqual(adj[1:5], [[2, 3], [1, 4], [1], [2]])
        self.assertEqual(adj[5], [])
        self.assertEqual(len(judge.queries()), 4)  # each reachable node is asked exactly once


if __name__ == "__main__":
    unittest.main()
