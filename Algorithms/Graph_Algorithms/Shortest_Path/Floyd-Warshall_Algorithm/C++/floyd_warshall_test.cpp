/**
 * Test suite for Floyd-Warshall algorithm implementation
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "floyd_warshall.cpp"

using namespace std;

void testFloydWarshallBasic() {
    vector<vector<pair<int, int>>> graph = {
        {{1, 4}, {2, 2}},
        {{3, 5}},
        {{3, 1}},
        {}
    };
    
    vector<vector<int>> dist = floydWarshall(graph, 4);
    
    assert(dist[0][0] == 0);
    assert(dist[0][1] == 4);
    assert(dist[0][2] == 2);
    assert(dist[0][3] == 3);
    
    cout << "✓ testFloydWarshallBasic passed" << endl;
}

int main() {
    testFloydWarshallBasic();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


