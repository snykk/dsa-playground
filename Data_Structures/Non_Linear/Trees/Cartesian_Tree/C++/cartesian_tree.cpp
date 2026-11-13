/**
 * Cartesian Tree Implementation (C++)
 * 
 * A binary tree derived from a sequence with min-heap property (parent <= children)
 * and inorder traversal that produces the original sequence.
 */

#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>
#include <climits>

class CartesianNode {
public:
    int value;
    int index;
    CartesianNode* left;
    CartesianNode* right;
    
    CartesianNode(int v, int i) 
        : value(v), index(i), left(nullptr), right(nullptr) {}
};

class CartesianTree {
public:
    CartesianNode* root;
private:
    std::vector<int> originalArray;
    
    // The helpers below are iterative: sorted input builds a chain of n
    // nodes, and recursion on it would overflow the native stack.
    void inorderIterative(CartesianNode* node, std::vector<int>& result) {
        std::vector<CartesianNode*> stack;
        while (!stack.empty() || node != nullptr) {
            while (node != nullptr) {
                stack.push_back(node);
                node = node->left;
            }
            node = stack.back();
            stack.pop_back();
            result.push_back(node->value);
            node = node->right;
        }
    }

    void preorderIterative(CartesianNode* node, std::vector<int>& result) {
        std::vector<CartesianNode*> stack;
        if (node != nullptr) stack.push_back(node);
        while (!stack.empty()) {
            node = stack.back();
            stack.pop_back();
            result.push_back(node->value);
            if (node->right != nullptr) stack.push_back(node->right);
            if (node->left != nullptr) stack.push_back(node->left);
        }
    }

    void postorderIterative(CartesianNode* node, std::vector<int>& result) {
        std::vector<CartesianNode*> stack;
        size_t start = result.size();
        if (node != nullptr) stack.push_back(node);
        while (!stack.empty()) {
            node = stack.back();
            stack.pop_back();
            result.push_back(node->value);
            if (node->left != nullptr) stack.push_back(node->left);
            if (node->right != nullptr) stack.push_back(node->right);
        }
        std::reverse(result.begin() + start, result.end());
    }

    int heightIterative(CartesianNode* node) {
        int height = -1;
        std::vector<CartesianNode*> level;
        if (node != nullptr) level.push_back(node);
        while (!level.empty()) {
            height++;
            std::vector<CartesianNode*> next;
            for (CartesianNode* n : level) {
                if (n->left != nullptr) next.push_back(n->left);
                if (n->right != nullptr) next.push_back(n->right);
            }
            level.swap(next);
        }
        return height;
    }

    int sizeIterative(CartesianNode* node) {
        int count = 0;
        std::vector<CartesianNode*> stack;
        if (node != nullptr) stack.push_back(node);
        while (!stack.empty()) {
            node = stack.back();
            stack.pop_back();
            count++;
            if (node->left != nullptr) stack.push_back(node->left);
            if (node->right != nullptr) stack.push_back(node->right);
        }
        return count;
    }

    void deleteTree(CartesianNode* node) {
        std::vector<CartesianNode*> stack;
        if (node != nullptr) stack.push_back(node);
        while (!stack.empty()) {
            node = stack.back();
            stack.pop_back();
            if (node->left != nullptr) stack.push_back(node->left);
            if (node->right != nullptr) stack.push_back(node->right);
            delete node;
        }
    }

public:
    CartesianTree() : root(nullptr) {}
    
    CartesianTree(const std::vector<int>& array) : root(nullptr) {
        buildFromArray(array);
    }
    
    // Nodes are owned through raw pointers, so a copy would double free.
    CartesianTree(const CartesianTree&) = delete;
    CartesianTree& operator=(const CartesianTree&) = delete;

    ~CartesianTree() {
        deleteTree(root);
    }
    
    void buildFromArray(const std::vector<int>& array) {
        deleteTree(root);  // free any previous tree instead of leaking it
        root = nullptr;
        originalArray = array;
        if (array.empty()) {
            root = nullptr;
            return;
        }
        
        std::stack<CartesianNode*> stack;
        
        for (size_t i = 0; i < array.size(); ++i) {
            CartesianNode* node = new CartesianNode(array[i], (int)i);
            CartesianNode* lastPopped = nullptr;
            
            while (!stack.empty() && stack.top()->value > array[i]) {
                lastPopped = stack.top();
                stack.pop();
            }
            
            if (lastPopped != nullptr) {
                node->left = lastPopped;
            }
            
            if (!stack.empty()) {
                stack.top()->right = node;
            }
            
            stack.push(node);
        }
        
        // Root is the bottom of the stack
        while (stack.size() > 1) {
            stack.pop();
        }
        root = stack.empty() ? nullptr : stack.top();
    }
    
    std::vector<int> inorderTraversal() {
        std::vector<int> result;
        inorderIterative(root, result);
        return result;
    }
    
    std::vector<int> preorderTraversal() {
        std::vector<int> result;
        preorderIterative(root, result);
        return result;
    }
    
    std::vector<int> postorderTraversal() {
        std::vector<int> result;
        postorderIterative(root, result);
        return result;
    }
    
    // Index of the minimum in array[left..right] (leftmost on ties): the
    // lowest common ancestor of the two end positions. O(h). -1 if invalid.
    int getMinIndex(int left, int right) {
        if (root == nullptr || left < 0 || right >= (int)originalArray.size() || left > right) {
            return -1;
        }
        CartesianNode* node = root;
        while (true) {
            if (node->index < left) {
                node = node->right;
            } else if (node->index > right) {
                node = node->left;
            } else {
                return node->index;
            }
        }
    }

    bool isEmpty() {
        return root == nullptr;
    }
    
    int height() {
        return heightIterative(root);
    }
    
    int size() {
        return sizeIterative(root);
    }
    
    int getRootValue() {
        return root != nullptr ? root->value : INT_MIN;
    }
};

