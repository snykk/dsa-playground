#include <iostream>
#include <vector>
#include <string>
using namespace std;

class BPlusTreeNode {
public:
    vector<int> keys;
    vector<BPlusTreeNode*> children;
    vector<string> values;
    bool is_leaf;
    BPlusTreeNode* next;
    
    BPlusTreeNode(bool leaf = false) : is_leaf(leaf), next(nullptr) {}
};

class BPlusTree {
    BPlusTreeNode* root;
    int min_degree;
    int max_keys;
    int min_keys;

    BPlusTreeNode* findLeaf(int key) {
        BPlusTreeNode* node = root;
        while (!node->is_leaf) {
            int i = 0;
            while (i < node->keys.size() && key >= node->keys[i]) {
                i++;
            }
            node = node->children[i];
        }
        return node;
    }

    void insertNonFull(BPlusTreeNode* node, int key, const string& value) {
        if (node->is_leaf) {
            int i = 0;
            while (i < node->keys.size() && node->keys[i] < key) {
                i++;
            }
            node->keys.insert(node->keys.begin() + i, key);
            node->values.insert(node->values.begin() + i, value);
        } else {
            int i = 0;
            while (i < node->keys.size() && key >= node->keys[i]) {
                i++;
            }
            
            if (node->children[i]->keys.size() == max_keys) {
                splitChild(node, i);
                if (key >= node->keys[i]) {
                    i++;
                }
            }
            
            insertNonFull(node->children[i], key, value);
        }
    }

    void splitChild(BPlusTreeNode* parent, int index) {
        BPlusTreeNode* full_child = parent->children[index];
        BPlusTreeNode* new_child = new BPlusTreeNode(full_child->is_leaf);
        
        int mid = min_keys;
        
        if (full_child->is_leaf) {
            new_child->keys.assign(full_child->keys.begin() + mid, full_child->keys.end());
            new_child->values.assign(full_child->values.begin() + mid, full_child->values.end());
            full_child->keys.erase(full_child->keys.begin() + mid, full_child->keys.end());
            full_child->values.erase(full_child->values.begin() + mid, full_child->values.end());
            
            new_child->next = full_child->next;
            full_child->next = new_child;
            
            parent->keys.insert(parent->keys.begin() + index, new_child->keys[0]);
        } else {
            new_child->keys.assign(full_child->keys.begin() + mid + 1, full_child->keys.end());
            new_child->children.assign(full_child->children.begin() + mid + 1, full_child->children.end());
            int promote_key = full_child->keys[mid];
            full_child->keys.erase(full_child->keys.begin() + mid, full_child->keys.end());
            full_child->children.erase(full_child->children.begin() + mid + 1, full_child->children.end());
            
            parent->keys.insert(parent->keys.begin() + index, promote_key);
        }
        
        parent->children.insert(parent->children.begin() + index + 1, new_child);
    }

public:
    BPlusTree(int t = 3) : min_degree(t) {
        root = new BPlusTreeNode(true);
        max_keys = 2 * t - 1;
        min_keys = t - 1;
    }

    string search(int key) {
        BPlusTreeNode* leaf = findLeaf(key);
        for (int i = 0; i < leaf->keys.size(); i++) {
            if (leaf->keys[i] == key) {
                return leaf->values[i];
            }
        }
        return "";
    }

    void insert(int key, const string& value) {
        if (root->keys.size() == max_keys) {
            BPlusTreeNode* new_root = new BPlusTreeNode(false);
            new_root->children.push_back(root);
            splitChild(new_root, 0);
            root = new_root;
        }
        insertNonFull(root, key, value);
    }
};

