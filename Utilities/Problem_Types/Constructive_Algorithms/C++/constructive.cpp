/**
 * Constructive Algorithm Techniques for Competitive Programming (C++)
 * 
 * Constructive problems ask you to build an object satisfying given constraints.
 */

#include <algorithm>
#include <iostream>
#include <queue>
#include <set>
#include <string>
#include <utility>
#include <vector>
using namespace std;

typedef long long ll;
typedef vector<int> vi;

// Common Patterns

/**
 * Pattern 1: Permutation Construction
 * Build a permutation satisfying certain properties
 */
vi constructPermutation(int n, int k) {
    // Permutation of 1..n whose adjacent differences take exactly k distinct values
    // (1 <= k <= n - 1; n = 1 needs k = 0).
    if (n < 1) return {};
    if (n == 1) return k == 0 ? vi{1} : vi{};
    if (k < 1 || k >= n) return {};  // Impossible

    // Zig-zag the first k + 1 numbers: 1, k+1, 2, k, ... gives differences k, k-1, ..., 1.
    // Then continue upwards with k+2..n; those steps never create a new difference.
    vi perm;
    int lo = 1, hi = k + 1;
    bool takeLow = true;
    while (lo <= hi) {
        perm.push_back(takeLow ? lo++ : hi--);
        takeLow = !takeLow;
    }
    for (int x = k + 2; x <= n; x++) perm.push_back(x);

    return perm;
}

/**
 * Pattern 2: Array with Given Sum and Constraints
 */
vi constructArrayWithSum(int n, ll sum, int minVal, int maxVal) {
    // Check if possible
    if (sum < (ll)n * minVal || sum > (ll)n * maxVal) {
        return {};  // Impossible
    }
    
    vi arr(n, minVal);
    sum -= (ll)n * minVal;
    
    for (int i = 0; i < n && sum > 0; i++) {
        int add = min((ll)(maxVal - minVal), sum);
        arr[i] += add;
        sum -= add;
    }
    
    return arr;
}

/**
 * Pattern 3: Graph Construction
 * Build a graph with given degree sequence
 */
vector<pair<int,int>> constructGraph(vi& degrees) {
    int n = degrees.size();
    vector<pair<int,int>> edges;
    
    priority_queue<pair<int,int>> pq;  // (degree, node)
    for (int i = 0; i < n; i++) {
        if (degrees[i] > 0) pq.push({degrees[i], i});
    }
    
    while (!pq.empty()) {
        auto [deg, u] = pq.top();
        pq.pop();
        
        if (deg == 0) continue;
        
        // Connect to deg highest-degree nodes
        vector<pair<int,int>> neighbors;
        for (int i = 0; i < deg && !pq.empty(); i++) {
            neighbors.push_back(pq.top());
            pq.pop();
        }
        
        if ((int)neighbors.size() < deg) {
            return {};  // Impossible
        }
        
        for (auto& [d, v] : neighbors) {
            edges.push_back({u, v});
            if (d > 1) pq.push({d - 1, v});
        }
    }
    
    return edges;
}

/**
 * Pattern 4: String Construction
 * Build string with given character counts and constraints
 */
string constructString(int n, int a, int b) {
    // Construct string with 'a' occurrences of 'a' and 'b' occurrences of 'b'
    // such that no two same characters are adjacent
    
    if (a < 0 || b < 0 || n != a + b) {
        return "";  // Impossible: the counts must add up to n
    }
    if (a > b + 1 || b > a + 1) {
        return "";  // Impossible
    }
    
    string result;
    char more = (a >= b) ? 'a' : 'b';
    char less = (a >= b) ? 'b' : 'a';
    int countMore = max(a, b);
    int countLess = min(a, b);
    
    for (int i = 0; i < n; i++) {
        if (i % 2 == 0 && countMore > 0) {
            result += more;
            countMore--;
        } else if (countLess > 0) {
            result += less;
            countLess--;
        } else {
            result += more;
            countMore--;
        }
    }
    
    return result;
}

/**
 * Pattern 5: Greedy Construction
 * Build sequence by greedily choosing elements
 */
vi greedyConstruction(int n, const vi& constraints) {
    vi result;
    set<int> available;
    for (int i = 1; i <= n; i++) available.insert(i);
    
    for (size_t i = 0; i < constraints.size(); i++) {
        // Find smallest available element >= constraint[i]
        auto it = available.lower_bound(constraints[i]);
        if (it == available.end()) {
            return {};  // Impossible
        }
        result.push_back(*it);
        available.erase(it);
    }
    
    return result;
}

/**
 * Pattern 6: Matrix Construction
 * Build matrix with given row and column sums
 */
vector<vi> constructMatrix(vi rowSums, vi colSums) {  // by value: the caller's vectors stay intact
    int n = rowSums.size();
    int m = colSums.size();
    
    vector<vi> matrix(n, vi(m, 0));
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            int val = min(rowSums[i], colSums[j]);
            matrix[i][j] = val;
            rowSums[i] -= val;
            colSums[j] -= val;
        }
    }
    
    // Check if valid
    for (int i = 0; i < n; i++) {
        if (rowSums[i] != 0) return {};
    }
    for (int j = 0; j < m; j++) {
        if (colSums[j] != 0) return {};
    }
    
    return matrix;
}

/**
 * Pattern 7: Decomposition
 * Break down problem into smaller solvable parts
 */
vi constructByDecomposition(int target) {
    // Express target as sum of powers of 2 (smallest first); nothing for target < 1
    vi result;
    if (target < 1) return result;
    for (int bit = 0; bit < 31; bit++) {
        if (target & (1 << bit)) {
            result.push_back(1 << bit);
        }
    }
    return result;
}

// Tips for Constructive Problems

/*
1. Start with extreme cases:
   - What if n = 1?
   - What if all values are minimum/maximum?

2. Try small examples by hand first

3. Look for patterns:
   - Sorted arrays
   - Alternating patterns
   - Powers of 2

4. Work backwards:
   - If you know the answer, how was it built?

5. Greedy often works:
   - Build step by step, making locally optimal choices

6. Consider impossibility conditions early:
   - Sum too large/small
   - Parity constraints
   - Graph degree constraints
*/

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    // Example usage
    vi perm = constructPermutation(5, 3);
    cout << "Permutation: ";
    for (int x : perm) cout << x << " ";
    cout << endl;
    
    vi arr = constructArrayWithSum(5, 15, 1, 5);
    cout << "Array with sum 15: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    
    string s = constructString(6, 3, 3);
    cout << "String: " << s << endl;
    
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
