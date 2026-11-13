"""
Huffman Coding Implementation

Huffman coding is a lossless data compression algorithm that assigns variable-length
codes to characters based on their frequencies. More frequent characters get shorter codes.
"""

import heapq
from collections import Counter


class HuffmanNode:
    """Node in Huffman tree"""
    def __init__(self, char=None, freq=0, left=None, right=None):
        self.char = char
        self.freq = freq
        self.left = left
        self.right = right
    
    def __lt__(self, other):
        return self.freq < other.freq


def build_huffman_tree(text):
    """
    Build Huffman tree from text
    
    Args:
        text: Input string
        
    Returns:
        Root node of Huffman tree
    """
    if not text:
        return None
    
    # Count character frequencies
    freq = Counter(text)
    
    # Create leaf nodes and add to priority queue
    heap = []
    for char, count in freq.items():
        node = HuffmanNode(char=char, freq=count)
        heapq.heappush(heap, node)
    
    # Build tree by merging nodes
    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        
        merged = HuffmanNode(
            freq=left.freq + right.freq,
            left=left,
            right=right
        )
        heapq.heappush(heap, merged)
    
    return heap[0] if heap else None


def build_codes(root, code="", codes=None):
    """
    Build encoding table from Huffman tree
    
    Args:
        root: Root of Huffman tree
        code: Current code string
        codes: Dictionary to store codes
        
    Returns:
        Dictionary mapping characters to codes
    """
    if codes is None:
        codes = {}
    
    if root is None:
        return codes
    
    # Leaf node - store code
    if root.char is not None:
        # For single character case, use "0" as code
        codes[root.char] = code if code else "0"
        return codes
    
    # Traverse left (add 0) and right (add 1)
    build_codes(root.left, code + "0", codes)
    build_codes(root.right, code + "1", codes)
    
    return codes


def huffman_encode(text):
    """
    Encode text using Huffman coding
    
    Args:
        text: Input string
        
    Returns:
        Tuple of (encoded_string, codes_dict, tree_root)
    """
    if not text:
        return "", {}, None
    
    tree = build_huffman_tree(text)
    codes = build_codes(tree)
    
    # Encode text
    encoded = "".join(codes[char] for char in text)
    
    return encoded, codes, tree


def huffman_decode(encoded, tree):
    """
    Decode Huffman-encoded string
    
    Args:
        encoded: Encoded binary string
        tree: Root of Huffman tree
        
    Returns:
        Decoded string
    """
    if tree is None:
        return ""
    
    # Special case: single character (tree is leaf)
    if tree.char is not None:
        return tree.char * len(encoded) if encoded else ""
    
    if not encoded:
        return ""
    
    decoded = []
    current = tree
    
    for bit in encoded:
        if current is None:
            break
            
        if bit == "0":
            current = current.left
        else:
            current = current.right
        
        # Leaf node - found character
        if current is not None and current.char is not None:
            decoded.append(current.char)
            current = tree  # Reset to root
    
    return "".join(decoded)


def calculate_compression_ratio(original, encoded, codes):
    """
    Calculate compression ratio
    
    Args:
        original: Original text
        encoded: Encoded string
        codes: Encoding dictionary
        
    Returns:
        Compression ratio and savings percentage
    """
    original_bits = len(original) * 8  # Assuming 8 bits per character
    encoded_bits = len(encoded)
    
    ratio = encoded_bits / original_bits if original_bits > 0 else 0
    savings = (1 - ratio) * 100
    
    return ratio, savings

