#include <iostream>
#include <vector>

using namespace std;

class CentroidDecomposition {
private:
    int n;
    vector<vector<int>> adj;
    vector<int> size;
    vector<bool> removed;
    vector<int> parent;
    
    int dfsSize(int u, int p) {
        size[u] = 1;
        for (int v : adj[u]) {
            if (v != p && !removed[v]) {
                size[u] += dfsSize(v, u);
            }
        }
        return size[u];
    }
    
    int findCentroid(int u, int p, int total) {
        for (int v : adj[u]) {
            if (v != p && !removed[v] && size[v] > total / 2) {
                return findCentroid(v, u, total);
            }
        }
        return u;
    }
    
    void decompose(int u, int p) {
        int total = dfsSize(u, -1);
        int centroid = findCentroid(u, -1, total);
        
        removed[centroid] = true;
        parent[centroid] = p;
        
        for (int v : adj[centroid]) {
            if (!removed[v]) {
                decompose(v, centroid);
            }
        }
    }
    
public:
    CentroidDecomposition(int n, const vector<vector<int>>& adj) 
        : n(n), adj(adj) {
        size.assign(n, 0);
        removed.assign(n, false);
        parent.assign(n, -1);
    }
    
    void build(int root = 0) {
        removed.assign(n, false);
        parent.assign(n, -1);
        decompose(root, -1);
    }
    
    vector<int> getParent() const {
        return parent;
    }
};

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    cout << "Centroid Decomposition Examples:" << endl;
    cout << endl;
    
    int n = 7;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0, 5};
    adj[3] = {1};
    adj[4] = {1, 6};
    adj[5] = {2};
    adj[6] = {4};
    
    CentroidDecomposition cd(n, adj);
    cd.build(0);
    
    vector<int> parent = cd.getParent();
    cout << "Centroid tree parent array:" << endl;
    for (int i = 0; i < n; i++) {
        cout << parent[i] << " ";
    }
    cout << endl;
    
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
