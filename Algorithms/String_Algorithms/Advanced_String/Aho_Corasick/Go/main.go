// Package main implements Aho-Corasick multi-pattern string matching.
//
// Given k patterns and a text of length n, it reports every occurrence
// of every pattern in O(n + m + z) where m is the total pattern length
// and z is the total number of matches.
package main

import "fmt"

type node struct {
	children map[byte]int
	fail     int
	output   int // -1 if none
	patterns []int
}

// AhoCorasick is an immutable multi-pattern matcher built from a pattern set.
type AhoCorasick struct {
	nodes    []node
	patterns []string
}

// New builds an Aho-Corasick automaton from the given patterns.
// Empty patterns are skipped.
func New(patterns []string) *AhoCorasick {
	ac := &AhoCorasick{patterns: patterns}
	ac.nodes = append(ac.nodes, newNode()) // root
	for id, p := range patterns {
		if p != "" {
			ac.insert(p, id)
		}
	}
	ac.buildFailureLinks()
	return ac
}

func newNode() node {
	return node{children: make(map[byte]int), output: -1}
}

func (ac *AhoCorasick) insert(pattern string, id int) {
	current := 0
	for i := 0; i < len(pattern); i++ {
		c := pattern[i]
		if _, ok := ac.nodes[current].children[c]; !ok {
			ac.nodes = append(ac.nodes, newNode())
			ac.nodes[current].children[c] = len(ac.nodes) - 1
		}
		current = ac.nodes[current].children[c]
	}
	ac.nodes[current].patterns = append(ac.nodes[current].patterns, id)
}

func (ac *AhoCorasick) buildFailureLinks() {
	var queue []int
	for _, child := range ac.nodes[0].children {
		ac.nodes[child].fail = 0
		queue = append(queue, child)
	}
	for len(queue) > 0 {
		u := queue[0]
		queue = queue[1:]
		for c, v := range ac.nodes[u].children {
			f := ac.nodes[u].fail
			for f != 0 {
				if _, ok := ac.nodes[f].children[c]; ok {
					break
				}
				f = ac.nodes[f].fail
			}
			if next, ok := ac.nodes[f].children[c]; ok && next != v {
				ac.nodes[v].fail = next
			} else {
				ac.nodes[v].fail = 0
			}
			// Output link: nearest failure ancestor with patterns.
			failNode := ac.nodes[v].fail
			if len(ac.nodes[failNode].patterns) > 0 {
				ac.nodes[v].output = failNode
			} else {
				ac.nodes[v].output = ac.nodes[failNode].output
			}
			queue = append(queue, v)
		}
	}
}

// Match reports the end-index within `text` and the pattern-ID of a match.
type Match struct {
	EndIndex  int
	PatternID int
}

// Search returns all matches (multi-occurrence) in the given text.
func (ac *AhoCorasick) Search(text string) []Match {
	var matches []Match
	current := 0
	for i := 0; i < len(text); i++ {
		c := text[i]
		for current != 0 {
			if _, ok := ac.nodes[current].children[c]; ok {
				break
			}
			current = ac.nodes[current].fail
		}
		if next, ok := ac.nodes[current].children[c]; ok {
			current = next
		}
		for _, pid := range ac.nodes[current].patterns {
			matches = append(matches, Match{EndIndex: i, PatternID: pid})
		}
		out := ac.nodes[current].output
		for out != -1 {
			for _, pid := range ac.nodes[out].patterns {
				matches = append(matches, Match{EndIndex: i, PatternID: pid})
			}
			out = ac.nodes[out].output
		}
	}
	return matches
}

// Pattern returns the pattern string for a given ID.
func (ac *AhoCorasick) Pattern(id int) string {
	return ac.patterns[id]
}

func main() {
	ac := New([]string{"he", "she", "his", "hers"})
	for _, m := range ac.Search("ushers") {
		fmt.Printf("match %q at end %d\n", ac.Pattern(m.PatternID), m.EndIndex)
	}
}
