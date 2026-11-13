#include <iostream>
#include <vector>
#include <cassert>
#include "adjacency_list.cpp"

void test_add_edge_unweighted() {
    AdjacencyList graph(false, false);
    graph.add_edge(1, 2);
    graph.add_edge(2, 3);
    
    assert(graph.has_edge(1, 2));
    assert(graph.has_edge(2, 1));  // Undirected
    assert(graph.has_edge(2, 3));
    assert(!graph.has_edge(1, 3));
    cout << "test_add_edge_unweighted: PASSED" << endl;
}

void test_get_neighbors() {
    AdjacencyList graph(false, false);
    graph.add_edge(1, 2);
    graph.add_edge(1, 3);
    
    vector<int> neighbors = graph.get_neighbors(1);
    assert(neighbors.size() == 2);
    assert(find(neighbors.begin(), neighbors.end(), 2) != neighbors.end());
    assert(find(neighbors.begin(), neighbors.end(), 3) != neighbors.end());
    cout << "test_get_neighbors: PASSED" << endl;
}

void test_bfs() {
    AdjacencyList graph(false, false);
    graph.add_edge(1, 2);
    graph.add_edge(2, 3);
    graph.add_edge(1, 4);
    
    vector<int> bfs_result = graph.bfs(1);
    assert(bfs_result[0] == 1);
    assert(bfs_result.size() == 4);
    cout << "test_bfs: PASSED" << endl;
}

void test_directed() {
    AdjacencyList graph(true, false);
    graph.add_edge(1, 2);
    graph.add_edge(2, 3);
    
    assert(graph.has_edge(1, 2));
    assert(!graph.has_edge(2, 1));  // Not bidirectional
    cout << "test_directed: PASSED" << endl;
}

void test_remove_edge_undirected_removes_both_directions() {
    AdjacencyList graph(false, false);
    graph.add_edge(1, 2);
    graph.remove_edge(1, 2);
    assert(!graph.has_edge(1, 2));
    assert(!graph.has_edge(2, 1));
    assert(graph.bfs(2).size() == 1);

    AdjacencyList directed(true, false);
    directed.add_edge(1, 2);
    directed.add_edge(2, 1);
    directed.remove_edge(1, 2);
    assert(!directed.has_edge(1, 2));
    assert(directed.has_edge(2, 1));
    cout << "test_remove_edge_undirected_removes_both_directions: PASSED" << endl;
}

int main() {
    test_add_edge_unweighted();
    test_get_neighbors();
    test_bfs();
    test_directed();
    test_remove_edge_undirected_removes_both_directions();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}

