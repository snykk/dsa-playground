#include "tarjan_bridges.h"

#include <cassert>
#include <iostream>

using EdgeList = std::vector<std::pair<int, int>>;

void testSingleEdge() {
    TarjanBridges tb(2, EdgeList{{0, 1}});
    auto r = tb.compute();
    assert(r.bridges.size() == 1 && r.bridges[0] == std::make_pair(0, 1));
    assert(r.articulations.empty());
}

void testTriangleNoBridges() {
    TarjanBridges tb(3, EdgeList{{0, 1}, {1, 2}, {2, 0}});
    auto r = tb.compute();
    assert(r.bridges.empty());
    assert(r.articulations.empty());
}

void testTrianglePlusTail() {
    TarjanBridges tb(4, EdgeList{{0, 1}, {1, 2}, {2, 0}, {2, 3}});
    auto r = tb.compute();
    assert(r.bridges.size() == 1 && r.bridges[0] == std::make_pair(2, 3));
    assert(r.articulations.size() == 1 && r.articulations[0] == 2);
}

void testLinearChain() {
    TarjanBridges tb(4, EdgeList{{0, 1}, {1, 2}, {2, 3}});
    auto r = tb.compute();
    assert(r.bridges.size() == 3);
    assert(r.articulations.size() == 2);
    assert(r.articulations[0] == 1 && r.articulations[1] == 2);
}

void testIsolatedVertices() {
    TarjanBridges tb(3, EdgeList{});
    auto r = tb.compute();
    assert(r.bridges.empty());
    assert(r.articulations.empty());
}

void testDisconnectedComponents() {
    EdgeList edges{{0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}};
    TarjanBridges tb(6, edges);
    auto r = tb.compute();
    assert(r.bridges.empty());
    assert(r.articulations.empty());
}

void testStarGraph() {
    EdgeList edges{{0, 1}, {0, 2}, {0, 3}};
    TarjanBridges tb(4, edges);
    auto r = tb.compute();
    assert(r.bridges.size() == 3);
    assert(r.articulations.size() == 1 && r.articulations[0] == 0);
}

void testLeetCodeExample() {
    EdgeList edges{{0, 1}, {1, 2}, {2, 0}, {1, 3}};
    TarjanBridges tb(4, edges);
    auto r = tb.compute();
    assert(r.bridges.size() == 1 && r.bridges[0] == std::make_pair(1, 3));
    assert(r.articulations.size() == 1 && r.articulations[0] == 1);
}

void testParallelEdges() {
    EdgeList edges{{0, 1}, {0, 1}};
    TarjanBridges tb(2, edges);
    auto r = tb.compute();
    assert(r.bridges.empty());
    assert(r.articulations.empty());
}

int main() {
    testSingleEdge();
    testTriangleNoBridges();
    testTrianglePlusTail();
    testLinearChain();
    testIsolatedVertices();
    testDisconnectedComponents();
    testStarGraph();
    testLeetCodeExample();
    testParallelEdges();
    std::cout << "All 9 tests passed!" << std::endl;
    return 0;
}
