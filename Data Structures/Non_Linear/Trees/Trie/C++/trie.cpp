#include <iostream>
#include <unordered_map>
#include <vector>
#include <string>
using namespace std;

class TrieNode {
public:
    unordered_map<char, TrieNode*> children;
    bool is_end_of_word;
    
    TrieNode() : is_end_of_word(false) {}
};

class Trie {
    TrieNode* root;

    bool deleteRecursive(TrieNode* node, const string& word, int index) {
        if (index == word.length()) {
            if (!node->is_end_of_word) return false;
            node->is_end_of_word = false;
            return node->children.empty();
        }
        
        char ch = word[index];
        if (node->children.find(ch) == node->children.end()) {
            return false;
        }
        
        TrieNode* child = node->children[ch];
        bool should_delete = deleteRecursive(child, word, index + 1);
        
        if (should_delete) {
            delete child;
            node->children.erase(ch);
            return node->children.empty() && !node->is_end_of_word;
        }
        
        return false;
    }

    void traverse(TrieNode* node, string prefix, vector<string>& words) {
        if (node->is_end_of_word) {
            words.push_back(prefix);
        }
        for (auto& pair : node->children) {
            traverse(pair.second, prefix + pair.first, words);
        }
    }

public:
    Trie() {
        root = new TrieNode();
    }

    ~Trie() {
        // Cleanup would require recursive deletion
        // Simplified for this implementation
    }

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
            if (node->children.find(ch) == node->children.end()) {
                return false;
            }
            node = node->children[ch];
        }
        return node->is_end_of_word;
    }

    bool startsWith(const string& prefix) {
        TrieNode* node = root;
        for (char ch : prefix) {
            if (node->children.find(ch) == node->children.end()) {
                return false;
            }
            node = node->children[ch];
        }
        return true;
    }

    bool deleteWord(const string& word) {
        return deleteRecursive(root, word, 0);
    }

    vector<string> getAllWords() {
        vector<string> words;
        traverse(root, "", words);
        return words;
    }

    bool isEmpty() {
        return root->children.empty();
    }
};

