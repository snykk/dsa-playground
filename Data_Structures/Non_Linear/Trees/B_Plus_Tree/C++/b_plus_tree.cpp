#include <iostream>
#include <vector>
#include <string>
#include <utility>
using namespace std;

class BPlusTreeNode {
public:
    vector<int> keys;
    vector<BPlusTreeNode*> children;
    vector<string> values;
    bool is_leaf;
    BPlusTreeNode* next;
    
    BPlusTreeNode(bool leaf = false) : is_leaf(leaf), next(nullptr) {}

    ~BPlusTreeNode() {
        for (BPlusTreeNode* child : children) {
            delete child;
        }
    }

    BPlusTreeNode(const BPlusTreeNode&) = delete;
    BPlusTreeNode& operator=(const BPlusTreeNode&) = delete;
};

class BPlusTree {
    BPlusTreeNode* root;
    int max_keys;
    int min_keys;

    BPlusTreeNode* findLeaf(int key) {
        BPlusTreeNode* node = root;
        while (!node->is_leaf) {
            int i = 0;
            while (i < (int)node->keys.size() && key >= node->keys[i]) {
                i++;
            }
            node = node->children[i];
        }
        return node;
    }

    void insertNonFull(BPlusTreeNode* node, int key, const string& value) {
        if (node->is_leaf) {
            int i = 0;
            while (i < (int)node->keys.size() && node->keys[i] < key) {
                i++;
            }
            node->keys.insert(node->keys.begin() + i, key);
            node->values.insert(node->values.begin() + i, value);
        } else {
            int i = 0;
            while (i < (int)node->keys.size() && key >= node->keys[i]) {
                i++;
            }
            
            if ((int)node->children[i]->keys.size() == max_keys) {
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

    // Returns the leaf depth below node, or -1 if an invariant is broken.
    int validateNode(const BPlusTreeNode* node, bool is_root, const int* lo, const int* hi) const {
        int n = (int)node->keys.size();
        if (n > max_keys || (!is_root && n < min_keys)) return -1;
        if (is_root && !node->is_leaf && n < 1) return -1;
        for (int i = 0; i < n; i++) {
            if (i > 0 && node->keys[i - 1] >= node->keys[i]) return -1;
            if (lo && node->keys[i] < *lo) return -1;
            if (hi && node->keys[i] >= *hi) return -1;
        }
        if (node->is_leaf) {
            return (node->children.empty() && node->values.size() == node->keys.size()) ? 0 : -1;
        }
        if ((int)node->children.size() != n + 1) return -1;
        int depth = -2;
        for (int i = 0; i <= n; i++) {
            const int* child_lo = (i == 0) ? lo : &node->keys[i - 1];
            const int* child_hi = (i == n) ? hi : &node->keys[i];
            int d = validateNode(node->children[i], false, child_lo, child_hi);
            if (d < 0) return -1;
            if (depth == -2) depth = d;
            else if (depth != d) return -1;
        }
        return depth + 1;
    }

public:
    BPlusTree(int t = 3) {
        root = new BPlusTreeNode(true);
        max_keys = 2 * t - 1;
        min_keys = t - 1;
    }

    ~BPlusTree() { delete root; }

    BPlusTree(const BPlusTree&) = delete;
    BPlusTree& operator=(const BPlusTree&) = delete;

    // Returns the value, or "" when the key is missing (also what an empty stored value returns).
    string search(int key) {
        BPlusTreeNode* leaf = findLeaf(key);
        for (int i = 0; i < (int)leaf->keys.size(); i++) {
            if (leaf->keys[i] == key) {
                return leaf->values[i];
            }
        }
        return "";
    }

    // An existing key is overwritten: the tree is a map.
    void insert(int key, const string& value) {
        BPlusTreeNode* leaf = findLeaf(key);
        for (int i = 0; i < (int)leaf->keys.size(); i++) {
            if (leaf->keys[i] == key) {
                leaf->values[i] = value;
                return;
            }
        }
        if ((int)root->keys.size() == max_keys) {
            BPlusTreeNode* new_root = new BPlusTreeNode(false);
            new_root->children.push_back(root);
            splitChild(new_root, 0);
            root = new_root;
        }
        insertNonFull(root, key, value);
    }

    // All (key, value) pairs with start_key <= key <= end_key, in key order.
    vector<pair<int, string>> range_search(int start_key, int end_key) {
        vector<pair<int, string>> result;
        for (BPlusTreeNode* leaf = findLeaf(start_key); leaf != nullptr; leaf = leaf->next) {
            for (size_t i = 0; i < leaf->keys.size(); i++) {
                if (leaf->keys[i] > end_key) return result;
                if (leaf->keys[i] >= start_key) result.push_back({leaf->keys[i], leaf->values[i]});
            }
        }
        return result;
    }

    // Every (key, value) pair in key order, read by walking the leaf chain.
    vector<pair<int, string>> traverse() {
        vector<pair<int, string>> result;
        BPlusTreeNode* leaf = root;
        while (!leaf->is_leaf) leaf = leaf->children.front();
        for (; leaf != nullptr; leaf = leaf->next) {
            for (size_t i = 0; i < leaf->keys.size(); i++) {
                result.push_back({leaf->keys[i], leaf->values[i]});
            }
        }
        return result;
    }

    // True when fill bounds, separators, equal leaf depth and the leaf chain all hold.
    bool validate() const {
        if (validateNode(root, true, nullptr, nullptr) < 0) return false;
        const BPlusTreeNode* leaf = root;
        while (!leaf->is_leaf) leaf = leaf->children.front();
        bool first = true;
        int prev = 0;
        for (; leaf != nullptr; leaf = leaf->next) {
            for (int k : leaf->keys) {
                if (!first && k <= prev) return false;
                prev = k;
                first = false;
            }
        }
        return true;
    }
};
