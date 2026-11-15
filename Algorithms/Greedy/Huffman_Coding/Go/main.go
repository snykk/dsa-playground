package main

import (
	"strings"
	"unicode/utf8"
)

// HuffmanNode is a node in the Huffman tree. A leaf holds a symbol; an
// internal node has two children.
type HuffmanNode struct {
	Char        rune
	Freq        int
	Left, Right *HuffmanNode
}

func (n *HuffmanNode) isLeaf() bool { return n.Left == nil && n.Right == nil }

// nodeHeap is Python's heapq (heappush, heappop) comparing frequencies only,
// so that equal frequencies pop in the same order as in huffman_coding.py and
// the code table is identical. container/heap breaks those ties differently.
type nodeHeap []*HuffmanNode

// siftUp is heapq._siftdown: move h[pos] up while it is lighter than its parent.
func (h nodeHeap) siftUp(start, pos int) {
	item := h[pos]
	for pos > start {
		parent := (pos - 1) / 2
		if item.Freq >= h[parent].Freq {
			break
		}
		h[pos] = h[parent]
		pos = parent
	}
	h[pos] = item
}

// siftDown is heapq._siftup: move the lighter child up until pos is a leaf
// (the right child on a tie), put the item there, then sift it back up.
func (h nodeHeap) siftDown(pos int) {
	start, item := pos, h[pos]
	for child := 2*pos + 1; child < len(h); child = 2*pos + 1 {
		if right := child + 1; right < len(h) && h[right].Freq <= h[child].Freq {
			child = right
		}
		h[pos] = h[child]
		pos = child
	}
	h[pos] = item
	h.siftUp(start, pos)
}

func (h *nodeHeap) push(node *HuffmanNode) {
	*h = append(*h, node)
	h.siftUp(0, len(*h)-1)
}

func (h *nodeHeap) pop() *HuffmanNode {
	last := (*h)[len(*h)-1]
	*h = (*h)[:len(*h)-1]
	if len(*h) == 0 {
		return last
	}
	top := (*h)[0]
	(*h)[0] = last
	h.siftDown(0)
	return top
}

// BuildHuffmanTree returns the root of the Huffman tree of text, or nil for
// empty text. Leaves enter the heap in order of first occurrence, as with
// Python's Counter.
func BuildHuffmanTree(text string) *HuffmanNode {
	if text == "" {
		return nil
	}

	freq := map[rune]int{}
	var firstSeen []rune
	for _, char := range text {
		if freq[char] == 0 {
			firstSeen = append(firstSeen, char)
		}
		freq[char]++
	}

	var heap nodeHeap
	for _, char := range firstSeen {
		heap.push(&HuffmanNode{Char: char, Freq: freq[char]})
	}

	// Merge the two lightest nodes: the first popped is the left child.
	for len(heap) > 1 {
		left := heap.pop()
		right := heap.pop()
		heap.push(&HuffmanNode{Freq: left.Freq + right.Freq, Left: left, Right: right})
	}

	return heap[0]
}

// BuildCodes returns the code table of a Huffman tree: left adds "0", right
// adds "1". A single-symbol tree gets the code "0".
func BuildCodes(root *HuffmanNode) map[rune]string {
	codes := map[rune]string{}
	var walk func(node *HuffmanNode, code string)
	walk = func(node *HuffmanNode, code string) {
		if node == nil {
			return
		}
		if node.isLeaf() {
			if code == "" {
				code = "0"
			}
			codes[node.Char] = code
			return
		}
		walk(node.Left, code+"0")
		walk(node.Right, code+"1")
	}
	walk(root, "")
	return codes
}

// HuffmanEncode returns the encoded text (a string of '0' and '1', one
// character per bit), the code table and the tree; for empty text it returns
// "", an empty table and nil.
func HuffmanEncode(text string) (string, map[rune]string, *HuffmanNode) {
	if text == "" {
		return "", map[rune]string{}, nil
	}

	tree := BuildHuffmanTree(text)
	codes := BuildCodes(tree)

	var encoded strings.Builder
	for _, char := range text {
		encoded.WriteString(codes[char])
	}
	return encoded.String(), codes, tree
}

// HuffmanDecode decodes a string of '0' and '1' with the tree that encoded it;
// it returns "" for a nil tree.
func HuffmanDecode(encoded string, tree *HuffmanNode) string {
	if tree == nil {
		return ""
	}
	// Single symbol: the tree is a leaf and every bit stands for it.
	if tree.isLeaf() {
		return strings.Repeat(string(tree.Char), utf8.RuneCountInString(encoded))
	}

	var decoded strings.Builder
	current := tree
	for _, bit := range encoded {
		if current == nil {
			break
		}
		if bit == '0' {
			current = current.Left
		} else {
			current = current.Right
		}
		if current != nil && current.isLeaf() {
			decoded.WriteRune(current.Char)
			current = tree // Reset to root
		}
	}
	return decoded.String()
}

// CalculateCompressionRatio returns the ratio of encoded bits to 8 bits per
// character (rune) of original, and the savings in percent; the ratio is 0
// for an empty original. The code table is not used, as in Python.
func CalculateCompressionRatio(original, encoded string, _ map[rune]string) (ratio, savings float64) {
	originalBits := utf8.RuneCountInString(original) * 8
	encodedBits := utf8.RuneCountInString(encoded)

	if originalBits > 0 {
		ratio = float64(encodedBits) / float64(originalBits)
	}
	savings = (1 - ratio) * 100
	return ratio, savings
}
