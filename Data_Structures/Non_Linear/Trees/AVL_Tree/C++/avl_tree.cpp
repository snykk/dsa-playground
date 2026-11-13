#include <iostream>
#include <vector>
#include <stdexcept>
#include <cstdlib>
#include <algorithm>
using namespace std;

struct AVLNode {
    int data;
    AVLNode* left;
    AVLNode* right;
    int height;
    
    AVLNode(int val) : data(val), left(nullptr), right(nullptr), height(1) {}
};

class AVLTree {
    AVLNode* root;

    int height(AVLNode* node) {
        if (node == nullptr) return 0;
        return node->height;
    }

    void updateHeight(AVLNode* node) {
        if (node != nullptr) {
            node->height = 1 + max(height(node->left), height(node->right));
        }
    }

    int balanceFactor(AVLNode* node) {
        if (node == nullptr) return 0;
        return height(node->left) - height(node->right);
    }

    AVLNode* rotateRight(AVLNode* y) {
        AVLNode* x = y->left;
        AVLNode* T2 = x->right;

        x->right = y;
        y->left = T2;

        updateHeight(y);
        updateHeight(x);

        return x;
    }

    AVLNode* rotateLeft(AVLNode* x) {
        AVLNode* y = x->right;
        AVLNode* T2 = y->left;

        y->left = x;
        x->right = T2;

        updateHeight(x);
        updateHeight(y);

        return y;
    }

    AVLNode* insertRecursive(AVLNode* node, int data) {
        if (node == nullptr) {
            return new AVLNode(data);
        }

        if (data < node->data) {
            node->left = insertRecursive(node->left, data);
        } else if (data > node->data) {
            node->right = insertRecursive(node->right, data);
        } else {
            return node; // Duplicates not allowed
        }

        updateHeight(node);

        int balance = balanceFactor(node);

        // Left Left Case
        if (balance > 1 && data < node->left->data) {
            return rotateRight(node);
        }

        // Right Right Case
        if (balance < -1 && data > node->right->data) {
            return rotateLeft(node);
        }

        // Left Right Case
        if (balance > 1 && data > node->left->data) {
            node->left = rotateLeft(node->left);
            return rotateRight(node);
        }

        // Right Left Case
        if (balance < -1 && data < node->right->data) {
            node->right = rotateRight(node->right);
            return rotateLeft(node);
        }

        return node;
    }

    bool searchRecursive(AVLNode* node, int data) {
        if (node == nullptr) return false;
        if (node->data == data) return true;
        if (data < node->data) {
            return searchRecursive(node->left, data);
        } else {
            return searchRecursive(node->right, data);
        }
    }

    AVLNode* findMinNode(AVLNode* node) {
        while (node->left != nullptr) {
            node = node->left;
        }
        return node;
    }

    AVLNode* deleteRecursive(AVLNode* node, int data) {
        if (node == nullptr) return node;

        if (data < node->data) {
            node->left = deleteRecursive(node->left, data);
        } else if (data > node->data) {
            node->right = deleteRecursive(node->right, data);
        } else {
            if (node->left == nullptr) {
                AVLNode* temp = node->right;
                delete node;
                return temp;
            } else if (node->right == nullptr) {
                AVLNode* temp = node->left;
                delete node;
                return temp;
            } else {
                AVLNode* successor = findMinNode(node->right);
                node->data = successor->data;
                node->right = deleteRecursive(node->right, successor->data);
            }
        }

        updateHeight(node);

        int balance = balanceFactor(node);

        // Left Left Case
        if (balance > 1 && balanceFactor(node->left) >= 0) {
            return rotateRight(node);
        }

        // Left Right Case
        if (balance > 1 && balanceFactor(node->left) < 0) {
            node->left = rotateLeft(node->left);
            return rotateRight(node);
        }

        // Right Right Case
        if (balance < -1 && balanceFactor(node->right) <= 0) {
            return rotateLeft(node);
        }

        // Right Left Case
        if (balance < -1 && balanceFactor(node->right) > 0) {
            node->right = rotateRight(node->right);
            return rotateLeft(node);
        }

        return node;
    }

    void inorderRecursive(AVLNode* node, vector<int>& result) {
        if (node) {
            inorderRecursive(node->left, result);
            result.push_back(node->data);
            inorderRecursive(node->right, result);
        }
    }

    int sizeRecursive(AVLNode* node) {
        if (node == nullptr) return 0;
        return 1 + sizeRecursive(node->left) + sizeRecursive(node->right);
    }

    void deleteTree(AVLNode* node) {
        if (node) {
            deleteTree(node->left);
            deleteTree(node->right);
            delete node;
        }
    }

    bool isBalancedRecursive(AVLNode* node) {
        if (node == nullptr) return true;
        int balance = balanceFactor(node);
        if (abs(balance) > 1) return false;
        return isBalancedRecursive(node->left) && isBalancedRecursive(node->right);
    }

public:
    AVLTree() : root(nullptr) {}

    // Nodes are owned through raw pointers, so a copy would double free.
    AVLTree(const AVLTree&) = delete;
    AVLTree& operator=(const AVLTree&) = delete;

    ~AVLTree() {
        deleteTree(root);
    }

    void insert(int data) {
        root = insertRecursive(root, data);
    }

    bool search(int data) {
        return searchRecursive(root, data);
    }

    void deleteNode(int data) {
        root = deleteRecursive(root, data);
    }

    int findMin() {
        if (root == nullptr) {
            throw runtime_error("Tree is empty");
        }
        AVLNode* minNode = findMinNode(root);
        return minNode->data;
    }

    int findMax() {
        if (root == nullptr) {
            throw runtime_error("Tree is empty");
        }
        AVLNode* node = root;
        while (node->right != nullptr) {
            node = node->right;
        }
        return node->data;
    }

    vector<int> inorderTraversal() {
        vector<int> result;
        inorderRecursive(root, result);
        return result;
    }

    int height() {
        return height(root);
    }

    int size() {
        return sizeRecursive(root);
    }

    bool isEmpty() {
        return root == nullptr;
    }

    bool isBalanced() {
        return isBalancedRecursive(root);
    }
};

