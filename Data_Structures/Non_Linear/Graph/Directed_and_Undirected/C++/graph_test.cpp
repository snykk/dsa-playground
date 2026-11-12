#include <iostream>
#include <vector>
#include <cassert>
#include "graph.cpp"

void test_add_vertex() {
    Graph g(false);
    g.add_vertex(1);
    g.add_vertex(2);
    
    auto vertices = g.get_vertices();
    assert(vertices.find(1) != vertices.end());
    assert(vertices.find(2) != vertices.end());
    cout << "test_add_vertex: PASSED" << endl;
}

void test_add_edge_undirected() {
    Graph g(false);
    g.add_edge(1, 2);
    g.add_edge(2, 3);
    
    assert(g.has_edge(1, 2));
    assert(g.has_edge(2, 1));  // Bidirectional
    assert(g.has_edge(2, 3));
    assert(g.has_edge(3, 2));  // Bidirectional
    assert(!g.has_edge(1, 3));
    cout << "test_add_edge_undirected: PASSED" << endl;
}

void test_add_edge_directed() {
    Graph g(true);
    g.add_edge(1, 2);
    g.add_edge(2, 3);
    
    assert(g.has_edge(1, 2));
    assert(!g.has_edge(2, 1));  // Not bidirectional
    assert(g.has_edge(2, 3));
    assert(!g.has_edge(3, 2));  // Not bidirectional
    cout << "test_add_edge_directed: PASSED" << endl;
}

void test_bfs() {
    Graph g(false);
    g.add_edge(1, 2);
    g.add_edge(2, 3);
    g.add_edge(1, 4);
    
    vector<int> bfs_result = g.bfs(1);
    assert(bfs_result[0] == 1);
    assert(bfs_result.size() == 4);
    cout << "test_bfs: PASSED" << endl;
}

void test_dfs() {
    Graph g(false);
    g.add_edge(1, 2);
    g.add_edge(2, 3);
    g.add_edge(1, 4);
    
    vector<int> dfs_result = g.dfs(1);
    assert(dfs_result[0] == 1);
    assert(dfs_result.size() == 4);
    cout << "test_dfs: PASSED" << endl;
}

void test_is_connected() {
    Graph g(false);
    g.add_edge(1, 2);
    g.add_edge(2, 3);
    assert(g.is_connected());
    
    Graph disconnected(false);
    disconnected.add_edge(1, 2);
    disconnected.add_vertex(3);  // Isolated vertex
    assert(!disconnected.is_connected());
    cout << "test_is_connected: PASSED" << endl;
}

void test_remove_edge() {
    Graph u(false);
    u.add_edge(1, 2);
    u.remove_edge(1, 2);
    assert(!u.has_edge(1, 2));
    assert(!u.has_edge(2, 1));

    Graph d(true);
    d.add_edge(1, 2);
    d.add_edge(2, 1);
    d.remove_edge(1, 2);
    assert(!d.has_edge(1, 2));
    assert(d.has_edge(2, 1));
    cout << "test_remove_edge: PASSED" << endl;
}

int main() {
    test_add_vertex();
    test_add_edge_undirected();
    test_add_edge_directed();
    test_bfs();
    test_dfs();
    test_is_connected();
    test_remove_edge();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}

