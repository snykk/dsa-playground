#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;

// A node owns nothing by itself: the SuffixTree keeps every node in one list and
// deletes them in its destructor, so even a very deep tree is freed without recursion.
class SuffixTreeNode {
public:
    unordered_map<char, SuffixTreeNode*> children;
    int start;          // first index of the edge label (in the text)
    int end;            // last index of the edge label (inclusive)
    int suffix_index;   // start of the suffix when this node is a leaf, otherwise -1

    SuffixTreeNode(int s, int e) : start(s), end(e), suffix_index(-1) {}
};

class SuffixTree {
    string original;
    string text;  // original + a NUL terminator that cannot occur in the text
    int n;
    SuffixTreeNode* root;
    vector<SuffixTreeNode*> all_nodes;

    SuffixTreeNode* newNode(int start, int end) {
        SuffixTreeNode* node = new SuffixTreeNode(start, end);
        all_nodes.push_back(node);
        return node;
    }

    void insertSuffix(int start_idx) {
        SuffixTreeNode* node = root;
        int i = start_idx;

        while (i < n) {
            char ch = text[i];
            auto it = node->children.find(ch);

            if (it == node->children.end()) {
                SuffixTreeNode* leaf = newNode(i, n - 1);
                leaf->suffix_index = start_idx;
                node->children[ch] = leaf;
                return;
            }

            SuffixTreeNode* child = it->second;
            int edge_length = child->end - child->start + 1;

            int j = 0;
            while (j < edge_length && i + j < n && text[child->start + j] == text[i + j]) {
                j++;
            }

            if (j < edge_length) {
                // Mismatch inside the edge: split it at offset j.
                SuffixTreeNode* internal = newNode(child->start, child->start + j - 1);
                child->start += j;
                internal->children[text[child->start]] = child;
                SuffixTreeNode* leaf = newNode(i + j, n - 1);
                leaf->suffix_index = start_idx;
                internal->children[text[i + j]] = leaf;
                node->children[ch] = internal;
                return;
            }

            // The whole edge matched: continue below it. The unique terminator guarantees
            // that the suffix cannot end here, so there is always more text.
            i += edge_length;
            node = child;
        }
    }

    vector<int> collectLeaves(SuffixTreeNode* from) const {
        vector<int> result;
        vector<SuffixTreeNode*> stack = {from};
        while (!stack.empty()) {
            SuffixTreeNode* current = stack.back();
            stack.pop_back();
            if (current->suffix_index != -1) {
                result.push_back(current->suffix_index);
            }
            for (const auto& entry : current->children) {
                stack.push_back(entry.second);
            }
        }
        sort(result.begin(), result.end());
        return result;
    }

public:
    // Throws std::invalid_argument if the text contains a NUL character.
    explicit SuffixTree(const string& s) : original(s) {
        if (s.find('\0') != string::npos) {
            throw invalid_argument("text must not contain the NUL character");
        }
        text = s + '\0';
        n = static_cast<int>(text.size());
        root = newNode(-1, -1);
        for (int i = 0; i < n; i++) {
            insertSuffix(i);
        }
    }

    ~SuffixTree() {
        for (SuffixTreeNode* node : all_nodes) {
            delete node;
        }
    }

    SuffixTree(const SuffixTree&) = delete;
    SuffixTree& operator=(const SuffixTree&) = delete;

    // Start indices of every occurrence of pattern, sorted. An empty pattern gives {}.
    vector<int> search(const string& pattern) const {
        int m = static_cast<int>(pattern.size());
        if (m == 0 || pattern.find('\0') != string::npos) {
            return {};
        }

        SuffixTreeNode* node = root;
        int i = 0;
        while (i < m) {
            auto it = node->children.find(pattern[i]);
            if (it == node->children.end()) {
                return {};
            }

            SuffixTreeNode* child = it->second;
            int edge_length = child->end - child->start + 1;

            int j = 0;
            while (j < edge_length && i + j < m) {
                if (text[child->start + j] != pattern[i + j]) {
                    return {};
                }
                j++;
            }

            i += j;
            if (i >= m) {
                return collectLeaves(child);
            }
            node = child;
        }
        return {};
    }

    // Every non-empty suffix of the original text, sorted.
    vector<string> get_all_suffixes() const {
        vector<string> suffixes;
        int len = static_cast<int>(original.size());
        for (int idx : collectLeaves(root)) {
            if (idx < len) {
                suffixes.push_back(original.substr(idx));
            }
        }
        sort(suffixes.begin(), suffixes.end());
        return suffixes;
    }
};
