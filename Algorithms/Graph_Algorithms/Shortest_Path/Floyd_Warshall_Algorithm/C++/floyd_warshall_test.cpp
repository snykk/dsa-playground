/**
 * Test suite for Floyd-Warshall algorithm implementation
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <climits>
#include "floyd_warshall.cpp"

using namespace std;

void testFloydWarshallBasic() {
    /**Test basic Floyd-Warshall algorithm.*/
    vector<vector<pair<int, int>>> graph = {
        {{1, 4}, {2, 2}},
        {{3, 5}},
        {{3, 1}},
        {}
    };
    
    vector<vector<long long>> dist = floydWarshall(graph, 4);
    
    assert(dist[0][0] == 0);
    assert(dist[1][1] == 0);
    assert(dist[2][2] == 0);
    assert(dist[3][3] == 0);
    assert(dist[0][1] == 4);
    assert(dist[0][2] == 2);
    assert(dist[0][3] == 3);  // 0 -> 2 -> 3 = 2 + 1 = 3
    assert(dist[1][3] == 5);
    assert(dist[2][3] == 1);
    
    cout << "[ok] testFloydWarshallBasic passed" << endl;
}

void testFloydWarshallAllPairs() {
    /**Test Floyd-Warshall finds all pairs shortest paths.*/
    vector<vector<pair<int, int>>> graph = {
        {{1, 4}, {2, 2}},
        {{3, 5}},
        {{3, 1}},
        {}
    };
    
    vector<vector<long long>> dist = floydWarshall(graph, 4);
    
    // Test all pairs
    for (int i = 0; i < 4; ++i) {
        assert(dist[i][i] == 0);
    }
    
    // Test specific paths
    assert(dist[1][0] == LLONG_MAX);  // No path from 1 to 0
    assert(dist[2][0] == LLONG_MAX);  // No path from 2 to 0
    assert(dist[3][0] == LLONG_MAX);  // No path from 3 to 0
    
    cout << "[ok] testFloydWarshallAllPairs passed" << endl;
}

void testFloydWarshallCompleteGraph() {
    /**Test Floyd-Warshall on complete graph.*/
    vector<vector<pair<int, int>>> graph = {
        {{1, 1}, {2, 3}},
        {{0, 1}, {2, 1}},
        {{0, 3}, {1, 1}}
    };
    
    vector<vector<long long>> dist = floydWarshall(graph, 3);
    
    assert(dist[0][1] == 1);
    assert(dist[0][2] == 2);  // 0 -> 1 -> 2 = 1 + 1 = 2
    assert(dist[1][2] == 1);
    
    cout << "[ok] testFloydWarshallCompleteGraph passed" << endl;
}

void testFloydWarshallSingleVertex() {
    /**Test Floyd-Warshall on graph with single vertex.*/
    vector<vector<pair<int, int>>> graph = {{}};
    vector<vector<long long>> dist = floydWarshall(graph, 1);
    
    assert(dist[0][0] == 0);
    assert(dist.size() == 1);
    
    cout << "[ok] testFloydWarshallSingleVertex passed" << endl;
}

void testFloydWarshallEmptyGraph() {
    /**Test Floyd-Warshall on empty graph.*/
    vector<vector<pair<int, int>>> graph;
    vector<vector<long long>> dist = floydWarshall(graph, 0);
    
    assert(dist.empty());
    
    cout << "[ok] testFloydWarshallEmptyGraph passed" << endl;
}

void testFloydWarshallParallelEdgesAndSelfLoop() {
    /**Parallel edges keep the cheapest weight; a positive self-loop keeps dist[i][i] = 0.*/
    vector<vector<pair<int, int>>> cheapFirst = {{{1, 3}, {1, 7}}, {}};
    vector<vector<pair<int, int>>> cheapLast = {{{1, 7}, {1, 3}}, {}};
    assert(floydWarshall(cheapFirst, 2)[0][1] == 3);
    assert(floydWarshall(cheapLast, 2)[0][1] == 3);

    vector<vector<pair<int, int>>> selfLoop = {{{0, 5}}};
    vector<vector<long long>> dist = floydWarshall(selfLoop, 1);
    assert(dist.size() == 1);
    assert(dist[0][0] == 0);

    cout << "[ok] testFloydWarshallParallelEdgesAndSelfLoop passed" << endl;
}

void testFloydWarshallNegativeCycle() {
    /**A negative cycle (including a negative self-loop) returns an empty matrix.*/
    vector<vector<pair<int, int>>> graph = {
        {{1, 1}},
        {{2, -3}},
        {{1, 1}, {3, 1}},
        {}
    };
    assert(floydWarshall(graph, 4).empty());

    vector<vector<pair<int, int>>> negativeSelfLoop = {{{0, -1}}};
    assert(floydWarshall(negativeSelfLoop, 1).empty());

    // Complete graph with every weight -1: used to overflow int (signed overflow UB).
    const int n = 40;
    vector<vector<pair<int, int>>> complete(n);
    for (int u = 0; u < n; ++u) {
        for (int v = 0; v < n; ++v) {
            if (u != v) complete[u].push_back({v, -1});
        }
    }
    assert(floydWarshall(complete, n).empty());

    cout << "[ok] testFloydWarshallNegativeCycle passed" << endl;
}

void testFloydWarshallFewerRowsThanVertices() {
    /**Rows missing from the adjacency list mean "no outgoing edges", not out-of-bounds reads.*/
    vector<vector<pair<int, int>>> empty;
    vector<vector<long long>> dist = floydWarshall(empty, 3);
    assert(dist.size() == 3);
    for (int i = 0; i < 3; ++i) {
        for (int j = 0; j < 3; ++j) {
            assert(dist[i][j] == (i == j ? 0 : LLONG_MAX));
        }
    }

    vector<vector<pair<int, int>>> oneRow = {{{2, 4}}};
    dist = floydWarshall(oneRow, 3);
    assert(dist[0][2] == 4);
    assert(dist[2][0] == LLONG_MAX);

    cout << "[ok] testFloydWarshallFewerRowsThanVertices passed" << endl;
}

void testFloydWarshallLargeWeightsNoOverflow() {
    /**Sums above INT_MAX are exact (long long).*/
    vector<vector<pair<int, int>>> graph = {
        {{1, 2000000000}},
        {{2, 2000000000}},
        {}
    };
    vector<vector<long long>> dist = floydWarshall(graph, 3);
    assert(dist[0][2] == 4000000000LL);

    cout << "[ok] testFloydWarshallLargeWeightsNoOverflow passed" << endl;
}

int main() {
    testFloydWarshallBasic();
    testFloydWarshallAllPairs();
    testFloydWarshallCompleteGraph();
    testFloydWarshallSingleVertex();
    testFloydWarshallEmptyGraph();
    testFloydWarshallParallelEdgesAndSelfLoop();
    testFloydWarshallNegativeCycle();
    testFloydWarshallFewerRowsThanVertices();
    testFloydWarshallLargeWeightsNoOverflow();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


