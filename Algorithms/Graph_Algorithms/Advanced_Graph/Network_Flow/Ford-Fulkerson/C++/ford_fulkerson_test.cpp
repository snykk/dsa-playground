#include <iostream>
#include <climits>
#include <unordered_map>
#include <cassert>
#include "ford_fulkerson.cpp"

using Graph = std::unordered_map<int, std::unordered_map<int, int>>;

void testClassic() {
    Graph graph = {
        {0, {{1, 16}, {2, 13}}},
        {1, {{2, 10}, {3, 12}}},
        {2, {{1, 4}, {4, 14}}},
        {3, {{2, 9}, {5, 20}}},
        {4, {{3, 7}, {5, 4}}}
    };
    assert(fordFulkerson(graph, 0, 5) == 23);
    std::cout << "OK testClassic" << std::endl;
}

void testSameSourceSink() {
    Graph graph = {{0, {{1, 10}}}};
    assert(fordFulkerson(graph, 0, 0) == 0);
    std::cout << "OK testSameSourceSink" << std::endl;
}

void testSinkUnreachable() {
    Graph graph = {{0, {{1, 5}}}, {2, {{3, 5}}}};
    assert(fordFulkerson(graph, 0, 3) == 0);
    std::cout << "OK testSinkUnreachable" << std::endl;
}

void testSmallNetwork() {
    // Paths 0-1-3-5 (5), 0-1-4-5 (3) and 0-2-4-5 (3) give 11; the minimum cut is also 11.
    Graph graph = {
        {0, {{1, 10}, {2, 5}}},
        {1, {{3, 5}, {4, 3}}},
        {2, {{4, 7}}},
        {3, {{5, 8}}},
        {4, {{5, 6}}}
    };
    assert(fordFulkerson(graph, 0, 5) == 11);
    std::cout << "OK testSmallNetwork" << std::endl;
}

void testLargeVertexIds() {
    // Ids above 1000 used to index past a fixed-size visited vector.
    Graph graph = {{0, {{1500, 5}}}, {1500, {{1, 5}}}};
    assert(fordFulkerson(graph, 0, 1) == 5);
    std::cout << "OK testLargeVertexIds" << std::endl;
}

void testNegativeVertexIds() {
    Graph graph = {{-5, {{-3, 4}}}, {-3, {{-1, 6}}}};
    assert(fordFulkerson(graph, -5, -1) == 4);
    std::cout << "OK testNegativeVertexIds" << std::endl;
}

void testNoIntOverflow() {
    // Two disjoint paths of INT_MAX each: the total does not fit in an int.
    Graph graph = {
        {0, {{1, INT_MAX}, {2, INT_MAX}}},
        {1, {{3, INT_MAX}}},
        {2, {{3, INT_MAX}}}
    };
    assert(fordFulkerson(graph, 0, 3) == 4294967294LL);
    std::cout << "OK testNoIntOverflow" << std::endl;
}

void testLongChain() {
    Graph graph;
    for (int i = 0; i < 200000; ++i) graph[i][i + 1] = 5;
    assert(fordFulkerson(graph, 0, 200000) == 5);
    std::cout << "OK testLongChain" << std::endl;
}

int main() {
    testClassic();
    testSameSourceSink();
    testSinkUnreachable();
    testSmallNetwork();
    testLargeVertexIds();
    testNegativeVertexIds();
    testNoIntOverflow();
    testLongChain();
    std::cout << "All Ford-Fulkerson tests passed!" << std::endl;
    return 0;
}
