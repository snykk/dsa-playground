package main

type TrieNode struct {
	children      map[rune]*TrieNode
	isEndOfWord   bool
}

type Trie struct {
	root *TrieNode
}

func NewTrie() *Trie {
	return &Trie{root: &TrieNode{children: make(map[rune]*TrieNode)}}
}

func (t *Trie) Insert(word string) {
	node := t.root
	for _, char := range word {
		if node.children[char] == nil {
			node.children[char] = &TrieNode{children: make(map[rune]*TrieNode)}
		}
		node = node.children[char]
	}
	node.isEndOfWord = true
}

func (t *Trie) Search(word string) bool {
	node := t.root
	for _, char := range word {
		if node.children[char] == nil {
			return false
		}
		node = node.children[char]
	}
	return node.isEndOfWord
}

func (t *Trie) StartsWith(prefix string) bool {
	node := t.root
	for _, char := range prefix {
		if node.children[char] == nil {
			return false
		}
		node = node.children[char]
	}
	return true
}

func (t *Trie) Delete(word string) bool {
	return t.deleteRecursive(t.root, word, 0)
}

func (t *Trie) deleteRecursive(node *TrieNode, word string, index int) bool {
	if index == len(word) {
		if !node.isEndOfWord {
			return false
		}
		node.isEndOfWord = false
		return len(node.children) == 0
	}

	char := rune(word[index])
	child, exists := node.children[char]
	if !exists {
		return false
	}

	shouldDelete := t.deleteRecursive(child, word, index+1)
	if shouldDelete {
		delete(node.children, char)
		return len(node.children) == 0 && !node.isEndOfWord
	}

	return false
}

func (t *Trie) GetAllWords() []string {
	words := []string{}
	t.traverse(t.root, "", &words)
	return words
}

func (t *Trie) traverse(node *TrieNode, prefix string, words *[]string) {
	if node.isEndOfWord {
		*words = append(*words, prefix)
	}
	for char, child := range node.children {
		t.traverse(child, prefix+string(char), words)
	}
}

func (t *Trie) CountWords() int {
	return t.countRecursive(t.root)
}

func (t *Trie) countRecursive(node *TrieNode) int {
	count := 0
	if node.isEndOfWord {
		count++
	}
	for _, child := range node.children {
		count += t.countRecursive(child)
	}
	return count
}

func (t *Trie) IsEmpty() bool {
	return len(t.root.children) == 0
}

func main() {
	trie := NewTrie()
	trie.Insert("apple")
	trie.Insert("app")
	println("Search apple:", trie.Search("apple"))
	println("StartsWith app:", trie.StartsWith("app"))
}

