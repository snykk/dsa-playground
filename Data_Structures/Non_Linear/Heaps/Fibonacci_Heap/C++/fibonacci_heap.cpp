#include <vector>
#include <stdexcept>
#include <map>
#include <memory>
#include <utility>
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
    // False once the node has left its heap (extract_min, erase, clear):
    // a handle to it is then stale, and decrease_key and erase reject it.
    bool in_heap;
    // The heap's share of the node's ownership. Insert sets it; leaving the
    // heap gives it up, so afterwards only handles keep the node alive.
    shared_ptr<FibonacciHeapNode> self;

    FibonacciHeapNode(int k) : key(k), degree(0), parent(nullptr),
                               child(nullptr), left(this), right(this), marked(false), in_heap(true) {}
};

// What insert returns: a shared reference to the node, to pass to
// decrease_key and erase. It stays safe to hold after the node leaves the
// heap, or after the heap is destroyed: it then reports in_heap() == false.
class FibonacciHeapHandle {
public:
    FibonacciHeapHandle() = default;

    // The node's current key; throws std::invalid_argument for an empty handle.
    int key() const {
        if (!node) throw invalid_argument("empty handle");
        return node->key;
    }

    bool in_heap() const {
        return node != nullptr && node->in_heap;
    }

private:
    friend class FibonacciHeap;
    explicit FibonacciHeapHandle(shared_ptr<FibonacciHeapNode> n) : node(std::move(n)) {}
    shared_ptr<FibonacciHeapNode> node;
};

class FibonacciHeap {
private:
    FibonacciHeapNode* min_node;
    int count;
    // Work counters for the amortized analysis: trees linked by consolidation
    // and nodes cut from their parent.
    long long links;
    long long cuts;

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
        links++;
    }

    void consolidate() {
        if (min_node == nullptr) return;

        map<int, FibonacciHeapNode*> degree_table;
        // The degrees in the insertion order of Python's dict degree_table: a degree
        // that is erased and stored again moves to the end. The new minimum is chosen
        // in this order, so equal keys resolve to the same node as in Python.
        vector<int> degree_order;
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
                degree_order.erase(find(degree_order.begin(), degree_order.end(), degree));
                degree++;
            }
            degree_table[degree] = node;
            degree_order.push_back(degree);
        }

        min_node = nullptr;
        for (int degree : degree_order) {
            FibonacciHeapNode* node = degree_table[degree];
            if (min_node == nullptr || node->key < min_node->key) {
                min_node = node;
            }
        }
    }

    // The node left the heap: its handles turn stale and the heap gives up its
    // ownership. That may free the node, so the caller must not touch it after.
    static void detach(FibonacciHeapNode* node) {
        node->in_heap = false;
        node->parent = nullptr;
        node->child = nullptr;
        node->left = node;
        node->right = node;
        shared_ptr<FibonacciHeapNode> owner;
        owner.swap(node->self);
    }

    FibonacciHeapNode* checked(const FibonacciHeapHandle& handle) const {
        if (!handle.in_heap()) {
            throw invalid_argument("stale handle: the node is no longer in a heap");
        }
        return handle.node.get();
    }

    // Move node (with its subtree) from parent's children to the root list.
    void cut(FibonacciHeapNode* node, FibonacciHeapNode* parent) {
        if (node->right == node) {
            parent->child = nullptr;
        } else {
            if (parent->child == node) parent->child = node->right;
            node->left->right = node->right;
            node->right->left = node->left;
        }
        parent->degree--;
        add_to_root_list(node);
        node->parent = nullptr;
        node->marked = false;
        cuts++;
    }

    // A non-root node that loses its first child is marked; a marked node that
    // loses a second child is cut too, and the walk goes on with its parent.
    // Roots are never marked.
    void cascading_cut(FibonacciHeapNode* node) {
        FibonacciHeapNode* parent = node->parent;
        while (parent != nullptr) {
            if (!node->marked) {
                node->marked = true;
                return;
            }
            cut(node, parent);
            node = parent;
            parent = node->parent;
        }
    }

public:
    FibonacciHeap() : min_node(nullptr), count(0), links(0), cuts(0) {}

    ~FibonacciHeap() {
        clear();
    }

    // Nodes are linked through raw pointers: a copy would share them.
    FibonacciHeap(const FibonacciHeap&) = delete;
    FibonacciHeap& operator=(const FibonacciHeap&) = delete;

    bool is_empty() {
        return min_node == nullptr;
    }

    int size() {
        return count;
    }

    long long link_count() const { return links; }
    long long cut_count() const { return cuts; }

    FibonacciHeapHandle insert(int key) {
        shared_ptr<FibonacciHeapNode> owned = make_shared<FibonacciHeapNode>(key);
        FibonacciHeapNode* node = owned.get();
        node->self = owned;

        if (min_node == nullptr) {
            min_node = node;
        } else {
            add_to_root_list(node);
            if (key < min_node->key) {
                min_node = node;
            }
        }

        count++;
        return FibonacciHeapHandle(owned);
    }

    int extract_min() {
        if (is_empty()) {
            throw runtime_error("Heap is empty");
        }

        FibonacciHeapNode* min = min_node;
        int min_key = min->key;

        // Move the children to the root list; a root is never marked.
        if (min->child != nullptr) {
            FibonacciHeapNode* child = min->child;
            do {
                FibonacciHeapNode* next_child = child->right;
                child->parent = nullptr;
                child->marked = false;
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

        detach(min);
        count--;
        return min_key;
    }

    int peek() {
        if (is_empty()) {
            throw runtime_error("Heap is empty");
        }
        return min_node->key;
    }

    // Lower the key behind a handle. If the node now beats its parent, cut it
    // to the root list, then cut each marked ancestor (cascading cut). Throws
    // std::invalid_argument for a stale handle or a larger key.
    void decrease_key(const FibonacciHeapHandle& handle, int new_key) {
        FibonacciHeapNode* node = checked(handle);
        if (new_key > node->key) {
            throw invalid_argument("new key is greater than the current key");
        }
        node->key = new_key;
        FibonacciHeapNode* parent = node->parent;
        if (parent != nullptr && node->key < parent->key) {
            cut(node, parent);
            cascading_cut(parent);
        }
        if (node->key < min_node->key) {
            min_node = node;
        }
    }

    // Remove the node behind a handle (delete is a C++ keyword, hence erase).
    // Decrease-key to minus infinity without a sentinel: cut the node like a
    // decreased one, make it min_node without changing its key, extract it.
    // Throws std::invalid_argument for a stale handle.
    void erase(const FibonacciHeapHandle& handle) {
        FibonacciHeapNode* node = checked(handle);
        FibonacciHeapNode* parent = node->parent;
        if (parent != nullptr) {
            cut(node, parent);
            cascading_cut(parent);
        }
        min_node = node;
        extract_min();
    }

    // Move every node of other into this heap in O(1): other's root list is
    // spliced in right after min_node, and other is left empty. Throws
    // std::invalid_argument when other is this heap.
    void merge(FibonacciHeap& other) {
        if (&other == this) {
            throw invalid_argument("cannot merge a heap with itself");
        }
        if (other.min_node != nullptr) {
            if (min_node == nullptr) {
                min_node = other.min_node;
            } else {
                FibonacciHeapNode* first = other.min_node;
                FibonacciHeapNode* last = first->left;
                FibonacciHeapNode* after = min_node->right;
                min_node->right = first;
                first->left = min_node;
                last->right = after;
                after->left = last;
                if (first->key < min_node->key) {
                    min_node = first;
                }
            }
            count += other.count;
        }
        other.min_node = nullptr;
        other.count = 0;
    }

    // Remove every node in O(n): every handle turns stale, and the nodes no
    // handle refers to are freed.
    void clear() {
        vector<FibonacciHeapNode*> nodes;
        vector<FibonacciHeapNode*> rings;
        if (min_node != nullptr) rings.push_back(min_node);
        while (!rings.empty()) {
            FibonacciHeapNode* start = rings.back();
            rings.pop_back();
            FibonacciHeapNode* current = start;
            do {
                nodes.push_back(current);
                if (current->child != nullptr) rings.push_back(current->child);
                current = current->right;
            } while (current != start);
        }
        for (FibonacciHeapNode* node : nodes) {
            detach(node);
        }
        min_node = nullptr;
        count = 0;
    }
};

#ifndef IS_TEST_BUILD
#include <iostream>

int main() {
    FibonacciHeap heap;
    heap.insert(5);
    heap.insert(3);
    FibonacciHeapHandle seven = heap.insert(7);
    heap.decrease_key(seven, 1);
    cout << "Peek: " << heap.peek() << endl;  // 1
    return 0;
}
#endif
