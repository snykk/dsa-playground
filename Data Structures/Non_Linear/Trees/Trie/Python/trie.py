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
        
        Args:
            word: The word to delete
            
        Returns:
            True if word was deleted, False if word doesn't exist
        """
        def _delete_recursive(node, word, index):
            if index == len(word):
                if not node.is_end_of_word:
                    return False
                node.is_end_of_word = False
                return len(node.children) == 0
            
            char = word[index]
            if char not in node.children:
                return False
            
            child_node = node.children[char]
            should_delete_child = _delete_recursive(child_node, word, index + 1)
            
            if should_delete_child:
                del node.children[char]
                return len(node.children) == 0 and not node.is_end_of_word
            
            return False
        
        return _delete_recursive(self.root, word, 0)

    def get_all_words(self):
        """Get all words stored in the trie.
        
        Returns:
            List of all words
        """
        words = []
        
        def _traverse(node, prefix):
            if node.is_end_of_word:
                words.append(prefix)
            for char, child_node in node.children.items():
                _traverse(child_node, prefix + char)
        
        _traverse(self.root, "")
        return words

    def count_words(self):
        """Count the total number of words in the trie.
        
        Returns:
            Number of words
        """
        count = 0
        
        def _count_recursive(node):
            nonlocal count
            if node.is_end_of_word:
                count += 1
            for child_node in node.children.values():
                _count_recursive(child_node)
        
        _count_recursive(self.root)
        return count

    def is_empty(self):
        """Check if the trie is empty.
        
        Returns:
            True if empty, False otherwise
        """
        return len(self.root.children) == 0

