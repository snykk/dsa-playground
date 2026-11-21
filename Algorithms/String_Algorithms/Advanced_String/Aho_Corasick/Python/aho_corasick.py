"""Aho-Corasick multi-pattern string-matching automaton.

Phases:
  1. Build a trie from the patterns.
  2. Compute BFS-order failure links + output links.
  3. Scan the text: O(n + z) where z is total matches.

`search` returns a list of (end_index, pattern) pairs, one for every
occurrence of every pattern.
"""

from collections import deque
from typing import Dict, List, Optional, Tuple


class _Node:
    __slots__ = ("children", "fail", "output", "patterns")

    def __init__(self) -> None:
        self.children: Dict[str, "_Node"] = {}
        self.fail: Optional["_Node"] = None
        self.output: Optional["_Node"] = None
        self.patterns: List[str] = []


class AhoCorasick:
    """Aho-Corasick automaton supporting multi-pattern search in O(n + m + z)."""

    def __init__(self, patterns: List[str]) -> None:
        self.root = _Node()
        for pattern in patterns:
            if pattern:
                self._insert(pattern)
        self._build_failure_links()

    def _insert(self, pattern: str) -> None:
        node = self.root
        for char in pattern:
            if char not in node.children:
                node.children[char] = _Node()
            node = node.children[char]
        node.patterns.append(pattern)

    def _build_failure_links(self) -> None:
        queue: deque = deque()
        # Depth-1 nodes fail to root.
        for child in self.root.children.values():
            child.fail = self.root
            queue.append(child)

        while queue:
            current = queue.popleft()
            for char, next_node in current.children.items():
                # Walk up the failure chain until we find 'char' or hit root.
                fail_candidate = current.fail
                while fail_candidate is not None and char not in fail_candidate.children:
                    fail_candidate = fail_candidate.fail
                next_node.fail = (
                    fail_candidate.children[char]
                    if fail_candidate and char in fail_candidate.children
                    and fail_candidate.children[char] is not next_node
                    else self.root
                )
                # Build output link: point to nearest failure ancestor that matches.
                next_node.output = (
                    next_node.fail
                    if next_node.fail.patterns
                    else next_node.fail.output
                )
                queue.append(next_node)

    def search(self, text: str) -> List[Tuple[int, str]]:
        """Return [(end_index, pattern), ...] for every match in `text`."""
        matches: List[Tuple[int, str]] = []
        node = self.root
        for i, char in enumerate(text):
            while node is not self.root and char not in node.children:
                node = node.fail
            if char in node.children:
                node = node.children[char]
            # Report patterns ending at this node.
            for pattern in node.patterns:
                matches.append((i, pattern))
            # Walk output links for suffix-matches.
            out = node.output
            while out is not None:
                for pattern in out.patterns:
                    matches.append((i, pattern))
                out = out.output
        return matches


if __name__ == "__main__":
    ac = AhoCorasick(["he", "she", "his", "hers"])
    print(ac.search("ushers"))
