#include <iostream>
#include <vector>
#include <cassert>
#include "weighted_graph.cpp"

void test_add_edge_weighted() {
    WeightedGraph g(false);
    g.add_edge(1, 2, 5.0);
    g.add_edge(2, 3, 3.0);
    
    assert(g.has_edge(1, 2));
    assert(g.get_weight(1, 2) == 5.0);
    assert(g.get_weight(2, 1) == 5.0);  // Undirected
    cout << "test_add_edge_weighted: PASSED" << endl;
}

void test_get_total_weight() {
    WeightedGraph g(false);
    g.add_edge(1, 2, 5.0);
    g.add_edge(2, 3, 3.0);
    g.add_edge(1, 4, 2.0);
    
    double total = g.get_total_weight();
    assert(total == 10.0);  // 5.0 + 3.0 + 2.0
    cout << "test_get_total_weight: PASSED" << endl;
}

void test_remove_edge_undirected_removes_both_directions() {
    WeightedGraph g(false);
    g.add_edge(1, 2, 4.5);
    g.remove_edge(1, 2);
    assert(!g.has_edge(1, 2));
    assert(!g.has_edge(2, 1));
    assert(g.get_total_weight() == 0.0);

    WeightedGraph d(true);
    d.add_edge(1, 2, 1.0);
    d.add_edge(2, 1, 2.0);
    d.remove_edge(1, 2);
    assert(!d.has_edge(1, 2));
    assert(d.has_edge(2, 1));
    cout << "test_remove_edge_undirected_removes_both_directions: PASSED" << endl;
}

int main() {
    test_add_edge_weighted();
    test_get_total_weight();
    test_remove_edge_undirected_removes_both_directions();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}

