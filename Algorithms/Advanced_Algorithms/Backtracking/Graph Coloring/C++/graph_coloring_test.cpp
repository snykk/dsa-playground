#include <cassert>
#include <vector>
#include "graph_coloring.cpp"

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

int main() {
    testGraphColoringValid();
    testGraphColoringInsufficientColors();
    testChromaticNumber();
    testIsSafe();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

