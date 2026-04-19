// K-D Tree with compile-time dimensionality K.
// Supports build, insert, nearest-neighbor, range search.

#ifndef KD_TREE_H
#define KD_TREE_H

#include <algorithm>
#include <array>
#include <cmath>
#include <limits>
#include <memory>
#include <optional>
#include <vector>

template <size_t K>
class KDTree {
 public:
    using Point = std::array<double, K>;

    KDTree() = default;

    explicit KDTree(std::vector<Point> points) {
        if (!points.empty()) root_ = build(points, 0);
    }

    void insert(const Point& p) {
        root_ = insertHelper(std::move(root_), p, 0);
    }

    std::optional<Point> nearest(const Point& q) const {
        if (!root_) return std::nullopt;
        Point best = root_->point;
        double bestDist = squaredDistance(q, best);
        nearestHelper(root_.get(), q, best, bestDist);
        return best;
    }

    std::vector<Point> rangeSearch(const Point& lo, const Point& hi) const {
        std::vector<Point> result;
        rangeHelper(root_.get(), lo, hi, result);
        return result;
    }

 private:
    struct Node {
        Point point;
        size_t axis;
        std::unique_ptr<Node> left;
        std::unique_ptr<Node> right;
    };

    std::unique_ptr<Node> root_;

    static double squaredDistance(const Point& a, const Point& b) {
        double d = 0;
        for (size_t i = 0; i < K; ++i) {
            double diff = a[i] - b[i];
            d += diff * diff;
        }
        return d;
    }

    std::unique_ptr<Node> build(std::vector<Point>& pts, size_t depth) {
        if (pts.empty()) return nullptr;
        size_t axis = depth % K;
        size_t mid = pts.size() / 2;
        std::nth_element(pts.begin(), pts.begin() + mid, pts.end(),
                         [axis](const Point& a, const Point& b) {
                             return a[axis] < b[axis];
                         });
        auto node = std::make_unique<Node>();
        node->point = pts[mid];
        node->axis = axis;
        std::vector<Point> leftPts(pts.begin(), pts.begin() + mid);
        std::vector<Point> rightPts(pts.begin() + mid + 1, pts.end());
        node->left = build(leftPts, depth + 1);
        node->right = build(rightPts, depth + 1);
        return node;
    }

    std::unique_ptr<Node> insertHelper(std::unique_ptr<Node> node,
                                       const Point& p, size_t depth) {
        if (!node) {
            auto n = std::make_unique<Node>();
            n->point = p;
            n->axis = depth % K;
            return n;
        }
        size_t axis = depth % K;
        if (p[axis] < node->point[axis]) {
            node->left = insertHelper(std::move(node->left), p, depth + 1);
        } else {
            node->right = insertHelper(std::move(node->right), p, depth + 1);
        }
        return node;
    }

    void nearestHelper(const Node* node, const Point& q,
                       Point& best, double& bestDist) const {
        if (!node) return;
        double d = squaredDistance(q, node->point);
        if (d < bestDist) {
            bestDist = d;
            best = node->point;
        }
        double diff = q[node->axis] - node->point[node->axis];
        const Node* near = diff < 0 ? node->left.get() : node->right.get();
        const Node* far = diff < 0 ? node->right.get() : node->left.get();
        nearestHelper(near, q, best, bestDist);
        if (diff * diff < bestDist) {
            nearestHelper(far, q, best, bestDist);
        }
    }

    void rangeHelper(const Node* node, const Point& lo, const Point& hi,
                     std::vector<Point>& out) const {
        if (!node) return;
        bool inside = true;
        for (size_t i = 0; i < K; ++i) {
            if (node->point[i] < lo[i] || node->point[i] > hi[i]) {
                inside = false;
                break;
            }
        }
        if (inside) out.push_back(node->point);
        if (lo[node->axis] <= node->point[node->axis]) {
            rangeHelper(node->left.get(), lo, hi, out);
        }
        if (hi[node->axis] >= node->point[node->axis]) {
            rangeHelper(node->right.get(), lo, hi, out);
        }
    }
};

#endif  // KD_TREE_H
