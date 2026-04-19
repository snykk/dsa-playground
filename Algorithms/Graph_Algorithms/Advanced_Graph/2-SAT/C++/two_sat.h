// Linear-time 2-SAT solver via implication graph + iterative Tarjan's SCC.
//
// Literal encoding:
//   2*x     = variable x (positive)
//   2*x + 1 = variable x (negated)
//   lit ^ 1 = negation of a literal

#ifndef TWO_SAT_H
#define TWO_SAT_H

#include <algorithm>
#include <optional>
#include <stack>
#include <vector>

class TwoSAT {
 public:
    explicit TwoSAT(int n_vars) : n_(n_vars), graph_(2 * n_vars) {}

    // Add clause (a ∨ b). Literals are 2*x or 2*x+1.
    void addClause(int a, int b) {
        graph_[a ^ 1].push_back(b);
        graph_[b ^ 1].push_back(a);
    }

    // Shortcut for a → b, equivalent to (¬a ∨ b).
    void implies(int a, int b) { addClause(a ^ 1, b); }

    // Force literal `a` to be true via (a ∨ a).
    void forceTrue(int a) { addClause(a, a); }

    // Returns (true, assignment) on SAT, or (false, std::nullopt) on UNSAT.
    std::optional<std::vector<bool>> solve() {
        runTarjan();
        std::vector<bool> assignment(n_, false);
        for (int x = 0; x < n_; ++x) {
            if (comp_[2 * x] == comp_[2 * x + 1]) return std::nullopt;
            // Pick the literal whose SCC has the LOWER Tarjan ID (later in topo).
            assignment[x] = comp_[2 * x] < comp_[2 * x + 1];
        }
        return assignment;
    }

 private:
    void runTarjan() {
        int n = 2 * n_;
        comp_.assign(n, -1);
        std::vector<int> disc(n, -1), low(n, -1);
        std::vector<bool> on_stack(n, false);
        std::stack<int> tarjan_stack;
        int timer = 0, scc_count = 0;

        for (int start = 0; start < n; ++start) {
            if (disc[start] != -1) continue;
            // Iterative DFS: stack holds (node, next-neighbor-index-to-process).
            std::stack<std::pair<int, int>> work;
            work.push({start, 0});
            while (!work.empty()) {
                auto& [u, i] = work.top();
                if (i == 0) {
                    disc[u] = low[u] = timer++;
                    tarjan_stack.push(u);
                    on_stack[u] = true;
                }
                if (i < static_cast<int>(graph_[u].size())) {
                    int v = graph_[u][i];
                    ++i;
                    if (disc[v] == -1) {
                        work.push({v, 0});
                    } else if (on_stack[v]) {
                        low[u] = std::min(low[u], disc[v]);
                    }
                } else {
                    if (low[u] == disc[u]) {
                        while (true) {
                            int w = tarjan_stack.top();
                            tarjan_stack.pop();
                            on_stack[w] = false;
                            comp_[w] = scc_count;
                            if (w == u) break;
                        }
                        ++scc_count;
                    }
                    int finished = u;
                    int finished_low = low[u];
                    work.pop();
                    if (!work.empty()) {
                        int parent = work.top().first;
                        low[parent] = std::min(low[parent], finished_low);
                    }
                    (void)finished;
                }
            }
        }
    }

    int n_;
    std::vector<std::vector<int>> graph_;
    std::vector<int> comp_;
};

#endif  // TWO_SAT_H
