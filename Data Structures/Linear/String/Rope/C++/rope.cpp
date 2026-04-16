#include <string>
#include <memory>
#include <vector>
#include <stdexcept>
using namespace std;

struct RopeNode {
    shared_ptr<RopeNode> left;
    shared_ptr<RopeNode> right;
    int weight;
    string data;

    // Leaf node constructor
    RopeNode(const string& s) : weight(s.size()), data(s) {}

    // Internal node constructor
    RopeNode() : weight(0) {}
};

using NodePtr = shared_ptr<RopeNode>;

int ropeLength(const NodePtr& node) {
    if (!node) return 0;
    if (!node->data.empty()) return node->data.size();
    return node->weight + ropeLength(node->right);
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
    auto parent = make_shared<RopeNode>();
    parent->left = ropeBuild(text.substr(0, mid), leafSize);
    parent->right = ropeBuild(text.substr(mid), leafSize);
    parent->weight = ropeLength(parent->left);
    return parent;
}

NodePtr concatNodes(const NodePtr& left, const NodePtr& right) {
    if (!left) return right;
    if (!right) return left;
    auto parent = make_shared<RopeNode>();
    parent->left = left;
    parent->right = right;
    parent->weight = ropeLength(left);
    return parent;
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
        auto newRight = make_shared<RopeNode>();
        newRight->left = rp;
        newRight->right = node->right;
        newRight->weight = ropeLength(rp);
        return {lp, newRight};
    }

    if (i > node->weight) {
        auto [lp, rp] = ropeSplit(node->right, i - node->weight);
        auto newLeft = make_shared<RopeNode>();
        newLeft->left = node->left;
        newLeft->right = lp;
        newLeft->weight = node->weight;
        return {newLeft, rp};
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
        return Rope(concatNodes(root, other.root));
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
};
