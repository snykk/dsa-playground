/**
 * Test suite for Bellman-Ford algorithm implementation
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <cassert>
#include "bellman_ford.cpp"

using namespace std;

void testBellmanFordBasic() {
    vector<Edge> edges = {
        {0, 1, 4},
        {0, 2, 2},
        {1, 3, 5},
        {2, 3, 1}
    };
    
    unordered_map<int, int> distances = bellmanFord(edges, 4, 0);
    
    assert(!distances.empty());
    assert(distances[0] == 0);
    assert(distances[1] == 4);
    assert(distances[2] == 2);
    assert(distances[3] == 3);
    
    cout << "✓ testBellmanFordBasic passed" << endl;
}

void testBellmanFordNegativeCycle() {
    vector<Edge> edges = {
        {0, 1, 1},
        {1, 2, -2},
        {2, 0, -1}
    };
    
    unordered_map<int, int> distances = bellmanFord(edges, 3, 0);
    
    assert(distances.empty());  // Negative cycle detected
    
    cout << "✓ testBellmanFordNegativeCycle passed" << endl;
}

int main() {
    testBellmanFordBasic();
    testBellmanFordNegativeCycle();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


