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

void test_self_loop_and_undirected_remove() {
    EdgeList g(false, false);
    g.add_edge(1, 2);
    g.add_edge(3, 3);
    assert(g.get_edge_count() == 2);
    g.remove_edge(1, 2);
    assert(!g.has_edge(1, 2));
    assert(!g.has_edge(2, 1));
    assert(g.get_edge_count() == 1);

    EdgeList w(false, true);
    w.add_edge(1, 2, 1.5);
    w.add_edge(4, 4, 2.0);
    assert(w.get_edge_count() == 2);
    cout << "test_self_loop_and_undirected_remove: PASSED" << endl;
}

int main() {
    test_add_edge_unweighted();
    test_add_edge_weighted();
    test_self_loop_and_undirected_remove();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}

