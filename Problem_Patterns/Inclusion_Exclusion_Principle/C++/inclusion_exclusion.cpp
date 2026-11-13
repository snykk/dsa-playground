#include <iostream>
#include <vector>
#include <algorithm>
#include <set>

using namespace std;

long long gcd(long long a, long long b) {
    while (b) {
        long long temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Count numbers in 1..n divisible by at least one divisor (all divisors >= 1).
// The lcm is kept in long long and a subset is dropped once its lcm exceeds n:
// n / lcm is 0 there, and the product could overflow otherwise.
int countDivisible(int n, const vector<int>& divisors) {
    long long result = 0;
    int k = divisors.size();
    
    for (int i = 1; i < (1 << k); i++) {
        int count = 0;
        long long lcm = 1;
        bool tooBig = false;
        for (int j = 0; j < k; j++) {
            if (i & (1 << j)) {
                count++;
                lcm = lcm / gcd(lcm, divisors[j]) * divisors[j];
                if (lcm > n) {
                    tooBig = true;
                    break;
                }
            }
        }
        if (tooBig) continue;
        
        if (count % 2 == 1) {
            result += n / lcm;
        } else {
            result -= n / lcm;
        }
    }
    return static_cast<int>(result);
}

// Size of the union of the sets: each non-empty subset of sets adds (odd size)
// or subtracts (even size) the size of its intersection.
int countUnionSets(const vector<vector<int>>& sets) {
    int n = sets.size();
    int result = 0;
    
    for (int i = 1; i < (1 << n); i++) {
        set<int> intersection;
        int count = 0;
        
        for (int j = 0; j < n; j++) {
            if (i & (1 << j)) {
                count++;
                if (count == 1) {
                    // start from the first set in the subset, not from sets[0]
                    intersection.insert(sets[j].begin(), sets[j].end());
                    continue;
                }
                set<int> currentSet(sets[j].begin(), sets[j].end());
                set<int> newIntersection;
                for (int val : intersection) {
                    if (currentSet.find(val) != currentSet.end()) {
                        newIntersection.insert(val);
                    }
                }
                intersection = newIntersection;
            }
        }
        
        if (count % 2 == 1) {
            result += intersection.size();
        } else {
            result -= intersection.size();
        }
    }
    return result;
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    vector<int> divisors = {2, 3, 5};
    int result = countDivisible(100, divisors);
    cout << "Count divisible: " << result << endl;
    
    vector<vector<int>> sets = {{1, 2, 3}, {2, 3, 4}, {3, 4, 5}};
    result = countUnionSets(sets);
    cout << "Count union sets: " << result << endl;
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
