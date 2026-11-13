package main

import (
	"fmt"
	"sort"
	"strings"
)

// terminator is a byte that must not occur in the text. With a unique last byte no
// suffix is a prefix of another suffix, so every suffix ends at its own leaf.
const terminator = byte(0)

type SuffixTreeNode struct {
	children    map[byte]*SuffixTreeNode
	start       int // first index of the edge label (in the text)
	end         int // last index of the edge label (inclusive)
	suffixIndex int // start of the suffix when this node is a leaf, otherwise -1
}

// SuffixTree indexes every suffix of a string. All indices and the pattern are
// byte offsets, so multi-byte UTF-8 characters count as several positions.
type SuffixTree struct {
	original string
	text     string // original + a NUL terminator
	n        int
	root     *SuffixTreeNode
}

func newNode(start, end int) *SuffixTreeNode {
	return &SuffixTreeNode{
		children:    make(map[byte]*SuffixTreeNode),
		start:       start,
		end:         end,
		suffixIndex: -1,
	}
}

// NewSuffixTree builds the tree by inserting the suffixes one by one: O(n^2) worst
// case. It panics if text contains a NUL byte.
func NewSuffixTree(text string) *SuffixTree {
	if strings.IndexByte(text, terminator) >= 0 {
		panic("text must not contain the NUL character")
	}
	full := text + string(terminator)
	st := &SuffixTree{
		original: text,
		text:     full,
		n:        len(full),
		root:     newNode(-1, -1),
	}
	for i := 0; i < st.n; i++ {
		st.insertSuffix(i)
	}
	return st
}

func (st *SuffixTree) insertSuffix(startIdx int) {
	node := st.root
	i := startIdx

	for i < st.n {
		ch := st.text[i]
		child := node.children[ch]

		if child == nil {
			leaf := newNode(i, st.n-1)
			leaf.suffixIndex = startIdx
			node.children[ch] = leaf
			return
		}

		edgeLength := child.end - child.start + 1
		j := 0
		for j < edgeLength && i+j < st.n && st.text[child.start+j] == st.text[i+j] {
			j++
		}

		if j < edgeLength {
			// Mismatch inside the edge: split it at offset j.
			internal := newNode(child.start, child.start+j-1)
			child.start += j
			internal.children[st.text[child.start]] = child
			leaf := newNode(i+j, st.n-1)
			leaf.suffixIndex = startIdx
			internal.children[st.text[i+j]] = leaf
			node.children[ch] = internal
			return
		}

		// The whole edge matched: continue below it. The unique terminator guarantees
		// that the suffix cannot end here, so there is always more text.
		i += edgeLength
		node = child
	}
}

// collectLeaves returns the sorted suffix indices of every leaf below from, using an
// explicit stack so that a very deep tree cannot overflow it.
func collectLeaves(from *SuffixTreeNode) []int {
	result := []int{}
	stack := []*SuffixTreeNode{from}
	for len(stack) > 0 {
		current := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if current.suffixIndex != -1 {
			result = append(result, current.suffixIndex)
		}
		for _, child := range current.children {
			stack = append(stack, child)
		}
	}
	sort.Ints(result)
	return result
}

// Search returns the sorted start indices of every occurrence of pattern. An empty
// pattern, or one containing a NUL byte, returns an empty slice.
func (st *SuffixTree) Search(pattern string) []int {
	m := len(pattern)
	if m == 0 || strings.IndexByte(pattern, terminator) >= 0 {
		return []int{}
	}

	node := st.root
	i := 0
	for i < m {
		child := node.children[pattern[i]]
		if child == nil {
			return []int{}
		}

		edgeLength := child.end - child.start + 1
		j := 0
		for j < edgeLength && i+j < m {
			if st.text[child.start+j] != pattern[i+j] {
				return []int{}
			}
			j++
		}

		i += j
		if i >= m {
			return collectLeaves(child)
		}
		node = child
	}
	return []int{}
}

// GetAllSuffixes returns every non-empty suffix of the original text, sorted.
func (st *SuffixTree) GetAllSuffixes() []string {
	suffixes := []string{}
	for _, idx := range collectLeaves(st.root) {
		if idx < len(st.original) {
			suffixes = append(suffixes, st.original[idx:])
		}
	}
	sort.Strings(suffixes)
	return suffixes
}

func main() {
	st := NewSuffixTree("banana")
	fmt.Println("ana found at:", st.Search("ana"))
	fmt.Println("suffixes:", st.GetAllSuffixes())
}
