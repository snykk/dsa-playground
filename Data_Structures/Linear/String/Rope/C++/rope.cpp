#include <string>
#include <memory>
#include <vector>
#include <stdexcept>
#include <algorithm>
using namespace std;

struct RopeNode {
    shared_ptr<RopeNode> left;
    shared_ptr<RopeNode> right;
    int weight;   // length of the left subtree (leaf: its own length)
    int length;   // cached length of the whole subtree
    int height;   // cached height: a leaf is 0
    string data;  // leaves hold a non-empty fragment

    // Leaf node constructor
    RopeNode(const string& s) : weight(s.size()), length(s.size()), height(0), data(s) {}

    // Internal node constructor
    RopeNode() : weight(0), length(0), height(0) {}
};

using NodePtr = shared_ptr<RopeNode>;

int ropeLength(const NodePtr& node) { return node ? node->length : 0; }

int ropeHeight(const NodePtr& node) { return node ? node->height : -1; }

// A new internal node over two non-empty subtrees, with its cached fields set.
NodePtr makeNode(const NodePtr& left, const NodePtr& right) {
    auto parent = make_shared<RopeNode>();
    parent->left = left;
    parent->right = right;
    parent->weight = left->length;
    parent->length = left->length + right->length;
    parent->height = 1 + max(left->height, right->height);
    return parent;
}

char ropeIndex(const NodePtr& node, int i) {
    if (!node) throw out_of_range("index out of range");
    if (!node->data.empty()) {
        if (i < 0 || i >= (int)node->data.size())
            throw out_of_range("index out of range");
        return node->data[i];
    }
    if (i < node->weight)
        return ropeIndex(node->left, i);
    return ropeIndex(node->right, i - node->weight);
}

void ropeCollect(const NodePtr& node, vector<string>& parts) {
    if (!node) return;
    if (!node->data.empty()) {
        parts.push_back(node->data);
        return;
    }
    ropeCollect(node->left, parts);
    ropeCollect(node->right, parts);
}

NodePtr ropeBuild(const string& text, int leafSize = 10) {
    if ((int)text.size() <= leafSize)
        return make_shared<RopeNode>(text);
    int mid = text.size() / 2;
    return makeNode(ropeBuild(text.substr(0, mid), leafSize),
                    ropeBuild(text.substr(mid), leafSize));
}

NodePtr ropeJoin(const NodePtr& left, const NodePtr& right);

// left is taller: attach right somewhere down left's right spine.
NodePtr joinRight(const NodePtr& left, const NodePtr& right) {
    NodePtr joined = ropeJoin(left->right, right);
    if (joined->height <= left->left->height + 1) return makeNode(left->left, joined);
    // joined is two levels taller than left->left: rotate it up
    if (joined->left->height <= joined->right->height)
        return makeNode(makeNode(left->left, joined->left), joined->right);
    return makeNode(makeNode(left->left, joined->left->left),
                    makeNode(joined->left->right, joined->right));
}

// right is taller: attach left somewhere down right's left spine.
NodePtr joinLeft(const NodePtr& left, const NodePtr& right) {
    NodePtr joined = ropeJoin(left, right->left);
    if (joined->height <= right->right->height + 1) return makeNode(joined, right->right);
    if (joined->right->height <= joined->left->height)
        return makeNode(joined->left, makeNode(joined->right, right->right));
    return makeNode(makeNode(joined->left, joined->right->left),
                    makeNode(joined->right->right, right->right));
}

// Concatenate two subtrees, keeping the heights of siblings within 1 (AVL join):
// O(|height(left) - height(right)| + 1).
NodePtr ropeJoin(const NodePtr& left, const NodePtr& right) {
    if (!left) return right;
    if (!right) return left;
    if (left->height > right->height + 1) return joinRight(left, right);
    if (right->height > left->height + 1) return joinLeft(left, right);
    return makeNode(left, right);
}

pair<NodePtr, NodePtr> ropeSplit(const NodePtr& node, int i) {
    if (!node) return {nullptr, nullptr};

    if (!node->data.empty()) {
        if (i <= 0) return {nullptr, node};
        if (i >= (int)node->data.size()) return {node, nullptr};
        auto leftLeaf = make_shared<RopeNode>(node->data.substr(0, i));
        auto rightLeaf = make_shared<RopeNode>(node->data.substr(i));
        return {leftLeaf, rightLeaf};
    }

    if (i < node->weight) {
        auto [lp, rp] = ropeSplit(node->left, i);
        return {lp, ropeJoin(rp, node->right)};
    }

    if (i > node->weight) {
        auto [lp, rp] = ropeSplit(node->right, i - node->weight);
        return {ropeJoin(node->left, lp), rp};
    }

    // i == node->weight
    return {node->left, node->right};
}

class Rope {
    NodePtr root;

public:
    Rope() : root(nullptr) {}

    Rope(const string& text) {
        if (text.empty())
            root = nullptr;
        else
            root = ropeBuild(text);
    }

    explicit Rope(NodePtr node) : root(node) {}

    char index(int i) const {
        return ropeIndex(root, i);
    }

    Rope concat(const Rope& other) const {
        return Rope(ropeJoin(root, other.root));
    }

    pair<Rope, Rope> split(int i) const {
        auto [left, right] = ropeSplit(root, i);
        return {Rope(left), Rope(right)};
    }

    void insert(int i, const string& text) {
        auto [left, right] = split(i);
        Rope mid(text);
        *this = left.concat(mid).concat(right);
    }

    void deleteStr(int i, int length) {
        auto [left, rest] = split(i);
        auto [_, right] = rest.split(length);
        *this = left.concat(right);
    }

    string toString() const {
        vector<string> parts;
        ropeCollect(root, parts);
        string result;
        for (auto& s : parts) result += s;
        return result;
    }

    int length() const {
        return ropeLength(root);
    }

    // Height of the tree: 0 for a single leaf, -1 for an empty rope.
    int height() const {
        return ropeHeight(root);
    }
};
