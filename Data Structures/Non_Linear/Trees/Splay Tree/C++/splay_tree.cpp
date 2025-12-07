/**
 * Splay Tree Implementation (C++)
 * 
 * A self-adjusting binary search tree that moves recently accessed elements
 * to the root through rotations (splaying).
 */

#include <iostream>
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
    
    int sizeRecursive(SplayNode* node) {
        if (node == nullptr) return 0;
        return 1 + sizeRecursive(node->left) + sizeRecursive(node->right);
    }
    
    void inorderRecursive(SplayNode* node, std::vector<int>& result) {
        if (node != nullptr) {
            inorderRecursive(node->left, result);
            result.push_back(node->key);
            inorderRecursive(node->right, result);
        }
    }
    
    void deleteTree(SplayNode* node) {
        if (node != nullptr) {
            deleteTree(node->left);
            deleteTree(node->right);
            delete node;
        }
    }
    
public:
    SplayTree() : root(nullptr) {}
    
    ~SplayTree() {
        deleteTree(root);
    }
    
    // Copy constructor and assignment operator (rule of three)
    SplayTree(const SplayTree& other) {
        // Simplified: just copy root pointer (not deep copy)
        root = nullptr;
    }
    
    SplayTree& operator=(const SplayTree& other) {
        if (this != &other) {
            deleteTree(root);
            root = nullptr;
        }
        return *this;
    }
    
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
        if (node != nullptr && node->key == key) {
            splay(node);
            return node->value;
        }
        return "";
    }
    
    bool remove(int key) {
        if (root == nullptr) return false;
        
        SplayNode* node = searchNode(key);
        if (node == nullptr || node->key != key) {
            return false;
        }
        
        // Splay the node to root
        splay(node);
        
        // If node has no children
        if (node->left == nullptr && node->right == nullptr) {
            delete node;
            root = nullptr;
        }
        // If node has only right child
        else if (node->left == nullptr) {
            root = node->right;
            root->parent = nullptr;
            delete node;
        }
        // If node has only left child
        else if (node->right == nullptr) {
            root = node->left;
            root->parent = nullptr;
            delete node;
        }
        // If node has both children
        else {
            // Find maximum in left subtree
            SplayNode* max_left = node->left;
            while (max_left->right != nullptr) {
                max_left = max_left->right;
            }
            
            // Splay max_left to root of left subtree
            if (max_left->parent != node) {
                splay(max_left);
                max_left->parent = nullptr;
            }
            
            // Attach right subtree to max_left
            max_left->right = node->right;
            if (node->right != nullptr) {
                node->right->parent = max_left;
            }
            
            root = max_left;
            delete node;
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
        inorderRecursive(root, result);
        return result;
    }
    
    bool isEmpty() {
        return root == nullptr;
    }
    
    int size() {
        return sizeRecursive(root);
    }
};

