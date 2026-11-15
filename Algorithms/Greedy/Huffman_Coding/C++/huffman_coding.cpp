/**
 * Huffman Coding Implementation (C++)
 *
 * Assigns variable-length, prefix-free codes to the bytes of a text: frequent
 * bytes get shorter codes. Codes and the encoded text are strings of '0' and
 * '1', one character per bit.
 * Time Complexity: O(N + k log k) for N characters and k distinct symbols
 */

#include <cstddef>
#include <map>
#include <memory>
#include <string>
#include <utility>
#include <vector>

// Node in the Huffman tree. A leaf holds a symbol; an internal node has two children.
struct HuffmanNode {
    char symbol = 0;
    long long freq = 0;
    std::unique_ptr<HuffmanNode> left;
    std::unique_ptr<HuffmanNode> right;

    bool isLeaf() const { return !left && !right; }
};

using HuffmanTree = std::unique_ptr<HuffmanNode>;

// The heap below is Python's heapq (heappush, heappop) comparing frequencies
// only, so that equal frequencies pop in the same order as in
// huffman_coding.py and the code table is identical. std::priority_queue
// breaks those ties differently.

// heapq._siftdown: move heap[pos] up while it is lighter than its parent.
static void heapSiftUp(std::vector<HuffmanTree>& heap, std::size_t start, std::size_t pos) {
    HuffmanTree item = std::move(heap[pos]);
    while (pos > start) {
        const std::size_t parent = (pos - 1) / 2;
        if (item->freq >= heap[parent]->freq) {
            break;
        }
        heap[pos] = std::move(heap[parent]);
        pos = parent;
    }
    heap[pos] = std::move(item);
}

// heapq._siftup: move the lighter child up until pos is a leaf (the right
// child on a tie), put the item there, then sift it back up.
static void heapSiftDown(std::vector<HuffmanTree>& heap, std::size_t pos) {
    const std::size_t start = pos;
    HuffmanTree item = std::move(heap[pos]);
    for (std::size_t child = 2 * pos + 1; child < heap.size(); child = 2 * pos + 1) {
        const std::size_t right = child + 1;
        if (right < heap.size() && heap[right]->freq <= heap[child]->freq) {
            child = right;
        }
        heap[pos] = std::move(heap[child]);
        pos = child;
    }
    heap[pos] = std::move(item);
    heapSiftUp(heap, start, pos);
}

static void heapPush(std::vector<HuffmanTree>& heap, HuffmanTree node) {
    heap.push_back(std::move(node));
    heapSiftUp(heap, 0, heap.size() - 1);
}

static HuffmanTree heapPop(std::vector<HuffmanTree>& heap) {
    HuffmanTree last = std::move(heap.back());
    heap.pop_back();
    if (heap.empty()) {
        return last;
    }
    HuffmanTree top = std::move(heap[0]);
    heap[0] = std::move(last);
    heapSiftDown(heap, 0);
    return top;
}

/**
 * Build the Huffman tree of text: the root, or nullptr for empty text.
 * Leaves enter the heap in order of first occurrence, as with Python's Counter.
 */
HuffmanTree buildHuffmanTree(const std::string& text) {
    if (text.empty()) {
        return nullptr;
    }

    std::map<char, long long> freq;
    std::vector<char> firstSeen;
    for (char c : text) {
        if (freq[c]++ == 0) {
            firstSeen.push_back(c);
        }
    }

    std::vector<HuffmanTree> heap;
    for (char c : firstSeen) {
        auto leaf = std::make_unique<HuffmanNode>();
        leaf->symbol = c;
        leaf->freq = freq[c];
        heapPush(heap, std::move(leaf));
    }

    // Merge the two lightest nodes: the first popped is the left child.
    while (heap.size() > 1) {
        auto merged = std::make_unique<HuffmanNode>();
        merged->left = heapPop(heap);
        merged->right = heapPop(heap);
        merged->freq = merged->left->freq + merged->right->freq;
        heapPush(heap, std::move(merged));
    }

    return std::move(heap[0]);
}

static void collectCodes(const HuffmanNode* node, const std::string& code, std::map<char, std::string>& codes) {
    if (!node) {
        return;
    }
    if (node->isLeaf()) {
        // For the single-symbol case, use "0" as code.
        codes[node->symbol] = code.empty() ? "0" : code;
        return;
    }
    collectCodes(node->left.get(), code + "0", codes);
    collectCodes(node->right.get(), code + "1", codes);
}

// Code table of a Huffman tree: left adds '0', right adds '1'.
std::map<char, std::string> buildCodes(const HuffmanNode* root) {
    std::map<char, std::string> codes;
    collectCodes(root, "", codes);
    return codes;
}

// What huffmanEncode returns: Python's (encoded, codes, tree) tuple.
struct HuffmanResult {
    std::string encoded;
    std::map<char, std::string> codes;
    HuffmanTree tree;
};

// Encode text; for empty text everything in the result is empty.
HuffmanResult huffmanEncode(const std::string& text) {
    HuffmanResult result;
    if (text.empty()) {
        return result;
    }
    result.tree = buildHuffmanTree(text);
    result.codes = buildCodes(result.tree.get());
    for (char c : text) {
        result.encoded += result.codes[c];
    }
    return result;
}

// Decode a string of '0' and '1' with the tree that encoded it ("" for no tree).
std::string huffmanDecode(const std::string& encoded, const HuffmanNode* tree) {
    if (!tree) {
        return "";
    }
    // Single symbol: the tree is a leaf and every bit stands for it.
    if (tree->isLeaf()) {
        return std::string(encoded.size(), tree->symbol);
    }

    std::string decoded;
    const HuffmanNode* current = tree;
    for (char bit : encoded) {
        if (!current) {
            break;
        }
        current = bit == '0' ? current->left.get() : current->right.get();
        if (current && current->isLeaf()) {
            decoded += current->symbol;
            current = tree;  // Reset to root
        }
    }
    return decoded;
}

/**
 * (ratio, savings percent) of the encoded bits against 8 bits per character
 * of original; the ratio is 0 for an empty original. The code table is not
 * used, as in Python.
 */
std::pair<double, double> calculateCompressionRatio(const std::string& original, const std::string& encoded,
                                                    const std::map<char, std::string>& /* codes */) {
    const std::size_t originalBits = original.size() * 8;
    const double ratio = originalBits > 0 ? static_cast<double>(encoded.size()) / static_cast<double>(originalBits) : 0;
    return {ratio, (1 - ratio) * 100};
}
