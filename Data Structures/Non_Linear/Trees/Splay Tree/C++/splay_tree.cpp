/**
 * Splay Tree Implementation (C++)
 * 
 * A self-adjusting binary search tree that moves recently accessed elements
 * to the root through rotations (splaying).
 */

#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

class SplayNode {
public:
    int key;
    std::string value;
    SplayNode* left;
    SplayNode* right;
    SplayNode* parent;
    
    SplayNode(int k, const std::string& v = "") 
        : key(k), value(v), left(nullptr), right(nullptr), parent(nullptr) {}
};

class SplayTree {
private:
    SplayNode* root;
    
    void rightRotate(SplayNode* x) {
        SplayNode* y = x->left;
        if (y == nullptr) return;
        
        x->left = y->right;
        if (y->right != nullptr) {
            y->right->parent = x;
        }
        
        y->parent = x->parent;
        if (x->parent == nullptr) {
            root = y;
        } else if (x == x->parent->left) {
            x->parent->left = y;
        } else {
            x->parent->right = y;
        }
        
        y->right = x;
        x->parent = y;
    }
    
    void leftRotate(SplayNode* x) {
        SplayNode* y = x->right;
        if (y == nullptr) return;
        
        x->right = y->left;
        if (y->left != nullptr) {
            y->left->parent = x;
        }
        
        y->parent = x->parent;
        if (x->parent == nullptr) {
            root = y;
        } else if (x == x->parent->left) {
            x->parent->left = y;
        } else {
            x->parent->right = y;
        }
        
        y->left = x;
        x->parent = y;
    }
    
    void splay(SplayNode* node) {
        while (node->parent != nullptr) {
            SplayNode* parent = node->parent;
            SplayNode* grandparent = parent->parent;
            
            if (grandparent == nullptr) {
                // Zig case
                if (node == parent->left) {
                    rightRotate(parent);
                } else {
                    leftRotate(parent);
                }
            } else if (node == parent->left && parent == grandparent->left) {
                // Zig-Zig case (left-left)
                rightRotate(grandparent);
                rightRotate(parent);
            } else if (node == parent->right && parent == grandparent->right) {
                // Zig-Zig case (right-right)
                leftRotate(grandparent);
                leftRotate(parent);
            } else if (node == parent->right && parent == grandparent->left) {
                // Zig-Zag case (left-right)
                leftRotate(parent);
                rightRotate(grandparent);
            } else {
                // Zig-Zag case (right-left)
                rightRotate(parent);
                leftRotate(grandparent);
            }
        }
    }
    
    SplayNode* searchNode(int key) {
        SplayNode* current = root;
        while (current != nullptr) {
            if (key == current->key) {
                return current;
            } else if (key < current->key) {
                if (current->left == nullptr) {
                    return current;
                }
                current = current->left;
            } else {
                if (current->right == nullptr) {
                    return current;
                }
                current = current->right;
            }
        }
        return nullptr;
    }
    
    // Iterative helpers: sequential inserts build a path-shaped tree, so
    // recursion could overflow the native stack.
    int sizeIterative() const {
        int count = 0;
        std::vector<const SplayNode*> stack;
        if (root != nullptr) stack.push_back(root);
        while (!stack.empty()) {
            const SplayNode* n = stack.back();
            stack.pop_back();
            count++;
            if (n->left != nullptr) stack.push_back(n->left);
            if (n->right != nullptr) stack.push_back(n->right);
        }
        return count;
    }

    void deleteTree(SplayNode* node) {
        std::vector<SplayNode*> stack;
        if (node != nullptr) stack.push_back(node);
        while (!stack.empty()) {
            SplayNode* n = stack.back();
            stack.pop_back();
            if (n->left != nullptr) stack.push_back(n->left);
            if (n->right != nullptr) stack.push_back(n->right);
            delete n;
        }
    }

public:
    SplayTree() : root(nullptr) {}
    
    ~SplayTree() {
        deleteTree(root);
    }
    
    // The tree owns raw nodes, so copying is disabled (a shallow copy would
    // free the nodes twice).
    SplayTree(const SplayTree&) = delete;
    SplayTree& operator=(const SplayTree&) = delete;

    void insert(int key, const std::string& value = "") {
        if (root == nullptr) {
            root = new SplayNode(key, value);
            return;
        }
        
        SplayNode* current = root;
        SplayNode* parent = nullptr;
        
        while (current != nullptr) {
            parent = current;
            if (key == current->key) {
                // Key exists, update value and splay
                current->value = value;
                splay(current);
                return;
            } else if (key < current->key) {
                current = current->left;
            } else {
                current = current->right;
            }
        }
        
        // Insert new node
        SplayNode* new_node = new SplayNode(key, value);
        new_node->parent = parent;
        
        if (key < parent->key) {
            parent->left = new_node;
        } else {
            parent->right = new_node;
        }
        
        // Splay the new node to root
        splay(new_node);
    }
    
    std::string search(int key) {
        if (root == nullptr) return "";

        SplayNode* node = searchNode(key);
        // Splay on a hit and on a miss (the last visited node), which keeps
        // the amortized O(log n) bound for unsuccessful searches too.
        splay(node);
        if (node->key == key) {
            return node->value;
        }
        return "";
    }

    bool remove(int key) {
        if (root == nullptr) return false;

        SplayNode* node = searchNode(key);
        splay(node);
        if (node->key != key) {
            return false;
        }

        // node is now the root. Detach both subtrees, clearing parent links.
        SplayNode* left_subtree = node->left;
        SplayNode* right_subtree = node->right;
        if (left_subtree != nullptr) left_subtree->parent = nullptr;
        if (right_subtree != nullptr) right_subtree->parent = nullptr;
        delete node;

        if (left_subtree == nullptr) {
            root = right_subtree;
        } else if (right_subtree == nullptr) {
            root = left_subtree;
        } else {
            // Splay the maximum of the left subtree to the top of that
            // subtree; it then has no right child, so the right subtree
            // can be attached there.
            root = left_subtree;
            SplayNode* max_left = left_subtree;
            while (max_left->right != nullptr) {
                max_left = max_left->right;
            }
            splay(max_left);
            max_left->right = right_subtree;
            right_subtree->parent = max_left;
            root = max_left;
        }

        return true;
    }

    int findMin() {
        if (root == nullptr) return -1;
        
        SplayNode* current = root;
        while (current->left != nullptr) {
            current = current->left;
        }
        
        splay(current);
        return current->key;
    }
    
    int findMax() {
        if (root == nullptr) return -1;
        
        SplayNode* current = root;
        while (current->right != nullptr) {
            current = current->right;
        }
        
        splay(current);
        return current->key;
    }
    
    std::vector<int> inorderTraversal() {
        std::vector<int> result;
        std::vector<SplayNode*> stack;
        SplayNode* current = root;
        while (!stack.empty() || current != nullptr) {
            while (current != nullptr) {
                stack.push_back(current);
                current = current->left;
            }
            current = stack.back();
            stack.pop_back();
            result.push_back(current->key);
            current = current->right;
        }
        return result;
    }

    bool isEmpty() {
        return root == nullptr;
    }

    int size() {
        return sizeIterative();
    }

    // Key at the root, or -1 for an empty tree. For tests.
    int rootKey() {
        return root == nullptr ? -1 : root->key;
    }

    // Checks BST order and parent links. For tests.
    bool isConsistent() {
        if (root != nullptr && root->parent != nullptr) return false;
        std::vector<SplayNode*> stack;
        if (root != nullptr) stack.push_back(root);
        while (!stack.empty()) {
            SplayNode* n = stack.back();
            stack.pop_back();
            if (n->left != nullptr) {
                if (n->left->parent != n || n->left->key >= n->key) return false;
                stack.push_back(n->left);
            }
            if (n->right != nullptr) {
                if (n->right->parent != n || n->right->key <= n->key) return false;
                stack.push_back(n->right);
            }
        }
        return true;
    }
};
