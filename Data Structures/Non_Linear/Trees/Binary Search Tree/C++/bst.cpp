#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;
    
    TreeNode(int val) : data(val), left(nullptr), right(nullptr) {}
};

class BinarySearchTree {
    TreeNode* root;

    TreeNode* insertRecursive(TreeNode* node, int data) {
        if (node == nullptr) {
            return new TreeNode(data);
        }
        
        if (data < node->data) {
            node->left = insertRecursive(node->left, data);
        } else if (data > node->data) {
            node->right = insertRecursive(node->right, data);
        }
        // If data == node->data, we don't insert duplicates
        
        return node;
    }

    bool searchRecursive(TreeNode* node, int data) {
        if (node == nullptr) return false;
        if (node->data == data) return true;
        if (data < node->data) {
            return searchRecursive(node->left, data);
        } else {
            return searchRecursive(node->right, data);
        }
    }

    TreeNode* deleteRecursive(TreeNode* node, int data) {
        if (node == nullptr) return nullptr;
        
        if (data < node->data) {
            node->left = deleteRecursive(node->left, data);
        } else if (data > node->data) {
            node->right = deleteRecursive(node->right, data);
        } else {
            // Node to delete found
            // Case 1: No child
            if (node->left == nullptr && node->right == nullptr) {
                delete node;
                return nullptr;
            }
            // Case 2: One child
            else if (node->left == nullptr) {
                TreeNode* temp = node->right;
                delete node;
                return temp;
            } else if (node->right == nullptr) {
                TreeNode* temp = node->left;
                delete node;
                return temp;
            }
            // Case 3: Two children - find inorder successor
            else {
                TreeNode* successor = findMinNode(node->right);
                node->data = successor->data;
                node->right = deleteRecursive(node->right, successor->data);
            }
        }
        
        return node;
    }

    TreeNode* findMinNode(TreeNode* node) {
        while (node->left != nullptr) {
            node = node->left;
        }
        return node;
    }

    TreeNode* findMaxNode(TreeNode* node) {
        while (node->right != nullptr) {
            node = node->right;
        }
        return node;
    }

    void inorderRecursive(TreeNode* node, vector<int>& result) {
        if (node) {
            inorderRecursive(node->left, result);
            result.push_back(node->data);
            inorderRecursive(node->right, result);
        }
    }

    void preorderRecursive(TreeNode* node, vector<int>& result) {
        if (node) {
            result.push_back(node->data);
            preorderRecursive(node->left, result);
            preorderRecursive(node->right, result);
        }
    }

    void postorderRecursive(TreeNode* node, vector<int>& result) {
        if (node) {
            postorderRecursive(node->left, result);
            postorderRecursive(node->right, result);
            result.push_back(node->data);
        }
    }

    int heightRecursive(TreeNode* node) {
        if (node == nullptr) return -1;
        return 1 + max(heightRecursive(node->left), heightRecursive(node->right));
    }

    int sizeRecursive(TreeNode* node) {
        if (node == nullptr) return 0;
        return 1 + sizeRecursive(node->left) + sizeRecursive(node->right);
    }

    void deleteTree(TreeNode* node) {
        if (node) {
            deleteTree(node->left);
            deleteTree(node->right);
            delete node;
        }
    }

public:
    BinarySearchTree() : root(nullptr) {}

    ~BinarySearchTree() {
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
        TreeNode* minNode = findMinNode(root);
        return minNode->data;
    }

    int findMax() {
        if (root == nullptr) {
            throw runtime_error("Tree is empty");
        }
        TreeNode* maxNode = findMaxNode(root);
        return maxNode->data;
    }

    vector<int> inorderTraversal() {
        vector<int> result;
        inorderRecursive(root, result);
        return result;
    }

    vector<int> preorderTraversal() {
        vector<int> result;
        preorderRecursive(root, result);
        return result;
    }

    vector<int> postorderTraversal() {
        vector<int> result;
        postorderRecursive(root, result);
        return result;
    }

    vector<int> levelOrderTraversal() {
        vector<int> result;
        if (root == nullptr) return result;

        queue<TreeNode*> q;
        q.push(root);

        while (!q.empty()) {
            TreeNode* node = q.front();
            q.pop();
            result.push_back(node->data);

            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }

        return result;
    }

    int height() {
        return heightRecursive(root);
    }

    int size() {
        return sizeRecursive(root);
    }

    bool isEmpty() {
        return root == nullptr;
    }
};

