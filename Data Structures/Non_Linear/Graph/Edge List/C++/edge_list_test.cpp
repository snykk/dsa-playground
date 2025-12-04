#include <iostream>
#include <vector>
#include <cassert>
#include "edge_list.cpp"

void test_add_edge_unweighted() {
    EdgeList g(false, false);
    g.add_edge(1, 2);
    g.add_edge(2, 3);
    
    assert(g.has_edge(1, 2));
    assert(g.has_edge(2, 1));  // Undirected
    assert(g.get_edge_count() == 2);
    cout << "test_add_edge_unweighted: PASSED" << endl;
}

void test_add_edge_weighted() {
    EdgeList g(false, true);
    g.add_edge(1, 2, 5.0);
    g.add_edge(2, 3, 3.0);
    
    assert(g.has_edge(1, 2));
    assert(g.get_weight(1, 2) == 5.0);
    assert(g.get_edge_count() == 2);
    cout << "test_add_edge_weighted: PASSED" << endl;
}

int main() {
    test_add_edge_unweighted();
    test_add_edge_weighted();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}

