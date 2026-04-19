// Aho-Corasick multi-pattern string matcher.
//
// Uses std::unordered_map<char, int> for children to support arbitrary byte
// alphabets. For ASCII-only use, an array-of-256 is a constant-factor win.
//
// Matches are reported as (end_index, pattern_id) pairs.

#ifndef AHO_CORASICK_H
#define AHO_CORASICK_H

#include <queue>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

class AhoCorasick {
 public:
    explicit AhoCorasick(const std::vector<std::string>& patterns) {
        nodes_.emplace_back();  // root
        for (size_t id = 0; id < patterns.size(); ++id) {
            if (!patterns[id].empty()) {
                insert(patterns[id], static_cast<int>(id));
            }
        }
        patterns_ = patterns;
        buildFailureLinks();
    }

    // Returns {(end_index, pattern_id), ...} for every occurrence.
    std::vector<std::pair<int, int>> search(const std::string& text) const {
        std::vector<std::pair<int, int>> matches;
        int current = 0;
        for (int i = 0; i < static_cast<int>(text.size()); ++i) {
            char c = text[i];
            while (current != 0 && !hasChild(current, c)) {
                current = nodes_[current].fail;
            }
            if (hasChild(current, c)) {
                current = nodes_[current].children.at(c);
            }
            // Report patterns terminating at this node.
            for (int pid : nodes_[current].patterns) {
                matches.emplace_back(i, pid);
            }
            // Walk output links.
            int out = nodes_[current].output;
            while (out != -1) {
                for (int pid : nodes_[out].patterns) {
                    matches.emplace_back(i, pid);
                }
                out = nodes_[out].output;
            }
        }
        return matches;
    }

    const std::string& pattern(int id) const { return patterns_[id]; }

 private:
    struct Node {
        std::unordered_map<char, int> children;
        int fail = 0;
        int output = -1;
        std::vector<int> patterns;
    };

    void insert(const std::string& pattern, int id) {
        int current = 0;
        for (char c : pattern) {
            if (!nodes_[current].children.count(c)) {
                nodes_[current].children[c] = static_cast<int>(nodes_.size());
                nodes_.emplace_back();
            }
            current = nodes_[current].children[c];
        }
        nodes_[current].patterns.push_back(id);
    }

    bool hasChild(int node, char c) const {
        return nodes_[node].children.count(c) > 0;
    }

    void buildFailureLinks() {
        std::queue<int> bfs;
        for (auto& [c, child] : nodes_[0].children) {
            nodes_[child].fail = 0;
            bfs.push(child);
        }
        while (!bfs.empty()) {
            int u = bfs.front();
            bfs.pop();
            for (auto& [c, v] : nodes_[u].children) {
                int f = nodes_[u].fail;
                while (f != 0 && !hasChild(f, c)) f = nodes_[f].fail;
                if (hasChild(f, c) && nodes_[f].children.at(c) != v) {
                    nodes_[v].fail = nodes_[f].children.at(c);
                } else {
                    nodes_[v].fail = 0;
                }
                nodes_[v].output = nodes_[nodes_[v].fail].patterns.empty()
                                       ? nodes_[nodes_[v].fail].output
                                       : nodes_[v].fail;
                bfs.push(v);
            }
        }
    }

    std::vector<Node> nodes_;
    std::vector<std::string> patterns_;
};

#endif  // AHO_CORASICK_H
