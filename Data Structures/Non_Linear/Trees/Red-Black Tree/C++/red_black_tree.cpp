#include <iostream>
#include <vector>
using namespace std;

enum Color { RED, BLACK };

struct RBNode {
    int data;
    RBNode* left;
    RBNode* right;
    RBNode* parent;
    Color color;
    
    RBNode(int val, Color c = RED) : data(val), left(nullptr), right(nullptr), 
                                     parent(nullptr), color(c) {}
};

class RedBlackTree {
    RBNode* root;
    RBNode* NIL;

    void leftRotate(RBNode* x) {
        RBNode* y = x->right;
        x->right = y->left;
        if (y->left != NIL) y->left->parent = x;
        y->parent = x->parent;
        if (x->parent == NIL) root = y;
        else if (x == x->parent->left) x->parent->left = y;
        else x->parent->right = y;
        y->left = x;
        x->parent = y;
    }

    void rightRotate(RBNode* y) {
        RBNode* x = y->left;
        y->left = x->right;
        if (x->right != NIL) x->right->parent = y;
        x->parent = y->parent;
        if (y->parent == NIL) root = x;
        else if (y == y->parent->left) y->parent->left = x;
        else y->parent->right = x;
        x->right = y;
        y->parent = x;
    }

    void insertFixup(RBNode* z) {
        while (z->parent->color == RED) {
            if (z->parent == z->parent->parent->left) {
                RBNode* y = z->parent->parent->right;
                if (y->color == RED) {
                    z->parent->color = BLACK;
                    y->color = BLACK;
                    z->parent->parent->color = RED;
                    z = z->parent->parent;
                } else {
                    if (z == z->parent->right) {
                        z = z->parent;
                        leftRotate(z);
                    }
                    z->parent->color = BLACK;
                    z->parent->parent->color = RED;
                    rightRotate(z->parent->parent);
                }
            } else {
                RBNode* y = z->parent->parent->left;
                if (y->color == RED) {
                    z->parent->color = BLACK;
                    y->color = BLACK;
                    z->parent->parent->color = RED;
                    z = z->parent->parent;
                } else {
                    if (z == z->parent->left) {
                        z = z->parent;
                        rightRotate(z);
                    }
                    z->parent->color = BLACK;
                    z->parent->parent->color = RED;
                    leftRotate(z->parent->parent);
                }
            }
        }
        root->color = BLACK;
    }

    bool searchRecursive(RBNode* node, int data) {
        if (node == NIL) return false;
        if (node->data == data) return true;
        if (data < node->data) return searchRecursive(node->left, data);
        return searchRecursive(node->right, data);
    }

    void inorderRecursive(RBNode* node, vector<int>& result) {
        if (node != NIL) {
            inorderRecursive(node->left, result);
            result.push_back(node->data);
            inorderRecursive(node->right, result);
        }
    }

    int sizeRecursive(RBNode* node) {
        if (node == NIL) return 0;
        return 1 + sizeRecursive(node->left) + sizeRecursive(node->right);
    }

    void deleteTree(RBNode* node) {
        if (node != NIL) {
            deleteTree(node->left);
            deleteTree(node->right);
            delete node;
        }
    }

public:
    RedBlackTree() {
        NIL = new RBNode(0, BLACK);
        root = NIL;
    }

    ~RedBlackTree() {
        deleteTree(root);
        delete NIL;
    }

    void insert(int data) {
        RBNode* z = new RBNode(data, RED);
        z->left = NIL;
        z->right = NIL;
        
        RBNode* y = NIL;
        RBNode* x = root;
        
        while (x != NIL) {
            y = x;
            if (z->data < x->data) x = x->left;
            else x = x->right;
        }
        
        z->parent = y;
        if (y == NIL) root = z;
        else if (z->data < y->data) y->left = z;
        else y->right = z;
        
        insertFixup(z);
    }

    bool search(int data) {
        return searchRecursive(root, data);
    }

    vector<int> inorderTraversal() {
        vector<int> result;
        inorderRecursive(root, result);
        return result;
    }

    int size() {
        return sizeRecursive(root);
    }

    bool isEmpty() {
        return root == NIL;
    }
};

