/**
 * DFS (Depth-First Search) Implementation (C++)
 * Time Complexity: O(V + E)
 */

#include <vector>
#include <stack>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>

using namespace std;

vector<int> dfsAdjacencyList(const unordered_map<int, vector<int>>& graph, int start) {
    /**
     * DFS traversal using adjacency list (iterative)
     */
    if (graph.find(start) == graph.end()) {
        return {};
    }
    
    vector<int> result;
    stack<int> st;
    unordered_set<int> visited;
    
    st.push(start);
    
    while (!st.empty()) {
        int vertex = st.top();
        st.pop();
        
        if (visited.find(vertex) == visited.end()) {
            visited.insert(vertex);
            result.push_back(vertex);
            
            // Add neighbors in reverse order to maintain left-to-right traversal
            if (graph.find(vertex) != graph.end()) {
                vector<int> neighbors = graph.at(vertex);
                reverse(neighbors.begin(), neighbors.end());
                for (int neighbor : neighbors) {
                    if (visited.find(neighbor) == visited.end()) {
                        st.push(neighbor);
                    }
                }
            }
        }
    }
    
    return result;
}

vector<int> dfsWithPath(const unordered_map<int, vector<int>>& graph,
                        int start, int target) {
    /**
     * DFS to find path from start to target
     */
    if (start == target) {
        return {start};
    }
    
    // The target does not have to be a key: a vertex without outgoing edges
    // may appear only in neighbor lists.
    if (graph.find(start) == graph.end()) {
        return {};
    }
    
    // Stack entries are (vertex, vertex that pushed it). parent[v] is recorded
    // when v is popped and visited (the map doubles as the visited set), so
    // the path is rebuilt once from the target instead of being copied into
    // every stack entry.
    stack<pair<int, int>> st;
    unordered_map<int, int> parent;
    
    st.push({start, start});
    
    while (!st.empty()) {
        auto [vertex, via] = st.top();
        st.pop();
        
        if (vertex == target) {
            vector<int> path = {vertex};
            for (int node = via; node != start; node = parent[node]) {
                path.push_back(node);
            }
            path.push_back(start);
            reverse(path.begin(), path.end());
            return path;
        }
        
        if (parent.find(vertex) == parent.end()) {
            parent[vertex] = via;
            
            if (graph.find(vertex) != graph.end()) {
                vector<int> neighbors = graph.at(vertex);
                reverse(neighbors.begin(), neighbors.end());
                for (int neighbor : neighbors) {
                    if (parent.find(neighbor) == parent.end()) {
                        st.push({neighbor, vertex});
                    }
                }
            }
        }
    }
    
    return {};  // No path found
}

bool dfsDetectCycle(const unordered_map<int, vector<int>>& graph, bool directed) {
    /**
     * Detect cycle in graph using DFS
     *
     * The recursion is simulated with an explicit stack of frames, so a long
     * path cannot overflow the call stack. A frame records whether it has a
     * parent in a separate flag (no sentinel vertex value), so every int,
     * including -1, is a valid vertex.
     */
    struct Frame {
        int vertex;
        int parent;      // meaningful only when hasParent (undirected graphs)
        bool hasParent;
        size_t next;     // index of the next neighbor to examine
    };
    static const vector<int> noNeighbors;
    auto neighborsOf = [&graph](int vertex) -> const vector<int>& {
        auto it = graph.find(vertex);
        return it == graph.end() ? noNeighbors : it->second;
    };

    unordered_set<int> visited;
    unordered_set<int> recStack;
    vector<Frame> st;
    
    for (const auto& [root, _] : graph) {
        if (visited.find(root) != visited.end()) {
            continue;
        }
        
        visited.insert(root);
        if (directed) {
            recStack.insert(root);
        }
        st.push_back({root, 0, false, 0});

        while (!st.empty()) {
            Frame& frame = st.back();
            const vector<int>& neighbors = neighborsOf(frame.vertex);

            if (frame.next == neighbors.size()) {
                // Every neighbor handled: "return" from this vertex
                if (directed) {
                    recStack.erase(frame.vertex);
                }
                st.pop_back();
                continue;
            }

            int vertex = frame.vertex;
            int neighbor = neighbors[frame.next++];
            if (visited.find(neighbor) == visited.end()) {
                // "Recursive call" on neighbor; it remembers vertex as its parent
                visited.insert(neighbor);
                if (directed) {
                    recStack.insert(neighbor);
                }
                st.push_back({neighbor, vertex, !directed, 0});
            } else if (directed) {
                if (recStack.find(neighbor) != recStack.end()) {
                    return true;
                }
            } else if (!frame.hasParent || neighbor != frame.parent) {
                return true;
            }
        }
    }
    
    return false;
}

