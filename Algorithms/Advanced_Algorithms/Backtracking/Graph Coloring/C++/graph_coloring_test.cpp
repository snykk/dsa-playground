#include <cassert>
#include <vector>
#include "graph_coloring.cpp"

static bool isValid(const vector<vector<int>>& g, const vector<int>& c, int m) {
    int n = g.size();
    if ((int)c.size() != n) return false;
    for (int i = 0; i < n; i++) {
        if (c[i] < 1 || c[i] > m) return false;
        for (int j = 0; j < n; j++) {
            if (g[i][j] && c[i] == c[j]) return false;
        }
    }
    return true;
}

static vector<vector<int>> cycleGraph(int n) {
    vector<vector<int>> g(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) {
        g[i][(i + 1) % n] = 1;
        g[(i + 1) % n][i] = 1;
    }
    return g;
}

void testGraphColoringValid() {
    vector<vector<int>> graph = {
        {0, 1, 1, 1},
        {1, 0, 1, 0},
        {1, 1, 0, 1},
        {1, 0, 1, 0}
    };
    auto color = graphColoring(graph, 3);
    assert(color.has_value());
    assert(color.value().size() == 4);
    assert(isValid(graph, color.value(), 3));
}

void testGraphColoringInsufficientColors() {
    vector<vector<int>> graph = {
        {0, 1, 1},
        {1, 0, 1},
        {1, 1, 0}
    };
    auto color = graphColoring(graph, 2);
    assert(!color.has_value());  // Triangle needs 3 colors
}

void testChromaticNumber() {
    vector<vector<int>> graph = {
        {0, 1, 1, 1},
        {1, 0, 1, 0},
        {1, 1, 0, 1},
        {1, 0, 1, 0}
    };
    assert(chromaticNumber(graph) == 3);
}

void testIsSafe() {
    vector<vector<int>> graph = {
        {0, 1, 1},
        {1, 0, 1},
        {1, 1, 0}
    };
    vector<int> color = {1, 0, 0};
    assert(isSafe(graph, 1, color, 2));
    assert(!isSafe(graph, 1, color, 1));  // Adjacent vertex has color 1
}

void testEmptyGraph() {
    vector<vector<int>> graph;
    auto color = graphColoring(graph, 1);
    assert(color.has_value() && color.value().empty());
    assert(chromaticNumber(graph) == 0);
}

void testNoEdges() {
    vector<vector<int>> graph(4, vector<int>(4, 0));
    assert(chromaticNumber(graph) == 1);
}

void testCycles() {
    auto even = cycleGraph(6);
    assert(chromaticNumber(even) == 2);
    assert(isValid(even, graphColoring(even, 2).value(), 2));
    auto odd = cycleGraph(5);
    assert(!graphColoring(odd, 2).has_value());
    assert(chromaticNumber(odd) == 3);
    assert(isValid(odd, graphColoring(odd, 3).value(), 3));
}

void testCompleteGraph() {
    vector<vector<int>> graph(5, vector<int>(5, 1));
    for (int i = 0; i < 5; i++) graph[i][i] = 0;
    assert(chromaticNumber(graph) == 5);
    assert(!graphColoring(graph, 4).has_value());
}

int main() {
    testGraphColoringValid();
    testGraphColoringInsufficientColors();
    testChromaticNumber();
    testIsSafe();
    testEmptyGraph();
    testNoEdges();
    testCycles();
    testCompleteGraph();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

