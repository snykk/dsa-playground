#include <iostream>
#include <climits>
#include <unordered_map>
#include <cassert>
#include "edmonds_karp.cpp"

using Graph = std::unordered_map<int, std::unordered_map<int, int>>;

void testClassic() {
    Graph graph = {
        {0, {{1, 16}, {2, 13}}},
        {1, {{2, 10}, {3, 12}}},
        {2, {{1, 4}, {4, 14}}},
        {3, {{2, 9}, {5, 20}}},
        {4, {{3, 7}, {5, 4}}}
    };
    assert(edmondsKarp(graph, 0, 5) == 23);
    std::cout << "OK testClassic" << std::endl;
}

void testSameSourceSink() {
    Graph graph = {{0, {{1, 10}}}};
    assert(edmondsKarp(graph, 0, 0) == 0);
    std::cout << "OK testSameSourceSink" << std::endl;
}

void testSinkUnreachable() {
    Graph graph = {{0, {{1, 5}}}, {2, {{3, 5}}}};
    assert(edmondsKarp(graph, 0, 3) == 0);
    std::cout << "OK testSinkUnreachable" << std::endl;
}

void testSinkWithoutKey() {
    // The sink has no outgoing edges, so it is not a key of the map.
    Graph graph = {{0, {{1, 7}}}, {1, {{2, 3}}}};
    assert(edmondsKarp(graph, 0, 2) == 3);
    std::cout << "OK testSinkWithoutKey" << std::endl;
}

void testAntiParallelEdges() {
    Graph graph = {{0, {{1, 4}}}, {1, {{0, 6}, {2, 5}}}};
    assert(edmondsKarp(graph, 0, 2) == 4);
    std::cout << "OK testAntiParallelEdges" << std::endl;
}

void testZeroCapacity() {
    Graph graph = {{0, {{1, 0}, {2, 3}}}, {1, {{3, 9}}}, {2, {{3, 9}}}};
    assert(edmondsKarp(graph, 0, 3) == 3);
    std::cout << "OK testZeroCapacity" << std::endl;
}

void testDiamondWithCrossEdge() {
    // The 1000/1 diamond: DFS-based Ford-Fulkerson can take the cross edge 1 -> 2 over and
    // over; BFS finishes in two augmentations and the cross edge stays unused.
    Graph graph = {
        {0, {{1, 1000}, {2, 1000}}},
        {1, {{2, 1}, {3, 1000}}},
        {2, {{3, 1000}}}
    };
    assert(edmondsKarp(graph, 0, 3) == 2000);
    std::cout << "OK testDiamondWithCrossEdge" << std::endl;
}

void testNoIntOverflow() {
    // Two disjoint paths of INT_MAX each: the total does not fit in an int.
    Graph graph = {
        {0, {{1, INT_MAX}, {2, INT_MAX}}},
        {1, {{3, INT_MAX}}},
        {2, {{3, INT_MAX}}}
    };
    assert(edmondsKarp(graph, 0, 3) == 4294967294LL);
    std::cout << "OK testNoIntOverflow" << std::endl;
}

int main() {
    testClassic();
    testSameSourceSink();
    testSinkUnreachable();
    testSinkWithoutKey();
    testAntiParallelEdges();
    testZeroCapacity();
    testDiamondWithCrossEdge();
    testNoIntOverflow();
    std::cout << "All Edmonds-Karp tests passed!" << std::endl;
    return 0;
}
