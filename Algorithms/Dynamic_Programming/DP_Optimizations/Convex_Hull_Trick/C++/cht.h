// Convex Hull Trick (min) and Li Chao Tree.
// Integer-only arithmetic to avoid floating-point precision issues.

#ifndef CHT_H
#define CHT_H

#include <climits>
#include <deque>
#include <utility>
#include <vector>

class MonotonicCHT {
 public:
    // Lines must be added with non-increasing slope; queries in non-decreasing x.
    void addLine(long long m, long long b) {
        while (lines_.size() >= 2 && isBad(
                   lines_[lines_.size() - 2],
                   lines_.back(),
                   {m, b})) {
            lines_.pop_back();
        }
        lines_.push_back({m, b});
    }

    long long query(long long x) {
        while (lines_.size() >= 2 &&
               eval(lines_[0], x) >= eval(lines_[1], x)) {
            lines_.pop_front();
        }
        return eval(lines_[0], x);
    }

 private:
    using Line = std::pair<long long, long long>;  // (m, b)
    std::deque<Line> lines_;

    static long long eval(const Line& l, long long x) {
        return l.first * x + l.second;
    }
    // Cross-multiplied: intersection(l1, l3).x <= intersection(l1, l2).x?
    static bool isBad(const Line& l1, const Line& l2, const Line& l3) {
        // (b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3)
        __int128 lhs = (__int128)(l3.second - l1.second) * (l1.first - l2.first);
        __int128 rhs = (__int128)(l2.second - l1.second) * (l1.first - l3.first);
        return lhs <= rhs;
    }
};

class LiChaoTree {
 public:
    LiChaoTree(long long lo, long long hi) : lo_(lo), hi_(hi) {
        root_ = new Node();
    }
    ~LiChaoTree() { destroy(root_); }
    LiChaoTree(const LiChaoTree&) = delete;
    LiChaoTree& operator=(const LiChaoTree&) = delete;

    void addLine(long long m, long long b) {
        insert(root_, lo_, hi_, Line{true, m, b});
    }

    long long query(long long x) {
        return queryNode(root_, lo_, hi_, x);
    }

 private:
    struct Line {
        bool defined = false;
        long long m = 0, b = 0;
    };
    struct Node {
        Line line;
        Node* left = nullptr;
        Node* right = nullptr;
    };
    Node* root_;
    long long lo_, hi_;

    static long long eval(const Line& l, long long x) {
        return l.m * x + l.b;
    }
    static void destroy(Node* n) {
        if (!n) return;
        destroy(n->left);
        destroy(n->right);
        delete n;
    }

    void insert(Node* node, long long lo, long long hi, Line newLine) {
        if (!node->line.defined) {
            node->line = {true, newLine.m, newLine.b};
            return;
        }
        long long mid = lo + (hi - lo) / 2;
        Line cur = node->line;
        if (eval(newLine, mid) < eval(cur, mid)) {
            std::swap(node->line, newLine);
            newLine.defined = true;
            newLine.m = cur.m;
            newLine.b = cur.b;
        }
        if (lo == hi) return;
        Line stored = node->line;
        if (eval(newLine, lo) < eval(stored, lo)) {
            if (!node->left) node->left = new Node();
            insert(node->left, lo, mid, newLine);
        } else if (eval(newLine, hi) < eval(stored, hi)) {
            if (!node->right) node->right = new Node();
            insert(node->right, mid + 1, hi, newLine);
        }
    }

    long long queryNode(Node* node, long long lo, long long hi, long long x) {
        if (!node || !node->line.defined) return LLONG_MAX;
        long long best = eval(node->line, x);
        if (lo == hi) return best;
        long long mid = lo + (hi - lo) / 2;
        long long other = (x <= mid)
            ? queryNode(node->left, lo, mid, x)
            : queryNode(node->right, mid + 1, hi, x);
        return std::min(best, other);
    }
};

#endif  // CHT_H
