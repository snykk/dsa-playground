/**
 * Interval Tree Implementation (C++)
 * 
 * A data structure for storing intervals and efficiently querying
 * intervals that overlap with a given interval or point.
 */

#include <iostream>
#include <vector>
#include <algorithm>

struct Interval {
    int low;
    int high;
    
    Interval(int l, int h) : low(l), high(h) {
        if (low > high) {
            std::swap(low, high);
        }
    }
    
    bool overlaps(const Interval& other) const {
        return !(high < other.low || other.high < low);
    }
    
    bool containsPoint(int point) const {
        return low <= point && point <= high;
    }
};

class IntervalNode {
public:
    Interval interval;
    int max;
    IntervalNode* left;
    IntervalNode* right;
    
    IntervalNode(const Interval& i) 
        : interval(i), max(i.high), left(nullptr), right(nullptr) {}
};

class IntervalTree {
private:
    IntervalNode* root;
    
    IntervalNode* insertRecursive(IntervalNode* node, const Interval& interval) {
        if (node == nullptr) {
            return new IntervalNode(interval);
        }
        
        if (interval.low < node->interval.low) {
            node->left = insertRecursive(node->left, interval);
        } else {
            node->right = insertRecursive(node->right, interval);
        }
        
        if (interval.high > node->max) {
            node->max = interval.high;
        }
        
        return node;
    }
    
    void updateMax(IntervalNode* node) {
        if (node == nullptr) return;
        
        updateMax(node->left);
        updateMax(node->right);
        
        node->max = node->interval.high;
        if (node->left != nullptr && node->left->max > node->max) {
            node->max = node->left->max;
        }
        if (node->right != nullptr && node->right->max > node->max) {
            node->max = node->right->max;
        }
    }
    
    void searchOverlappingRecursive(IntervalNode* node, const Interval& query, 
                                    std::vector<Interval>& result) {
        if (node == nullptr) return;
        
        if (node->interval.overlaps(query)) {
            result.push_back(node->interval);
        }
        
        if (node->left != nullptr && node->left->max >= query.low) {
            searchOverlappingRecursive(node->left, query, result);
        }
        
        if (node->right != nullptr && node->interval.low <= query.high) {
            searchOverlappingRecursive(node->right, query, result);
        }
    }
    
    void deleteTree(IntervalNode* node) {
        if (node != nullptr) {
            deleteTree(node->left);
            deleteTree(node->right);
            delete node;
        }
    }
    
public:
    IntervalTree() : root(nullptr) {}
    
    ~IntervalTree() {
        deleteTree(root);
    }
    
    void insert(const Interval& interval) {
        root = insertRecursive(root, interval);
        updateMax(root);
    }
    
    std::vector<Interval> searchOverlapping(const Interval& query) {
        std::vector<Interval> result;
        searchOverlappingRecursive(root, query, result);
        return result;
    }
    
    std::vector<Interval> searchContainingPoint(int point) {
        Interval query(point, point);
        return searchOverlapping(query);
    }
    
    bool isEmpty() {
        return root == nullptr;
    }
};

