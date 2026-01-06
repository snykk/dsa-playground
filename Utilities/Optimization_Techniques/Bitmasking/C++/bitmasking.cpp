/**
 * Bitmasking Techniques for Competitive Programming (C++)
 */

#include <bits/stdc++.h>
using namespace std;

// Basic Bit Operations

// Check if i-th bit is set
bool getBit(int mask, int i) {
    return (mask >> i) & 1;
}

// Set i-th bit to 1
int setBit(int mask, int i) {
    return mask | (1 << i);
}

// Clear i-th bit (set to 0)
int clearBit(int mask, int i) {
    return mask & ~(1 << i);
}

// Toggle i-th bit
int toggleBit(int mask, int i) {
    return mask ^ (1 << i);
}

// Count number of set bits
int countBits(int mask) {
    return __builtin_popcount(mask);
}

// Count trailing zeros
int trailingZeros(int mask) {
    return __builtin_ctz(mask);
}

// Count leading zeros
int leadingZeros(int mask) {
    return __builtin_clz(mask);
}

// Get lowest set bit
int lowestBit(int mask) {
    return mask & (-mask);
}

// Clear lowest set bit
int clearLowestBit(int mask) {
    return mask & (mask - 1);
}

// Subset Enumeration

// Iterate through all subsets of a set
void enumerateSubsets(int mask) {
    for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
        cout << "Subset: " << bitset<8>(sub) << endl;
    }
    // Don't forget empty subset
    cout << "Subset: " << bitset<8>(0) << endl;
}

// Iterate through all subsets of size k
void subsetsOfSizeK(int n, int k) {
    // Generate first subset of size k
    int mask = (1 << k) - 1;
    
    while (mask < (1 << n)) {
        cout << "Subset: " << bitset<8>(mask) << endl;
        
        // Gosper's hack to get next subset
        int c = mask & -mask;
        int r = mask + c;
        mask = (((r ^ mask) >> 2) / c) | r;
    }
}

// Bitmask DP

// Example: Traveling Salesman Problem (TSP)
const int INF = 1e9;

int tsp(vector<vector<int>>& dist) {
    int n = dist.size();
    vector<vector<int>> dp(1 << n, vector<int>(n, INF));
    
    // Start from city 0
    dp[1][0] = 0;
    
    for (int mask = 1; mask < (1 << n); mask++) {
        for (int last = 0; last < n; last++) {
            if (!(mask & (1 << last))) continue;
            if (dp[mask][last] == INF) continue;
            
            for (int next = 0; next < n; next++) {
                if (mask & (1 << next)) continue;
                
                int newMask = mask | (1 << next);
                dp[newMask][next] = min(dp[newMask][next], 
                                        dp[mask][last] + dist[last][next]);
            }
        }
    }
    
    // Return to starting city
    int fullMask = (1 << n) - 1;
    int ans = INF;
    for (int last = 1; last < n; last++) {
        ans = min(ans, dp[fullMask][last] + dist[last][0]);
    }
    return ans;
}

// Example: Subset Sum with count
int countSubsetSum(vector<int>& nums, int target) {
    int n = nums.size();
    int count = 0;
    
    for (int mask = 0; mask < (1 << n); mask++) {
        int sum = 0;
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                sum += nums[i];
            }
        }
        if (sum == target) count++;
    }
    return count;
}

// Bit Manipulation Tricks

// Check if n is power of 2
bool isPowerOf2(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}

// Round up to next power of 2
int nextPowerOf2(int n) {
    n--;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
}

// Swap without temp variable
void swapBits(int& a, int& b) {
    a ^= b;
    b ^= a;
    a ^= b;
}

// Get absolute value without branching
int absNoBranch(int n) {
    int mask = n >> 31;
    return (n + mask) ^ mask;
}

// Average without overflow
int averageNoOverflow(int a, int b) {
    return (a & b) + ((a ^ b) >> 1);
}

// Bitmask Set Operations

class BitSet {
    vector<unsigned long long> bits;
    int n;
    
public:
    BitSet(int n) : n(n), bits((n + 63) / 64, 0) {}
    
    void set(int i) {
        bits[i / 64] |= (1ULL << (i % 64));
    }
    
    void clear(int i) {
        bits[i / 64] &= ~(1ULL << (i % 64));
    }
    
    bool get(int i) {
        return (bits[i / 64] >> (i % 64)) & 1;
    }
    
    int count() {
        int cnt = 0;
        for (auto& b : bits) {
            cnt += __builtin_popcountll(b);
        }
        return cnt;
    }
    
    BitSet operator&(const BitSet& other) const {
        BitSet result(n);
        for (int i = 0; i < bits.size(); i++) {
            result.bits[i] = bits[i] & other.bits[i];
        }
        return result;
    }
    
    BitSet operator|(const BitSet& other) const {
        BitSet result(n);
        for (int i = 0; i < bits.size(); i++) {
            result.bits[i] = bits[i] | other.bits[i];
        }
        return result;
    }
};

int main() {
    // Demo
    int mask = 0b10110;
    
    cout << "Original: " << bitset<5>(mask) << endl;
    cout << "Bit 1 set: " << getBit(mask, 1) << endl;
    cout << "Bit 3 set: " << getBit(mask, 3) << endl;
    cout << "Set bit 0: " << bitset<5>(setBit(mask, 0)) << endl;
    cout << "Clear bit 2: " << bitset<5>(clearBit(mask, 2)) << endl;
    cout << "Toggle bit 4: " << bitset<5>(toggleBit(mask, 4)) << endl;
    cout << "Count bits: " << countBits(mask) << endl;
    
    return 0;
}

