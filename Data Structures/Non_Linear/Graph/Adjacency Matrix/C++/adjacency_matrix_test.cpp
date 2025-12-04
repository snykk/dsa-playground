#include <iostream>
#include <vector>
#include <cassert>
#include "adjacency_matrix.cpp"

void test_add_edge_unweighted() {
    AdjacencyMatrix graph(5, false, false);
    graph.add_edge(0, 1);
    graph.add_edge(1, 2);
    
    assert(graph.has_edge(0, 1));
    assert(graph.has_edge(1, 0));  // Undirected
    assert(graph.has_edge(1, 2));
    assert(!graph.has_edge(0, 2));
    cout << "test_add_edge_unweighted: PASSED" << endl;
}

void test_add_edge_weighted() {
    AdjacencyMatrix graph(5, false, true);
    graph.add_edge(0, 1, 5.0);
    graph.add_edge(1, 2, 3.0);
    
    assert(graph.has_edge(0, 1));
    assert(graph.get_weight(0, 1) == 5.0);
    assert(graph.get_weight(1, 0) == 5.0);  // Undirected
    cout << "test_add_edge_weighted: PASSED" << endl;
}

void test_get_neighbors() {
    AdjacencyMatrix graph(5, false, false);
    graph.add_edge(0, 1);
    graph.add_edge(0, 2);
    
    vector<int> neighbors = graph.get_neighbors(0);
    assert(neighbors.size() == 2);
    assert(find(neighbors.begin(), neighbors.end(), 1) != neighbors.end());
    assert(find(neighbors.begin(), neighbors.end(), 2) != neighbors.end());
    cout << "test_get_neighbors: PASSED" << endl;
}

void test_bfs() {
    AdjacencyMatrix graph(5, false, false);
    graph.add_edge(0, 1);
    graph.add_edge(1, 2);
    graph.add_edge(0, 3);
    
    vector<int> bfs_result = graph.bfs(0);
    assert(bfs_result[0] == 0);
    assert(bfs_result.size() == 4);
    cout << "test_bfs: PASSED" << endl;
}

void test_dfs() {
    AdjacencyMatrix graph(5, false, false);
    graph.add_edge(0, 1);
    graph.add_edge(1, 2);
    graph.add_edge(0, 3);
    
    vector<int> dfs_result = graph.dfs(0);
    assert(dfs_result[0] == 0);
    assert(dfs_result.size() == 4);
    cout << "test_dfs: PASSED" << endl;
}

int main() {
    test_add_edge_unweighted();
    test_add_edge_weighted();
    test_get_neighbors();
    test_bfs();
    test_dfs();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}

