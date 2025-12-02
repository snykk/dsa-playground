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

class BinaryTree {
    TreeNode* root;

    TreeNode* searchRecursive(TreeNode* node, int data) {
        if (node == nullptr) return nullptr;
        if (node->data == data) return node;
        TreeNode* left = searchRecursive(node->left, data);
        if (left) return left;
        return searchRecursive(node->right, data);
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
    BinaryTree() : root(nullptr) {}

    ~BinaryTree() {
        deleteTree(root);
    }

    void insert(int data) {
        if (root == nullptr) {
            root = new TreeNode(data);
            return;
        }

        queue<TreeNode*> q;
        q.push(root);

        while (!q.empty()) {
            TreeNode* node = q.front();
            q.pop();

            if (node->left == nullptr) {
                node->left = new TreeNode(data);
                return;
            } else if (node->right == nullptr) {
                node->right = new TreeNode(data);
                return;
            } else {
                q.push(node->left);
                q.push(node->right);
            }
        }
    }

    bool search(int data) {
        return searchRecursive(root, data) != nullptr;
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

