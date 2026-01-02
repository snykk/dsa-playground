#include <iostream>
#include <cassert>
#include "graph_traversal.cpp"

void testBFS() {
    Graph graph = {
        {0, {1, 2}},
        {1, {0, 3}},
        {2, {0, 4}},
        {3, {1}},
        {4, {2}}
    };
    
    assert(GraphTraversal::bfsShortestPath(graph, 0, 3) == 2);
    assert(GraphTraversal::bfsShortestPath(graph, 0, 4) == 2);
    assert(GraphTraversal::bfsShortestPath(graph, 0, 5) == -1);
    
    std::cout << "BFS tests passed!" << std::endl;
}

void testIslands() {
    std::vector<std::vector<char>> grid = {
        {'1', '1', '0'},
        {'0', '0', '1'}
    };
    
    assert(GraphTraversal::numIslands(grid) == 2);
    std::cout << "Islands tests passed!" << std::endl;
}

void testTopoSort() {
    std::vector<std::vector<int>> edges = {{0, 1}, {1, 2}};
    std::vector<int> res = GraphTraversal::topologicalSort(3, edges);
    
    std::vector<int> expected = {0, 1, 2};
    assert(res == expected);
    
    // Cycle
    std::vector<std::vector<int>> cycleEdges = {{0, 1}, {1, 0}};
    assert(GraphTraversal::topologicalSort(2, cycleEdges).empty());
    
    std::cout << "TopoSort tests passed!" << std::endl;
}

int main() {
    testBFS();
    testIslands();
    testTopoSort();
    
    std::cout << "All tests passed successfully!" << std::endl;
    return 0;
}
