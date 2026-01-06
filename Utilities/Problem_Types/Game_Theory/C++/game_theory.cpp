/**
 * Game Theory Basics for Competitive Programming (C++)
 * 
 * Covers Nim, Sprague-Grundy theorem, and common game patterns.
 */

#include <bits/stdc++.h>
using namespace std;

typedef long long ll;
typedef vector<int> vi;

// Nim Game

/**
 * Classic Nim: Players take turns removing objects from piles.
 * First player wins if XOR of all piles is non-zero.
 */
bool nimWinner(vi& piles) {
    int xorSum = 0;
    for (int pile : piles) {
        xorSum ^= pile;
    }
    return xorSum != 0;  // true = first player wins
}

/**
 * Winning move in Nim
 * Returns {pile_index, take_amount} or {-1, -1} if losing position
 */
pair<int, int> nimWinningMove(vi& piles) {
    int xorSum = 0;
    for (int pile : piles) xorSum ^= pile;
    
    if (xorSum == 0) return {-1, -1};  // Losing position
    
    for (int i = 0; i < piles.size(); i++) {
        int target = piles[i] ^ xorSum;
        if (target < piles[i]) {
            return {i, piles[i] - target};
        }
    }
    return {-1, -1};
}

// Sprague-Grundy Theorem

/**
 * Calculate Grundy number (nimber) for a game state
 * Grundy(state) = mex({Grundy(next_states)})
 * mex = minimum excludant (smallest non-negative integer not in set)
 */
int mex(set<int>& s) {
    int result = 0;
    while (s.count(result)) result++;
    return result;
}

/**
 * Example: Subtraction game
 * Players can remove 1, 2, or 3 stones from a pile
 */
vi subtractGrundy(int n, vi& moves) {
    vi grundy(n + 1, 0);
    
    for (int i = 1; i <= n; i++) {
        set<int> reachable;
        for (int move : moves) {
            if (i >= move) {
                reachable.insert(grundy[i - move]);
            }
        }
        grundy[i] = mex(reachable);
    }
    
    return grundy;
}

/**
 * Combined game: XOR of individual Grundy numbers
 */
int combinedGrundy(vi& states, vector<vi>& grundyTables) {
    int result = 0;
    for (int i = 0; i < states.size(); i++) {
        result ^= grundyTables[i][states[i]];
    }
    return result;
}

// Common Game Patterns

/**
 * Pattern 1: Last-to-move wins
 * Standard Nim-like analysis
 */
bool lastMoveWins(vi& piles) {
    return nimWinner(piles);
}

/**
 * Pattern 2: Last-to-move loses (Misère Nim)
 * Same as Nim if not all piles are 1
 */
bool misereNimWinner(vi& piles) {
    int xorSum = 0;
    bool allOnes = true;
    
    for (int pile : piles) {
        xorSum ^= pile;
        if (pile > 1) allOnes = false;
    }
    
    if (allOnes) {
        // Odd number of piles = second player wins
        return piles.size() % 2 == 0;
    }
    return xorSum != 0;
}

/**
 * Pattern 3: Staircase Nim
 * Stones on odd-indexed stairs matter
 */
bool staircaseNim(vi& stairs) {
    int xorSum = 0;
    for (int i = 1; i < stairs.size(); i += 2) {
        xorSum ^= stairs[i];
    }
    return xorSum != 0;
}

/**
 * Pattern 4: Green Hackenbush on tree
 * Grundy number = XOR of (depth mod 2) for each edge
 */
int hackenbushTree(vector<vi>& adj, int root = 0) {
    vi depth(adj.size(), 0);
    queue<int> q;
    q.push(root);
    
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (depth[v] == 0 && v != root) {
                depth[v] = depth[u] + 1;
                q.push(v);
            }
        }
    }
    
    // XOR of all edge contributions
    int result = 0;
    for (int u = 0; u < adj.size(); u++) {
        for (int v : adj[u]) {
            if (u < v) {
                result ^= 1;  // Each edge contributes 1 to XOR
            }
        }
    }
    return result;
}

// DP-based Game Analysis

/**
 * Generic game state DP
 * Returns true if current player wins from state
 */
map<int, bool> memo;

bool canWin(int state, function<vi(int)> getMoves) {
    if (memo.count(state)) return memo[state];
    
    vi moves = getMoves(state);
    
    // Current player wins if any move leads to opponent losing
    for (int nextState : moves) {
        if (!canWin(nextState, getMoves)) {
            return memo[state] = true;
        }
    }
    
    // No winning move found
    return memo[state] = false;
}

/**
 * Example: Stone game with k stones
 * Take 1 to k stones, last to take wins
 */
bool stoneGameDP(int n, int k) {
    // Winner pattern repeats every k+1
    return n % (k + 1) != 0;
}

// Nim Variants

/**
 * Wythoff's game: Two piles, can take any from one or equal from both
 */
bool wythoffWinner(int a, int b) {
    if (a > b) swap(a, b);
    double phi = (1 + sqrt(5)) / 2;  // Golden ratio
    int k = b - a;
    int n = (int)(k * phi);
    return !(a == n);  // Cold position if a == floor(k * phi)
}

/**
 * Fibonacci Nim: Can take 1 to 2×last_move stones
 * Zeckendorf representation determines winner
 */
vi zeckendorf(int n) {
    vi fibs = {1, 2};
    while (fibs.back() < n) {
        fibs.push_back(fibs[fibs.size()-1] + fibs[fibs.size()-2]);
    }
    
    vi result;
    for (int i = fibs.size() - 1; i >= 0 && n > 0; i--) {
        if (fibs[i] <= n) {
            result.push_back(fibs[i]);
            n -= fibs[i];
        }
    }
    return result;
}

int main() {
    // Example: Standard Nim
    vi piles = {3, 4, 5};
    cout << "Nim with piles [3,4,5]: " 
         << (nimWinner(piles) ? "First wins" : "Second wins") << endl;
    
    // Example: Subtraction game
    vi moves = {1, 2, 3};
    vi grundy = subtractGrundy(10, moves);
    cout << "Grundy numbers for subtraction game: ";
    for (int i = 0; i <= 10; i++) cout << grundy[i] << " ";
    cout << endl;
    
    // Example: Wythoff's game
    cout << "Wythoff (3, 5): " 
         << (wythoffWinner(3, 5) ? "First wins" : "Second wins") << endl;
    
    return 0;
}

