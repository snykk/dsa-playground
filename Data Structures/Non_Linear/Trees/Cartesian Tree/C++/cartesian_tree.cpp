/**
 * Cartesian Tree Implementation (C++)
 * 
 * A binary tree derived from a sequence with min-heap property
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
private:
    CartesianNode* root;
    std::vector<int> originalArray;
    
    void inorderRecursive(CartesianNode* node, std::vector<int>& result) {
        if (node != nullptr) {
            inorderRecursive(node->left, result);
            result.push_back(node->value);
            inorderRecursive(node->right, result);
        }
    }
    
    void preorderRecursive(CartesianNode* node, std::vector<int>& result) {
        if (node != nullptr) {
            result.push_back(node->value);
            preorderRecursive(node->left, result);
            preorderRecursive(node->right, result);
        }
    }
    
    void postorderRecursive(CartesianNode* node, std::vector<int>& result) {
        if (node != nullptr) {
            postorderRecursive(node->left, result);
            postorderRecursive(node->right, result);
            result.push_back(node->value);
        }
    }
    
    int heightRecursive(CartesianNode* node) {
        if (node == nullptr) return -1;
        return 1 + std::max(heightRecursive(node->left), 
                           heightRecursive(node->right));
    }
    
    int sizeRecursive(CartesianNode* node) {
        if (node == nullptr) return 0;
        return 1 + sizeRecursive(node->left) + sizeRecursive(node->right);
    }
    
    void deleteTree(CartesianNode* node) {
        if (node != nullptr) {
            deleteTree(node->left);
            deleteTree(node->right);
            delete node;
        }
    }
    
    CartesianNode* findNodeByIndex(CartesianNode* node, int index) {
        if (node == nullptr) return nullptr;
        if (node->index == index) return node;
        if (index < node->index) {
            return findNodeByIndex(node->left, index);
        } else {
            return findNodeByIndex(node->right, index);
        }
    }
    
    int findMinInRange(CartesianNode* node, int left, int right) {
        if (node == nullptr) return -1;
        
        int candidate = -1;
        if (left <= node->index && node->index <= right) {
            candidate = node->index;
        }
        
        if (node->left != nullptr && node->index > left) {
            int leftCandidate = findMinInRange(node->left, left, right);
            if (leftCandidate != -1) {
                if (candidate == -1 || 
                    originalArray[candidate] > originalArray[leftCandidate]) {
                    candidate = leftCandidate;
                }
            }
        }
        
        if (node->right != nullptr && node->index < right) {
            int rightCandidate = findMinInRange(node->right, left, right);
            if (rightCandidate != -1) {
                if (candidate == -1 || 
                    originalArray[candidate] > originalArray[rightCandidate]) {
                    candidate = rightCandidate;
                }
            }
        }
        
        return candidate;
    }
    
public:
    CartesianTree() : root(nullptr) {}
    
    CartesianTree(const std::vector<int>& array) : root(nullptr) {
        buildFromArray(array);
    }
    
    ~CartesianTree() {
        deleteTree(root);
    }
    
    void buildFromArray(const std::vector<int>& array) {
        originalArray = array;
        if (array.empty()) {
            root = nullptr;
            return;
        }
        
        std::stack<CartesianNode*> stack;
        
        for (size_t i = 0; i < array.size(); ++i) {
            CartesianNode* node = new CartesianNode(array[i], i);
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
        inorderRecursive(root, result);
        return result;
    }
    
    std::vector<int> preorderTraversal() {
        std::vector<int> result;
        preorderRecursive(root, result);
        return result;
    }
    
    std::vector<int> postorderTraversal() {
        std::vector<int> result;
        postorderRecursive(root, result);
        return result;
    }
    
    int getMinIndex(int left, int right) {
        if (root == nullptr || left < 0 || right >= (int)originalArray.size()) {
            return -1;
        }
        return findMinInRange(root, left, right);
    }
    
    bool isEmpty() {
        return root == nullptr;
    }
    
    int height() {
        return heightRecursive(root);
    }
    
    int size() {
        return sizeRecursive(root);
    }
    
    int getRootValue() {
        return root != nullptr ? root->value : INT_MIN;
    }
};

