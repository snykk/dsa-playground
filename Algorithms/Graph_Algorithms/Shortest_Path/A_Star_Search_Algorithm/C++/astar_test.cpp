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
    assert(path == vector<int>{0, 2, 3});
    
    cout << "✓ testAStarBasic passed" << endl;
}

int main() {
    testAStarBasic();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


