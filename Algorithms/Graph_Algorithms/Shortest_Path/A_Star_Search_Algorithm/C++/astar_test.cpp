/**
 * Test suite for A* search algorithm implementation
 */

#include <iostream>
#include <unordered_map>
#include <vector>
#include <cassert>
#include <functional>
#include "astar.cpp"

using namespace std;

void testAStarBasic() {
    /**Test basic A* search algorithm.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {0, {{1, 4}, {2, 2}}},
        {1, {{3, 5}}},
        {2, {{3, 1}}},
        {3, {}}
    };
    
    function<int(int)> heuristic = [](int node) {
        return node == 3 ? 0 : 1;
    };
    
    auto [distance, path] = astar(graph, 0, 3, heuristic);
    
    assert(distance == 3);
    assert((path == vector<int>{0, 2, 3}));
    assert(path[0] == 0);
    assert(path.back() == 3);

    cout << "[ok] testAStarBasic passed" << endl;
}

void testAStarMultiplePaths() {
    /**Test A* with multiple possible paths.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {0, {{1, 1}, {2, 4}}},
        {1, {{2, 2}, {3, 5}}},
        {2, {{3, 1}}},
        {3, {}}
    };
    
    function<int(int)> heuristic = [](int node) {
        return node == 3 ? 0 : 1;
    };
    
    auto [distance, path] = astar(graph, 0, 3, heuristic);
    
    assert(distance == 4);  // 0 -> 1 -> 2 -> 3 = 1 + 2 + 1 = 4
    assert(path[0] == 0);
    assert(path.back() == 3);
    
    cout << "[ok] testAStarMultiplePaths passed" << endl;
}

void testAStarSameVertex() {
    /**Test A* from vertex to itself.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {0, {{1, 4}, {2, 2}}},
        {1, {{3, 5}}},
        {2, {{3, 1}}},
        {3, {}}
    };
    
    function<int(int)> heuristic = [](int node) {
        return 0;
    };
    
    auto [distance, path] = astar(graph, 0, 0, heuristic);
    
    assert(distance == 0);
    assert(path.size() == 1);
    assert(path[0] == 0);
    
    cout << "[ok] testAStarSameVertex passed" << endl;
}

void testAStarNoPath() {
    /**Test A* when no path exists.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {0, {{1, 1}}},
        {1, {}},
        {2, {}}
    };
    
    function<int(int)> heuristic = [](int node) {
        return node == 2 ? 0 : 1;
    };
    
    auto [distance, path] = astar(graph, 0, 2, heuristic);
    
    assert(distance == -1);
    assert(path.empty());
    
    cout << "[ok] testAStarNoPath passed" << endl;
}

void testAStarZeroHeuristic() {
    /**Test A* with zero heuristic (equivalent to Dijkstra's).*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {0, {{1, 4}, {2, 2}}},
        {1, {{3, 5}}},
        {2, {{3, 1}}},
        {3, {}}
    };
    
    function<int(int)> heuristic = [](int node) {
        return 0;
    };
    
    auto [distance, path] = astar(graph, 0, 3, heuristic);
    
    assert(distance == 3);
    assert((path == vector<int>{0, 2, 3}));

    cout << "[ok] testAStarZeroHeuristic passed" << endl;
}

void testAStarEmptyGraph() {
    /**Test A* on empty graph.*/
    unordered_map<int, vector<pair<int, int>>> graph;
    
    function<int(int)> heuristic = [](int node) {
        return 0;
    };
    
    auto [distance, path] = astar(graph, 0, 3, heuristic);
    
    assert(distance == -1);
    assert(path.empty());
    
    cout << "[ok] testAStarEmptyGraph passed" << endl;
}

void testAStarSingleVertex() {
    /**Test A* on graph with single vertex.*/
    unordered_map<int, vector<pair<int, int>>> graph = {{0, {}}};
    
    function<int(int)> heuristic = [](int node) {
        return 0;
    };
    
    auto [distance, path] = astar(graph, 0, 0, heuristic);
    
    assert(distance == 0);
    assert(path.size() == 1);
    assert(path[0] == 0);
    
    cout << "[ok] testAStarSingleVertex passed" << endl;
}

void testAStarAdmissibleInconsistentHeuristic() {
    /**An admissible but inconsistent heuristic must still give the optimal path.*/
    // S=0, A=1, B=2, C=3, G=4. h(A) = 4 equals the true cost A -> C -> G (admissible)
    // but h(A) > w(A, C) + h(C) (inconsistent). C is first expanded via B with g = 3;
    // the cheaper route via A (g = 2) must re-open it.
    unordered_map<int, vector<pair<int, int>>> graph = {
        {0, {{1, 1}, {2, 1}}},
        {1, {{3, 1}}},
        {2, {{3, 2}}},
        {3, {{4, 3}}},
        {4, {}}
    };

    function<int(int)> heuristic = [](int node) {
        return node == 1 ? 4 : 0;
    };

    auto [distance, path] = astar(graph, 0, 4, heuristic);

    assert(distance == 5);
    assert((path == vector<int>{0, 1, 3, 4}));

    cout << "[ok] testAStarAdmissibleInconsistentHeuristic passed" << endl;
}

int main() {
    testAStarBasic();
    testAStarMultiplePaths();
    testAStarSameVertex();
    testAStarNoPath();
    testAStarZeroHeuristic();
    testAStarEmptyGraph();
    testAStarSingleVertex();
    testAStarAdmissibleInconsistentHeuristic();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


