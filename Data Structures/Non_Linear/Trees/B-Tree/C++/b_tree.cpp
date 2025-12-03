#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class BTreeNode {
public:
    vector<int> keys;
    vector<BTreeNode*> children;
    bool is_leaf;
    
    BTreeNode(bool leaf = false) : is_leaf(leaf) {}
};

class BTree {
    BTreeNode* root;
    int min_degree;
    int max_keys;
    int min_keys;

    BTreeNode* searchRecursive(BTreeNode* node, int key) {
        int i = 0;
        while (i < node->keys.size() && key > node->keys[i]) {
            i++;
        }
        
        if (i < node->keys.size() && node->keys[i] == key) {
            return node;
        }
        
        if (node->is_leaf) {
            return nullptr;
        }
        
        return searchRecursive(node->children[i], key);
    }

    void insertNonFull(BTreeNode* node, int key) {
        int i = node->keys.size() - 1;
        
        if (node->is_leaf) {
            node->keys.push_back(0);
            while (i >= 0 && node->keys[i] > key) {
                node->keys[i + 1] = node->keys[i];
                i--;
            }
            node->keys[i + 1] = key;
        } else {
            while (i >= 0 && node->keys[i] > key) {
                i--;
            }
            i++;
            
            if (node->children[i]->keys.size() == max_keys) {
                splitChild(node, i);
                if (node->keys[i] < key) {
                    i++;
                }
            }
            
            insertNonFull(node->children[i], key);
        }
    }

    void splitChild(BTreeNode* parent, int index) {
        BTreeNode* full_child = parent->children[index];
        BTreeNode* new_child = new BTreeNode(full_child->is_leaf);
        
        int mid = min_keys;
        new_child->keys.assign(full_child->keys.begin() + mid + 1, full_child->keys.end());
        full_child->keys.erase(full_child->keys.begin() + mid, full_child->keys.end());
        
        if (!full_child->is_leaf) {
            new_child->children.assign(full_child->children.begin() + mid + 1, full_child->children.end());
            full_child->children.erase(full_child->children.begin() + mid + 1, full_child->children.end());
        }
        
        parent->keys.insert(parent->keys.begin() + index, full_child->keys[mid]);
        parent->children.insert(parent->children.begin() + index + 1, new_child);
        full_child->keys.pop_back();
    }

public:
    BTree(int t = 3) : min_degree(t) {
        root = new BTreeNode(true);
        max_keys = 2 * t - 1;
        min_keys = t - 1;
    }

    bool search(int key) {
        return searchRecursive(root, key) != nullptr;
    }

    void insert(int key) {
        if (root->keys.size() == max_keys) {
            BTreeNode* new_root = new BTreeNode(false);
            new_root->children.push_back(root);
            splitChild(new_root, 0);
            root = new_root;
        }
        insertNonFull(root, key);
    }
};

