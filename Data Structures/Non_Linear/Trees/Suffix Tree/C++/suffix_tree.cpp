#include <iostream>
#include <unordered_map>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

class SuffixTreeNode {
public:
    unordered_map<char, SuffixTreeNode*> children;
    SuffixTreeNode* suffix_link;
    int start;
    int* end;
    int suffix_index;
    
    SuffixTreeNode(int s, int* e) : start(s), end(e), suffix_index(-1), suffix_link(nullptr) {}
};

class SuffixTree {
    string text;
    int n;
    SuffixTreeNode* root;
    int global_end;
    
    SuffixTreeNode* newNode(int start, int* end) {
        SuffixTreeNode* node = new SuffixTreeNode(start, end);
        return node;
    }
    
    void insertSuffix(int start_idx) {
        SuffixTreeNode* node = root;
        int i = start_idx;
        
        while (i < n) {
            char ch = text[i];
            
            if (node->children.find(ch) == node->children.end()) {
                int* end_ptr = new int(n - 1);
                SuffixTreeNode* leaf = newNode(i, end_ptr);
                leaf->suffix_index = start_idx;
                node->children[ch] = leaf;
                return;
            }
            
            SuffixTreeNode* child = node->children[ch];
            int edge_start = child->start;
            int edge_end = *(child->end);
            int edge_length = edge_end - edge_start + 1;
            
            int j = 0;
            while (j < edge_length && i + j < n) {
                if (text[edge_start + j] != text[i + j]) {
                    // Split needed - simplified for this implementation
                    return;
                }
                j++;
            }
            
            if (i + j < n) {
                i += edge_length;
                node = child;
            } else {
                return;
            }
        }
    }

public:
    SuffixTree(const string& s) : text(s), n(s.length()) {
        if (text.back() != '$') {
            text += '$';
            n = text.length();
        }
        root = newNode(-1, nullptr);
        global_end = -1;
        
        for (int i = 0; i < n; i++) {
            insertSuffix(i);
        }
    }
    
    vector<int> search(const string& pattern) {
        vector<int> result;
        SuffixTreeNode* node = root;
        int i = 0;
        int m = pattern.length();
        
        while (i < m) {
            char ch = pattern[i];
            
            if (node->children.find(ch) == node->children.end()) {
                return result;
            }
            
            SuffixTreeNode* child = node->children[ch];
            int edge_start = child->start;
            int edge_end = *(child->end);
            
            int j = 0;
            while (j < (edge_end - edge_start + 1) && i + j < m) {
                if (text[edge_start + j] != pattern[i + j]) {
                    return result;
                }
                j++;
            }
            
            i += j;
            
            if (i >= m) {
                // Collect leaf indices - simplified
                result.push_back(child->suffix_index);
                return result;
            }
            
            node = child;
        }
        
        return result;
    }
};


