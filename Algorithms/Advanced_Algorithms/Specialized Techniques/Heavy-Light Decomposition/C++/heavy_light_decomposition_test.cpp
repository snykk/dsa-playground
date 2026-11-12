#include <cassert>
#include <iostream>
#include <vector>
#include "heavy_light_decomposition.cpp"

void testBuild() {
    int n = 5;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0};
    adj[3] = {1};
    adj[4] = {1};
    
    HLD hld(n, adj);
    hld.build(0);
    assert(hld.lca(3, 4) == 1);
}

void testBuildTwice() {
    int n = 7;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0, 5};
    adj[3] = {1};
    adj[4] = {1, 6};
    adj[5] = {2};
    adj[6] = {4};

    HLD hld(n, adj);
    hld.build(0);
    int first = hld.lca(3, 6);
    hld.build(0);
    assert(hld.lca(3, 6) == first);
    assert(hld.lca(6, 5) == 0);
    assert(hld.lca(3, 4) == 1);
}

int main() {
    testBuild();
    testBuildTwice();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

