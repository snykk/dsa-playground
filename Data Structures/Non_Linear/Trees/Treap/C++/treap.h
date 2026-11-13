// Treap: randomized self-balancing BST via split/merge.
// Expected O(log n) per operation.

#ifndef TREAP_H
#define TREAP_H

#include <functional>
#include <memory>
#include <random>

class Treap {
 public:
    Treap() : rng_(std::random_device{}()), size_(0), root_(nullptr) {}

    bool insert(int key) {
        if (contains(key)) return false;
        auto [left, right] = split(std::move(root_), key);
        auto node = std::make_unique<Node>(key, rng_());
        root_ = merge(merge(std::move(left), std::move(node)), std::move(right));
        ++size_;
        return true;
    }

    bool erase(int key) {
        if (!contains(key)) return false;
        // `rest` holds keys >= key and key is present, so key is its minimum.
        // Dropping the minimum avoids key + 1, which overflows at INT_MAX.
        auto [left, rest] = split(std::move(root_), key);
        root_ = merge(std::move(left), dropMin(std::move(rest)));
        --size_;
        return true;
    }

    bool contains(int key) const {
        const Node* node = root_.get();
        while (node) {
            if (node->key == key) return true;
            node = (key < node->key) ? node->left.get() : node->right.get();
        }
        return false;
    }

    int size() const { return size_; }

    // Emit keys in sorted order via callback.
    void inorder(const std::function<void(int)>& visit) const {
        inorderHelper(root_.get(), visit);
    }

    bool checkHeapProperty() const {
        return checkHeapHelper(root_.get());
    }

 private:
    struct Node {
        int key;
        uint32_t priority;
        std::unique_ptr<Node> left, right;
        Node(int k, uint32_t p) : key(k), priority(p), left(nullptr), right(nullptr) {}
    };

    std::mt19937 rng_;
    int size_;
    std::unique_ptr<Node> root_;

    static std::pair<std::unique_ptr<Node>, std::unique_ptr<Node>>
    split(std::unique_ptr<Node> node, int key) {
        if (!node) return {nullptr, nullptr};
        if (node->key < key) {
            auto [L, R] = split(std::move(node->right), key);
            node->right = std::move(L);
            return {std::move(node), std::move(R)};
        } else {
            auto [L, R] = split(std::move(node->left), key);
            node->left = std::move(R);
            return {std::move(L), std::move(node)};
        }
    }

    static std::unique_ptr<Node> dropMin(std::unique_ptr<Node> node) {
        if (!node->left) return std::move(node->right);
        node->left = dropMin(std::move(node->left));
        return node;
    }

    static std::unique_ptr<Node> merge(std::unique_ptr<Node> a,
                                       std::unique_ptr<Node> b) {
        if (!a) return b;
        if (!b) return a;
        if (a->priority > b->priority) {
            a->right = merge(std::move(a->right), std::move(b));
            return a;
        } else {
            b->left = merge(std::move(a), std::move(b->left));
            return b;
        }
    }

    static void inorderHelper(const Node* node,
                              const std::function<void(int)>& visit) {
        if (!node) return;
        inorderHelper(node->left.get(), visit);
        visit(node->key);
        inorderHelper(node->right.get(), visit);
    }

    static bool checkHeapHelper(const Node* node) {
        if (!node) return true;
        if (node->left && node->left->priority > node->priority) return false;
        if (node->right && node->right->priority > node->priority) return false;
        return checkHeapHelper(node->left.get()) &&
               checkHeapHelper(node->right.get());
    }
};

#endif  // TREAP_H
