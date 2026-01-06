/**
 * Interactive Problem Techniques for Competitive Programming (C++)
 * 
 * Interactive problems require communication with a judge/grader.
 * Key: Flush output after each query!
 */

#include <bits/stdc++.h>
using namespace std;

// Output Flushing

// Method 1: endl flushes automatically (slower)
void queryWithEndl(int x) {
    cout << "? " << x << endl;
}

// Method 2: flush explicitly (preferred)
void queryWithFlush(int x) {
    cout << "? " << x << "\n";
    cout.flush();
}

// Method 3: Use "\n" and flush at end
void answer(int x) {
    cout << "! " << x << "\n";
    cout.flush();
}

// Binary Search Interactive

/**
 * Example: Guess a number between 1 and n
 * Judge responds "higher", "lower", or "correct"
 */
void guessNumber(int n) {
    int lo = 1, hi = n;
    
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        
        cout << "? " << mid << "\n";
        cout.flush();
        
        string response;
        cin >> response;
        
        if (response == "correct") {
            return;
        } else if (response == "higher") {
            lo = mid + 1;
        } else {  // "lower"
            hi = mid - 1;
        }
    }
    
    cout << "! " << lo << "\n";
    cout.flush();
}

/**
 * Example: Find minimum in rotated sorted array
 * Query: Get value at index i
 */
int findMinimumInteractive(int n) {
    auto query = [](int i) -> int {
        cout << "? " << i + 1 << "\n";  // 1-indexed
        cout.flush();
        int val;
        cin >> val;
        return val;
    };
    
    int lo = 0, hi = n - 1;
    
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        int midVal = query(mid);
        int hiVal = query(hi);
        
        if (midVal > hiVal) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    
    cout << "! " << lo + 1 << "\n";
    cout.flush();
    return lo;
}

// Graph Exploration

/**
 * Example: Explore unknown graph to find a path
 */
void exploreGraph(int n) {
    vector<vector<int>> adj(n + 1);
    vector<bool> visited(n + 1, false);
    
    // Query function: Get neighbors of node u
    auto getNeighbors = [](int u) -> vector<int> {
        cout << "? " << u << "\n";
        cout.flush();
        
        int k;
        cin >> k;
        vector<int> neighbors(k);
        for (int i = 0; i < k; i++) {
            cin >> neighbors[i];
        }
        return neighbors;
    };
    
    // BFS exploration
    queue<int> q;
    q.push(1);
    visited[1] = true;
    
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        
        vector<int> neighbors = getNeighbors(u);
        adj[u] = neighbors;
        
        for (int v : neighbors) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}

// Comparison-Based Search

/**
 * Example: Find maximum element with comparisons
 * Query: Compare two elements, get which is larger
 */
int findMaximum(int n) {
    auto compare = [](int i, int j) -> int {
        // Returns 1 if a[i] > a[j], 0 if equal, -1 if less
        cout << "? " << i << " " << j << "\n";
        cout.flush();
        int result;
        cin >> result;
        return result;
    };
    
    int maxIdx = 1;
    
    for (int i = 2; i <= n; i++) {
        if (compare(i, maxIdx) > 0) {
            maxIdx = i;
        }
    }
    
    cout << "! " << maxIdx << "\n";
    cout.flush();
    return maxIdx;
}

// Adaptive Strategy

/**
 * Example: 20 Questions style - guess a hidden set
 */
void guessSubset(int n) {
    auto query = [](vector<int>& subset) -> int {
        cout << "? " << subset.size();
        for (int x : subset) cout << " " << x;
        cout << "\n";
        cout.flush();
        
        int response;
        cin >> response;
        return response;
    };
    
    vector<int> answer;
    
    // Query each element individually
    for (int i = 1; i <= n; i++) {
        vector<int> single = {i};
        if (query(single) == 1) {
            answer.push_back(i);
        }
    }
    
    cout << "! " << answer.size();
    for (int x : answer) cout << " " << x;
    cout << "\n";
    cout.flush();
}

// Handling Errors

/**
 * Check for invalid response (wrong answer from our side)
 */
bool checkResponse() {
    int response;
    cin >> response;
    
    if (response == -1) {
        // Wrong answer or too many queries
        exit(0);  // Terminate to avoid further errors
    }
    
    return response == 1;
}

// Template

void solve() {
    int n;
    cin >> n;
    
    // Your interactive solution here
    
    // Remember to flush after each query!
    cout << "? 1" << "\n";
    cout.flush();
    
    int response;
    cin >> response;
    
    // Final answer
    cout << "! " << response << "\n";
    cout.flush();
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
    return 0;
}

