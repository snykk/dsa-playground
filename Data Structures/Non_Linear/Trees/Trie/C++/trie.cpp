#include <iostream>
#include <unordered_map>
#include <vector>
#include <string>
#include <utility>
using namespace std;

class TrieNode {
public:
    unordered_map<char, TrieNode*> children;
    bool is_end_of_word;

    TrieNode() : is_end_of_word(false) {}
};

// Characters are bytes (char), so a multi-byte UTF-8 character is several nodes.
class Trie {
    TrieNode* root;

    // Deletes a whole subtree with an explicit stack, so a very long word cannot
    // overflow the call stack.
    static void destroy(TrieNode* top) {
        vector<TrieNode*> stack = {top};
        while (!stack.empty()) {
            TrieNode* node = stack.back();
            stack.pop_back();
            for (auto& entry : node->children) {
                stack.push_back(entry.second);
            }
            delete node;
        }
    }

public:
    Trie() {
        root = new TrieNode();
    }

    ~Trie() {
        destroy(root);
    }

    // Nodes are owned through raw pointers, so copying would share them.
    Trie(const Trie&) = delete;
    Trie& operator=(const Trie&) = delete;

    void insert(const string& word) {
        TrieNode* node = root;
        for (char ch : word) {
            if (node->children.find(ch) == node->children.end()) {
                node->children[ch] = new TrieNode();
            }
            node = node->children[ch];
        }
        node->is_end_of_word = true;
    }

    bool search(const string& word) {
        TrieNode* node = root;
        for (char ch : word) {
            auto it = node->children.find(ch);
            if (it == node->children.end()) {
                return false;
            }
            node = it->second;
        }
        return node->is_end_of_word;
    }

    bool startsWith(const string& prefix) {
        TrieNode* node = root;
        for (char ch : prefix) {
            auto it = node->children.find(ch);
            if (it == node->children.end()) {
                return false;
            }
            node = it->second;
        }
        return true;
    }

    // Returns true if the word was stored and has been removed. Nodes that no longer lead
    // to a word are pruned, walking back up until a word or a branching node is reached.
    bool deleteWord(const string& word) {
        vector<pair<TrieNode*, char>> path;  // (parent, character) from the root down
        TrieNode* node = root;
        for (char ch : word) {
            auto it = node->children.find(ch);
            if (it == node->children.end()) {
                return false;
            }
            path.push_back({node, ch});
            node = it->second;
        }

        if (!node->is_end_of_word) {
            return false;
        }
        node->is_end_of_word = false;

        while (!path.empty() && node->children.empty() && !node->is_end_of_word) {
            TrieNode* parent = path.back().first;
            char ch = path.back().second;
            path.pop_back();
            parent->children.erase(ch);
            delete node;
            node = parent;
        }
        return true;
    }

    // All stored words. The order follows the hash map, so it is unspecified.
    vector<string> getAllWords() {
        vector<string> words;
        vector<pair<TrieNode*, string>> stack = {{root, ""}};
        while (!stack.empty()) {
            TrieNode* node = stack.back().first;
            string prefix = stack.back().second;
            stack.pop_back();
            if (node->is_end_of_word) {
                words.push_back(prefix);
            }
            for (auto& entry : node->children) {
                stack.push_back({entry.second, prefix + entry.first});
            }
        }
        return words;
    }

    int countWords() {
        int count = 0;
        vector<TrieNode*> stack = {root};
        while (!stack.empty()) {
            TrieNode* node = stack.back();
            stack.pop_back();
            if (node->is_end_of_word) {
                count++;
            }
            for (auto& entry : node->children) {
                stack.push_back(entry.second);
            }
        }
        return count;
    }

    // True when no word is stored (the empty word counts as a word).
    bool isEmpty() {
        return root->children.empty() && !root->is_end_of_word;
    }
};
