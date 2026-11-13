#include <vector>
#include <stdexcept>
#include <map>
#include <algorithm>
using namespace std;

struct FibonacciHeapNode {
    int key;
    int degree;
    FibonacciHeapNode* parent;
    FibonacciHeapNode* child;
    FibonacciHeapNode* left;
    FibonacciHeapNode* right;
    bool marked;
    
    FibonacciHeapNode(int k) : key(k), degree(0), parent(nullptr), 
                               child(nullptr), left(this), right(this), marked(false) {}
};

class FibonacciHeap {
    FibonacciHeapNode* min_node;
    int count;

    void add_to_root_list(FibonacciHeapNode* node) {
        if (min_node == nullptr) return;
        
        node->left = min_node;
        node->right = min_node->right;
        min_node->right->left = node;
        min_node->right = node;
    }

    void remove_from_root_list(FibonacciHeapNode* node) {
        node->left->right = node->right;
        node->right->left = node->left;
    }

    void link(FibonacciHeapNode* child, FibonacciHeapNode* parent) {
        remove_from_root_list(child);
        child->parent = parent;
        child->marked = false;
        
        if (parent->child == nullptr) {
            parent->child = child;
            child->left = child;
            child->right = child;
        } else {
            child->left = parent->child;
            child->right = parent->child->right;
            parent->child->right->left = child;
            parent->child->right = child;
        }
        
        parent->degree++;
    }

    void consolidate() {
        if (min_node == nullptr) return;
        
        map<int, FibonacciHeapNode*> degree_table;
        vector<FibonacciHeapNode*> nodes_to_process;
        
        FibonacciHeapNode* current = min_node;
        do {
            nodes_to_process.push_back(current);
            current = current->right;
        } while (current != min_node);
        
        for (FibonacciHeapNode* node : nodes_to_process) {
            int degree = node->degree;
            while (degree_table.find(degree) != degree_table.end()) {
                FibonacciHeapNode* other = degree_table[degree];
                if (node->key > other->key) {
                    swap(node, other);
                }
                link(other, node);
                degree_table.erase(degree);
                degree++;
            }
            degree_table[degree] = node;
        }
        
        min_node = nullptr;
        for (auto& pair : degree_table) {
            FibonacciHeapNode* node = pair.second;
            if (min_node == nullptr || node->key < min_node->key) {
                min_node = node;
            }
        }
    }

public:
    FibonacciHeap() : min_node(nullptr), count(0) {}

    ~FibonacciHeap() {
        clear();
    }

    // Nodes are owned through raw pointers: copying would double free.
    FibonacciHeap(const FibonacciHeap&) = delete;
    FibonacciHeap& operator=(const FibonacciHeap&) = delete;

    bool is_empty() {
        return min_node == nullptr;
    }

    int size() {
        return count;
    }

    void insert(int key) {
        FibonacciHeapNode* node = new FibonacciHeapNode(key);
        
        if (min_node == nullptr) {
            min_node = node;
        } else {
            add_to_root_list(node);
            if (key < min_node->key) {
                min_node = node;
            }
        }
        
        count++;
    }

    int extract_min() {
        if (is_empty()) {
            throw runtime_error("Heap is empty");
        }
        
        FibonacciHeapNode* min = min_node;
        int min_key = min->key;
        
        if (min->child != nullptr) {
            FibonacciHeapNode* child = min->child;
            do {
                FibonacciHeapNode* next_child = child->right;
                child->parent = nullptr;
                add_to_root_list(child);
                child = next_child;
            } while (child != min->child);
        }
        
        if (min == min->right) {
            min_node = nullptr;
        } else {
            min_node = min->right;
            remove_from_root_list(min);
            consolidate();
        }
        
        delete min;
        count--;
        return min_key;
    }

    int peek() {
        if (is_empty()) {
            throw runtime_error("Heap is empty");
        }
        return min_node->key;
    }

    void clear() {
        while (!is_empty()) {
            extract_min();
        }
    }
};

