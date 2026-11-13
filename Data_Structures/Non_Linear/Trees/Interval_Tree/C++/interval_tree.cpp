/**
 * Interval Tree Implementation (C++)
 * 
 * An augmented binary search tree (not self-balancing) keyed by low, with
 * each node storing the maximum high of its subtree. Insert and delete cost
 * O(h), h = height: about log n on random input, up to n on sorted input.
 * Interval(low, high) with low > high swaps the bounds.
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

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
    
    // Recompute node->max from its own interval and its children.
    void recomputeMax(IntervalNode* node) {
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
    
    void searchContainedRecursive(IntervalNode* node, const Interval& query,
                                  std::vector<Interval>& result) {
        if (node == nullptr) return;

        if (query.low <= node->interval.low && node->interval.high <= query.high) {
            result.push_back(node->interval);
        }
        if (node->left != nullptr && node->left->max >= query.low) {
            searchContainedRecursive(node->left, query, result);
        }
        if (node->right != nullptr && node->interval.low <= query.high) {
            searchContainedRecursive(node->right, query, result);
        }
    }

    IntervalNode* findMin(IntervalNode* node) {
        while (node->left != nullptr) node = node->left;
        return node;
    }

    // Removes one node equal to interval; sets removed when it found one.
    IntervalNode* deleteRecursive(IntervalNode* node, const Interval& interval, bool& removed) {
        if (node == nullptr) return nullptr;

        if (interval.low < node->interval.low) {
            node->left = deleteRecursive(node->left, interval, removed);
        } else if (interval.low > node->interval.low || node->interval.high != interval.high) {
            // equal lows go right, so a same-low interval with another high is on the right
            node->right = deleteRecursive(node->right, interval, removed);
        } else {
            removed = true;
            if (node->left == nullptr || node->right == nullptr) {
                IntervalNode* child = node->left != nullptr ? node->left : node->right;
                node->left = node->right = nullptr;
                delete node;
                return child;
            }
            IntervalNode* successor = findMin(node->right);
            node->interval = successor->interval;
            bool unused = false;
            node->right = deleteRecursive(node->right, successor->interval, unused);
        }

        recomputeMax(node);
        return node;
    }

    void inorderRecursive(const IntervalNode* node, std::vector<Interval>& result) const {
        if (node == nullptr) return;
        inorderRecursive(node->left, result);
        result.push_back(node->interval);
        inorderRecursive(node->right, result);
    }

    int sizeRecursive(const IntervalNode* node) const {
        if (node == nullptr) return 0;
        return 1 + sizeRecursive(node->left) + sizeRecursive(node->right);
    }

    // Returns the subtree maximum, or false in ok when some stored max is wrong.
    int checkMax(const IntervalNode* node, bool& ok) const {
        if (node == nullptr) return INT_MIN;
        int best = std::max({node->interval.high, checkMax(node->left, ok), checkMax(node->right, ok)});
        if (node->max != best) ok = false;
        return best;
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
    
    IntervalTree(const IntervalTree&) = delete;
    IntervalTree& operator=(const IntervalTree&) = delete;

    void insert(const Interval& interval) {
        root = insertRecursive(root, interval);
    }

    // Removes one interval equal to the argument. Returns false if none exists.
    bool remove(const Interval& interval) {
        bool removed = false;
        root = deleteRecursive(root, interval, removed);
        return removed;
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
    
    std::vector<Interval> searchContainedIn(const Interval& query) {
        std::vector<Interval> result;
        searchContainedRecursive(root, query, result);
        return result;
    }

    // All intervals sorted by low (ties in insertion order).
    std::vector<Interval> inorderTraversal() const {
        std::vector<Interval> result;
        inorderRecursive(root, result);
        return result;
    }

    int size() const {
        return sizeRecursive(root);
    }

    // True when every node's max equals the largest high in its subtree.
    bool validateMax() const {
        bool ok = true;
        checkMax(root, ok);
        return ok;
    }

    bool isEmpty() {
        return root == nullptr;
    }
};

