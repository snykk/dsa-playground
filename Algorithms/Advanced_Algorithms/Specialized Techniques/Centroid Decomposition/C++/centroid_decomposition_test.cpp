#include <cassert>
#include <iostream>
#include <vector>
#include "centroid_decomposition.cpp"

void testBuild() {
    int n = 5;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0};
    adj[3] = {1};
    adj[4] = {1};
    
    CentroidDecomposition cd(n, adj);
    cd.build(0);
    vector<int> parent = cd.getParent();
    // Find the centroid tree root (the node with parent == -1)
    int rootCount = 0;
    for (int i = 0; i < n; i++) {
        if (parent[i] == -1) rootCount++;
    }
    assert(rootCount == 1);  // Exactly one root in centroid tree
}

void testBuildTwice() {
    int n = 5;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0};
    adj[3] = {1};
    adj[4] = {1};

    CentroidDecomposition cd(n, adj);
    cd.build(0);
    vector<int> first = cd.getParent();
    cd.build(0);
    assert(cd.getParent() == first);
    int rootCount = 0;
    for (int p : cd.getParent()) {
        if (p == -1) rootCount++;
    }
    assert(rootCount == 1);
}

int main() {
    testBuild();
    testBuildTwice();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

