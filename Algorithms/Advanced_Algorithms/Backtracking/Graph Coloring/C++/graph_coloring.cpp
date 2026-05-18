#include <iostream>
#include <vector>
#include <optional>

using namespace std;

bool isSafe(const vector<vector<int>>& graph, int v, const vector<int>& color, int c) {
    for (int i = 0; i < graph.size(); i++) {
        if (graph[v][i] == 1 && color[i] == c) {
            return false;
        }
    }
    return true;
}

bool graphColoringUtil(const vector<vector<int>>& graph, int m, vector<int>& color, int v) {
    int n = graph.size();
    if (v == n) {
        return true;
    }
    
    for (int c = 1; c <= m; c++) {
        if (isSafe(graph, v, color, c)) {
            color[v] = c;
            
            if (graphColoringUtil(graph, m, color, v + 1)) {
                return true;
            }
            
            // Backtrack
            color[v] = 0;
        }
    }
    
    return false;
}

optional<vector<int>> graphColoring(const vector<vector<int>>& graph, int m) {
    int n = graph.size();
    vector<int> color(n, 0);
    
    if (graphColoringUtil(graph, m, color, 0)) {
        return color;
    }
    
    return nullopt;
}

int chromaticNumber(const vector<vector<int>>& graph) {
    int n = graph.size();
    for (int m = 1; m <= n; m++) {
        auto color = graphColoring(graph, m);
        if (color.has_value()) {
            return m;
        }
    }
    return n;
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    cout << "Graph Coloring Examples:" << endl;
    cout << endl;
    
    vector<vector<int>> graph = {
        {0, 1, 1, 1},
        {1, 0, 1, 0},
        {1, 1, 0, 1},
        {1, 0, 1, 0}
    };
    
    cout << "Graph adjacency matrix:" << endl;
    for (const auto& row : graph) {
        for (int cell : row) {
            cout << cell << " ";
        }
        cout << endl;
    }
    cout << endl;
    
    int m = 3;
    auto color = graphColoring(graph, m);
    if (color.has_value()) {
        cout << "Graph can be colored with " << m << " colors:" << endl;
        cout << "Color assignment: ";
        for (int c : color.value()) {
            cout << c << " ";
        }
        cout << endl;
    } else {
        cout << "Graph cannot be colored with " << m << " colors" << endl;
    }
    
    cout << "\nChromatic number: " << chromaticNumber(graph) << endl;
    
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
