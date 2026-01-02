#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class HLD {
private:
    int n;
    vector<vector<int>> adj;
    vector<int> parent, depth, size, heavy, head, pos;
    int curPos;
    
    int dfsSize(int u, int p) {
        size[u] = 1;
        parent[u] = p;
        int maxSize = 0;
        
        for (int v : adj[u]) {
            if (v != p) {
                depth[v] = depth[u] + 1;
                int childSize = dfsSize(v, u);
                size[u] += childSize;
                if (childSize > maxSize) {
                    maxSize = childSize;
                    heavy[u] = v;
                }
            }
        }
        
        return size[u];
    }
    
    void decompose(int u, int h) {
        head[u] = h;
        pos[u] = curPos++;
        
        if (heavy[u] != -1) {
            decompose(heavy[u], h);
        }
        
        for (int v : adj[u]) {
            if (v != parent[u] && v != heavy[u]) {
                decompose(v, v);
            }
        }
    }
    
public:
    HLD(int n, const vector<vector<int>>& adj) : n(n), adj(adj) {
        parent.assign(n, -1);
        depth.assign(n, 0);
        size.assign(n, 0);
        heavy.assign(n, -1);
        head.assign(n, 0);
        pos.assign(n, 0);
        curPos = 0;
    }
    
    void build(int root = 0) {
        dfsSize(root, -1);
        decompose(root, root);
    }
    
    int lca(int u, int v) {
        while (head[u] != head[v]) {
            if (depth[head[u]] < depth[head[v]]) {
                swap(u, v);
            }
            u = parent[head[u]];
        }
        
        if (depth[u] > depth[v]) {
            swap(u, v);
        }
        
        return u;
    }
};

int main() {
    cout << "Heavy-Light Decomposition Examples:" << endl;
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
    
    HLD hld(n, adj);
    hld.build(0);
    
    int u = 3, v = 6;
    cout << "LCA of " << u << " and " << v << ": " << hld.lca(u, v) << endl;
    
    return 0;
}
