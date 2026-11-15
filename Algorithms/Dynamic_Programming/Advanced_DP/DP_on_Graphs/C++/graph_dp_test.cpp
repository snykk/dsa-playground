/**
 * Test cases for DP on Graphs (C++)
 */

#include <cassert>
#include <iostream>
#include <random>
#include <stdexcept>
#include <vector>
#include "graph_dp.cpp"

bool throwsCycle(const Graph& graph, int start) {
    try {
        dagLongestPath(graph, start);
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

void testDagLongestPath() {
    Graph graph = {{0, {1, 2}}, {1, {3}}, {2, {3}}, {3, {}}};
    assert(dagLongestPath(graph, 0) == 2);
    std::cout << "[PASS] DAG longest path test passed" << std::endl;
}

void testLargerDag() {
    Graph graph = {{0, {1, 2, 3}}, {1, {2, 4}}, {2, {4, 5}}, {3, {5}}, {4, {6}}, {5, {6}}, {6, {}}};
    assert(dagLongestPath(graph, 0) == 4);
    assert(dagLongestPath(graph, 3) == 2);
    assert(dagLongestPath(graph, 6) == 0);
    std::cout << "[PASS] Larger DAG test passed" << std::endl;
}

void testMissingNodeIsASink() {
    assert(dagLongestPath({}, 5) == 0);
    assert(dagLongestPath({{0, {1}}}, 0) == 1);
    std::cout << "[PASS] Missing node is a sink test passed" << std::endl;
}

void testCycleThrows() {
    // A cycle is an error, not a path of length 2.
    assert(throwsCycle({{0, {1}}, {1, {2}}, {2, {0}}}, 0));
    std::cout << "[PASS] Cycle throws test passed" << std::endl;
}

void testSelfLoopThrows() {
    assert(throwsCycle({{0, {0}}}, 0));
    std::cout << "[PASS] Self-loop throws test passed" << std::endl;
}

void testCycleNotReachableIsIgnored() {
    Graph graph = {{0, {1}}, {1, {}}, {5, {6}}, {6, {5}}};
    assert(dagLongestPath(graph, 0) == 1);
    std::cout << "[PASS] Unreachable cycle is ignored test passed" << std::endl;
}

void testSharedNodeVisitedOnceIsNotACycle() {
    Graph graph = {{0, {1, 2}}, {1, {3}}, {2, {3}}, {3, {}}};
    assert(dagLongestPath(graph, 0) == 2);
    std::cout << "[PASS] Shared node is not a cycle test passed" << std::endl;
}

void testAgreesWithPython() {
    // Expected values printed by the Python dag_longest_path on the same graphs.
    Graph dag12 = {{0, {1, 4, 7}}, {1, {2, 5}}, {2, {3, 9}}, {3, {11}}, {4, {5, 8}}, {5, {6, 10}},
                   {6, {3, 11}}, {7, {8}}, {8, {9, 6}}, {9, {10}}, {10, {11}}, {11, {}}};
    assert(dagLongestPath(dag12, 0) == 5);
    assert(dagLongestPath(dag12, 4) == 4);
    assert(dagLongestPath(dag12, 7) == 4);
    Graph sparseIds = {{-5, {100, 7}}, {100, {7, 42}}, {7, {42}}, {42, {}}};
    assert(dagLongestPath(sparseIds, -5) == 3);
    assert(throwsCycle({{0, {1, 2}}, {1, {3}}, {2, {3}}, {3, {4}}, {4, {3}}}, 0));
    std::cout << "[PASS] Agrees with Python test passed" << std::endl;
}

// Longest simple path from node by trying every path; sets cycle if a path
// can step back onto itself (a cycle is reachable).
int bruteForceLongest(const Graph& graph, int node, std::vector<bool>& onPath, bool& cycle) {
    onPath[node] = true;
    int best = 0;
    auto successors = graph.find(node);
    if (successors != graph.end()) {
        for (int next : successors->second) {
            if (onPath[next]) {
                cycle = true;
            } else {
                best = std::max(best, 1 + bruteForceLongest(graph, next, onPath, cycle));
            }
        }
    }
    onPath[node] = false;
    return best;
}

void testMatchesBruteForce() {
    std::mt19937 rng(20261115);
    for (int trial = 0; trial < 500; ++trial) {
        const int n = 1 + static_cast<int>(rng() % 8);
        const bool acyclic = rng() % 2 == 0;  // edges only go to larger ids
        Graph graph;
        for (int u = 0; u < n; ++u) {
            if (rng() % 5 == 0) {
                continue;  // no entry: a sink
            }
            std::vector<int>& successors = graph[u];
            for (int v = 0; v < n; ++v) {
                if ((!acyclic || v > u) && rng() % 3 == 0) {
                    successors.push_back(v);
                }
            }
        }
        const int start = static_cast<int>(rng() % n);
        std::vector<bool> onPath(n, false);
        bool cycle = false;
        const int expected = bruteForceLongest(graph, start, onPath, cycle);
        if (cycle) {
            assert(throwsCycle(graph, start));
        } else {
            assert(dagLongestPath(graph, start) == expected);
        }
    }
    std::cout << "[PASS] Matches brute force test passed" << std::endl;
}

int main() {
    std::cout << "Running DP on Graphs tests..." << std::endl;
    testDagLongestPath();
    testLargerDag();
    testMissingNodeIsASink();
    testCycleThrows();
    testSelfLoopThrows();
    testCycleNotReachableIsIgnored();
    testSharedNodeVisitedOnceIsNotACycle();
    testAgreesWithPython();
    testMatchesBruteForce();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
