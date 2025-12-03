package main

import "strings"

type SuffixTreeNode struct {
	children    map[rune]*SuffixTreeNode
	suffixLink  *SuffixTreeNode
	start       int
	end         *int
	suffixIndex int
}

type SuffixTree struct {
	text      string
	n         int
	root      *SuffixTreeNode
	globalEnd int
}

func NewSuffixTree(text string) *SuffixTree {
	if !strings.HasSuffix(text, "$") {
		text += "$"
	}
	n := len(text)
	
	root := &SuffixTreeNode{
		children: make(map[rune]*SuffixTreeNode),
		start:    -1,
		end:      nil,
	}
	
	st := &SuffixTree{
		text: text,
		n:    n,
		root: root,
	}
	
	for i := 0; i < n; i++ {
		st.insertSuffix(i)
	}
	
	return st
}

func (st *SuffixTree) insertSuffix(startIdx int) {
	node := st.root
	i := startIdx
	
	for i < st.n {
		char := rune(st.text[i])
		
		if node.children[char] == nil {
			end := st.n - 1
			leaf := &SuffixTreeNode{
				children:    make(map[rune]*SuffixTreeNode),
				start:       i,
				end:         &end,
				suffixIndex: startIdx,
			}
			node.children[char] = leaf
			return
		}
		
		child := node.children[char]
		edgeStart := child.start
		edgeEnd := *child.end
		edgeLength := edgeEnd - edgeStart + 1
		
		j := 0
		for j < edgeLength && i+j < st.n {
			if st.text[edgeStart+j] != st.text[i+j] {
				return
			}
			j++
		}
		
		if i+j < st.n {
			i += edgeLength
			node = child
		} else {
			return
		}
	}
}

func (st *SuffixTree) Search(pattern string) []int {
	node := st.root
	i := 0
	m := len(pattern)
	
	for i < m {
		char := rune(pattern[i])
		
		if node.children[char] == nil {
			return []int{}
		}
		
		child := node.children[char]
		edgeStart := child.start
		edgeEnd := *child.end
		
		j := 0
		for j < (edgeEnd-edgeStart+1) && i+j < m {
			if st.text[edgeStart+j] != pattern[i+j] {
				return []int{}
			}
			j++
		}
		
		i += j
		
		if i >= m {
			if child.suffixIndex != -1 {
				return []int{child.suffixIndex}
			}
			return []int{}
		}
		
		node = child
	}
	
	return []int{}
}

func main() {
	st := NewSuffixTree("banana")
	result := st.Search("ana")
	println("Found at positions:", len(result))
}

