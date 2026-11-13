class SuffixTreeNode:
    """Node class for Suffix Tree."""
    def __init__(self):
        self.children = {}  # Dictionary: char -> SuffixTreeNode
        self.suffix_link = None  # Suffix link for Ukkonen's algorithm
        self.start = None  # Start index of edge label
        self.end = None  # End index of edge label (None means global_end)
        self.suffix_index = -1  # Index of suffix if leaf node

# A terminator that must not occur in the text: with a unique last character no suffix
# is a prefix of another suffix, so every suffix ends at its own leaf.
TERMINATOR = '\0'


class SuffixTree:
    """Suffix Tree implementation.
    
    A Suffix Tree is a compressed trie containing all suffixes of a given string.
    Searching for a pattern of length m costs O(m + occ), where occ is the number
    of occurrences (the leaves under the matched point are collected).
    Construction inserts the suffixes one by one: O(n^2) worst case.
    """
    
    def __init__(self, text):
        """Initialize Suffix Tree with text.
        
        Args:
            text: The input string. It may contain '$' or any other character
                except the internal terminator '\\0', which raises ValueError.
        """
        if TERMINATOR in text:
            raise ValueError("text must not contain the NUL character")
        self.original = text
        self.text = text + TERMINATOR
        self.n = len(self.text)
        self.root = SuffixTreeNode()
        self.global_end = -1
        self._build_tree()
    
    def _build_tree(self):
        """Build suffix tree using simplified construction."""
        # For simplicity, we'll build by inserting each suffix
        # This is O(n^2) but easier to understand
        # For O(n) construction, use Ukkonen's algorithm
        
        for i in range(self.n):
            self._insert_suffix(i)
    
    def _insert_suffix(self, start_idx):
        """Insert a suffix starting at start_idx."""
        node = self.root
        i = start_idx
        
        while i < self.n:
            char = self.text[i]
            
            if char not in node.children:
                # Create new leaf node
                new_node = SuffixTreeNode()
                new_node.start = i
                new_node.end = self.n - 1
                new_node.suffix_index = start_idx
                node.children[char] = new_node
                return
            
            # Follow existing edge
            child = node.children[char]
            edge_start = child.start
            edge_end = child.end if child.end is not None else self.n - 1
            edge_length = edge_end - edge_start + 1
            
            # Match characters along the edge
            j = 0
            while j < edge_length and i + j < self.n:
                if self.text[edge_start + j] != self.text[i + j]:
                    # Split needed
                    self._split_edge(node, char, edge_start + j, i + j, start_idx)
                    return
                j += 1
            
            # Matched entire edge, continue to next node
            if i + j < self.n:
                i += edge_length
                node = child
            else:
                return
    
    def _split_edge(self, parent, char, split_pos, text_pos, suffix_idx):
        """Split an edge at split_pos."""
        old_child = parent.children[char]
        old_end = old_child.end if old_child.end is not None else self.n - 1
        
        # Create internal node
        internal = SuffixTreeNode()
        internal.start = old_child.start
        internal.end = split_pos - 1
        
        # Update old child
        old_child.start = split_pos
        old_child.end = old_end
        
        # Create new leaf
        new_leaf = SuffixTreeNode()
        new_leaf.start = text_pos
        new_leaf.end = self.n - 1
        new_leaf.suffix_index = suffix_idx
        
        # Reorganize
        parent.children[char] = internal
        internal.children[self.text[split_pos]] = old_child
        internal.children[self.text[text_pos]] = new_leaf
    
    def search(self, pattern):
        """Search for pattern in the suffix tree.
        
        Args:
            pattern: The pattern to search for
            
        Returns:
            List of starting indices where pattern is found
        """
        node = self.root
        i = 0
        n_pattern = len(pattern)

        if TERMINATOR in pattern:
            return []
        
        while i < n_pattern:
            char = pattern[i]
            
            if char not in node.children:
                return []
            
            child = node.children[char]
            edge_start = child.start
            edge_end = child.end if child.end is not None else self.n - 1
            
            # Match along edge
            j = 0
            while j < (edge_end - edge_start + 1) and i + j < n_pattern:
                if self.text[edge_start + j] != pattern[i + j]:
                    return []
                j += 1
            
            i += j
            
            if i >= n_pattern:
                # Pattern matched, collect all leaf indices
                return self._collect_leaf_indices(child)
            
            node = child
        
        return []
    
    def _collect_leaf_indices(self, node):
        """Collect all suffix indices from subtree rooted at node (iterative DFS)."""
        result = []
        stack = [node]
        while stack:
            current = stack.pop()
            if current.suffix_index != -1:
                result.append(current.suffix_index)
            stack.extend(current.children.values())
        return sorted(result)
    
    def get_all_suffixes(self):
        """Get all non-empty suffixes of the original text.
        
        Returns:
            Sorted list of the suffixes (the terminator is not included)
        """
        suffixes = []
        stack = [self.root]
        while stack:
            node = stack.pop()
            if node.suffix_index != -1 and node.suffix_index < len(self.original):
                suffixes.append(self.original[node.suffix_index:])
            stack.extend(node.children.values())
        return sorted(suffixes)
