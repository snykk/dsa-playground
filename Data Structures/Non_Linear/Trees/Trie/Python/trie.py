class TrieNode:
    """Node class for Trie."""
    def __init__(self):
        self.children = {}  # Dictionary to store children nodes
        self.is_end_of_word = False  # True if node represents end of word

class Trie:
    """Trie (Prefix Tree) implementation.
    
    A Trie is a tree-like data structure used to store strings efficiently.
    It allows fast prefix matching and word search operations.
    """
    
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        """Insert a word into the trie.
        
        Args:
            word: The word to insert
        """
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True

    def search(self, word):
        """Search for a complete word in the trie.
        
        Args:
            word: The word to search for
            
        Returns:
            True if word exists, False otherwise
        """
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end_of_word

    def starts_with(self, prefix):
        """Check if any word in the trie starts with the given prefix.
        
        Args:
            prefix: The prefix to check
            
        Returns:
            True if prefix exists, False otherwise
        """
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True

    def delete(self, word):
        """Delete a word from the trie.
        
        Nodes that no longer lead to any word are removed, walking back up from the
        end of the word; the walk stops at a node that is itself a word or has
        another child.
        
        Args:
            word: The word to delete
            
        Returns:
            True if word was deleted, False if word doesn't exist
        """
        path = []  # (parent, character) pairs from the root down to the word's node
        node = self.root
        for char in word:
            child = node.children.get(char)
            if child is None:
                return False
            path.append((node, char))
            node = child

        if not node.is_end_of_word:
            return False
        node.is_end_of_word = False

        while path and not node.children and not node.is_end_of_word:
            parent, char = path.pop()
            del parent.children[char]
            node = parent
        return True

    def get_all_words(self):
        """Get all words stored in the trie.
        
        Returns:
            List of all words, in depth-first order of insertion
        """
        words = []
        stack = [(self.root, "")]
        while stack:
            node, prefix = stack.pop()
            if node.is_end_of_word:
                words.append(prefix)
            for char, child_node in reversed(list(node.children.items())):
                stack.append((child_node, prefix + char))
        return words

    def count_words(self):
        """Count the total number of words in the trie.
        
        Returns:
            Number of words
        """
        count = 0
        stack = [self.root]
        while stack:
            node = stack.pop()
            if node.is_end_of_word:
                count += 1
            stack.extend(node.children.values())
        return count

    def is_empty(self):
        """Check if the trie is empty.
        
        Returns:
            True if no word is stored (the empty word counts as a word)
        """
        return len(self.root.children) == 0 and not self.root.is_end_of_word

