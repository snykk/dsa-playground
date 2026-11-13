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

    ~BTreeNode() {
        for (BTreeNode* child : children) {
            delete child;
        }
    }

    BTreeNode(const BTreeNode&) = delete;
    BTreeNode& operator=(const BTreeNode&) = delete;
};

class BTree {
    BTreeNode* root;
    int max_keys;
    int min_keys;

    BTreeNode* searchRecursive(BTreeNode* node, int key) const {
        int i = 0;
        while (i < (int)node->keys.size() && key > node->keys[i]) {
            i++;
        }

        if (i < (int)node->keys.size() && node->keys[i] == key) {
            return node;
        }

        if (node->is_leaf) {
            return nullptr;
        }

        return searchRecursive(node->children[i], key);
    }

    void insertNonFull(BTreeNode* node, int key) {
        int i = (int)node->keys.size() - 1;

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

            if ((int)node->children[i]->keys.size() == max_keys) {
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
        int middle_key = full_child->keys[mid];

        new_child->keys.assign(full_child->keys.begin() + mid + 1, full_child->keys.end());
        full_child->keys.erase(full_child->keys.begin() + mid, full_child->keys.end());

        if (!full_child->is_leaf) {
            new_child->children.assign(full_child->children.begin() + mid + 1, full_child->children.end());
            full_child->children.erase(full_child->children.begin() + mid + 1, full_child->children.end());
        }

        parent->keys.insert(parent->keys.begin() + index, middle_key);
        parent->children.insert(parent->children.begin() + index + 1, new_child);
    }

    // Merge children[index + 1] and the separator keys[index] into children[index].
    void mergeChildren(BTreeNode* parent, int index) {
        BTreeNode* left = parent->children[index];
        BTreeNode* right = parent->children[index + 1];

        left->keys.push_back(parent->keys[index]);
        left->keys.insert(left->keys.end(), right->keys.begin(), right->keys.end());
        if (!left->is_leaf) {
            left->children.insert(left->children.end(), right->children.begin(), right->children.end());
        }

        parent->keys.erase(parent->keys.begin() + index);
        parent->children.erase(parent->children.begin() + index + 1);

        right->children.clear();  // ownership moved to left
        delete right;
    }

    void borrowFromLeft(BTreeNode* parent, int index) {
        BTreeNode* child = parent->children[index];
        BTreeNode* sibling = parent->children[index - 1];

        child->keys.insert(child->keys.begin(), parent->keys[index - 1]);
        parent->keys[index - 1] = sibling->keys.back();
        sibling->keys.pop_back();

        if (!child->is_leaf) {
            child->children.insert(child->children.begin(), sibling->children.back());
            sibling->children.pop_back();
        }
    }

    void borrowFromRight(BTreeNode* parent, int index) {
        BTreeNode* child = parent->children[index];
        BTreeNode* sibling = parent->children[index + 1];

        child->keys.push_back(parent->keys[index]);
        parent->keys[index] = sibling->keys.front();
        sibling->keys.erase(sibling->keys.begin());

        if (!child->is_leaf) {
            child->children.push_back(sibling->children.front());
            sibling->children.erase(sibling->children.begin());
        }
    }

    // Make sure children[index] has more than min_keys keys before descending.
    void fillChild(BTreeNode* parent, int index) {
        if (index > 0 && (int)parent->children[index - 1]->keys.size() > min_keys) {
            borrowFromLeft(parent, index);
        } else if (index < (int)parent->children.size() - 1 &&
                   (int)parent->children[index + 1]->keys.size() > min_keys) {
            borrowFromRight(parent, index);
        } else if (index < (int)parent->keys.size()) {
            mergeChildren(parent, index);
        } else {
            mergeChildren(parent, index - 1);
        }
    }

    int predecessor(BTreeNode* node) const {
        while (!node->is_leaf) {
            node = node->children.back();
        }
        return node->keys.back();
    }

    int successor(BTreeNode* node) const {
        while (!node->is_leaf) {
            node = node->children.front();
        }
        return node->keys.front();
    }

    bool removeRecursive(BTreeNode* node, int key) {
        int i = 0;
        while (i < (int)node->keys.size() && node->keys[i] < key) {
            i++;
        }

        if (i < (int)node->keys.size() && node->keys[i] == key) {
            if (node->is_leaf) {
                node->keys.erase(node->keys.begin() + i);
                return true;
            }
            if ((int)node->children[i]->keys.size() > min_keys) {
                int pred = predecessor(node->children[i]);
                node->keys[i] = pred;
                return removeRecursive(node->children[i], pred);
            }
            if ((int)node->children[i + 1]->keys.size() > min_keys) {
                int succ = successor(node->children[i + 1]);
                node->keys[i] = succ;
                return removeRecursive(node->children[i + 1], succ);
            }
            mergeChildren(node, i);
            return removeRecursive(node->children[i], key);
        }

        if (node->is_leaf) {
            return false;
        }

        if ((int)node->children[i]->keys.size() == min_keys) {
            fillChild(node, i);
        }
        // the last child may have merged into its left sibling
        if (i > (int)node->keys.size()) {
            i--;
        }
        return removeRecursive(node->children[i], key);
    }

    // Returns the leaf depth below node, or -1 if an invariant is broken.
    int validateNode(const BTreeNode* node, bool is_root, const int* lo, const int* hi) const {
        int n = (int)node->keys.size();
        if (n > max_keys || (!is_root && n < min_keys) || (is_root && !node->is_leaf && n < 1)) {
            return -1;
        }
        for (int i = 0; i < n; i++) {
            if (i > 0 && node->keys[i - 1] > node->keys[i]) return -1;
            if (lo && node->keys[i] < *lo) return -1;
            if (hi && node->keys[i] > *hi) return -1;
        }
        if (node->is_leaf) {
            return node->children.empty() ? 0 : -1;
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

    void traverseRecursive(const BTreeNode* node, vector<int>& out) const {
        for (size_t i = 0; i < node->keys.size(); i++) {
            if (!node->is_leaf) {
                traverseRecursive(node->children[i], out);
            }
            out.push_back(node->keys[i]);
        }
        if (!node->is_leaf) {
            traverseRecursive(node->children.back(), out);
        }
    }

public:
    BTree(int t = 3) {
        root = new BTreeNode(true);
        max_keys = 2 * t - 1;
        min_keys = t - 1;
    }

    ~BTree() { delete root; }

    BTree(const BTree&) = delete;
    BTree& operator=(const BTree&) = delete;

    bool search(int key) const {
        return searchRecursive(root, key) != nullptr;
    }

    void insert(int key) {
        if ((int)root->keys.size() == max_keys) {
            BTreeNode* new_root = new BTreeNode(false);
            new_root->children.push_back(root);
            splitChild(new_root, 0);
            root = new_root;
        }
        insertNonFull(root, key);
    }

    // Removes one occurrence of key. Returns false if the key is absent.
    bool remove(int key) {
        bool removed = removeRecursive(root, key);
        if (root->keys.empty() && !root->is_leaf) {
            BTreeNode* old_root = root;
            root = root->children[0];
            old_root->children.clear();
            delete old_root;
        }
        return removed;
    }

    // True when fill bounds, key order and equal leaf depth all hold.
    bool validate() const {
        return validateNode(root, true, nullptr, nullptr) >= 0;
    }

    // All keys in sorted order.
    vector<int> traverse() const {
        vector<int> out;
        traverseRecursive(root, out);
        return out;
    }
};
