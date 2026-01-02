#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int gcd(int a, int b) {
    while (b) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

int countDivisible(int n, const vector<int>& divisors) {
    int result = 0;
    int k = divisors.size();
    
    for (int i = 1; i < (1 << k); i++) {
        int count = 0;
        int lcm = 1;
        for (int j = 0; j < k; j++) {
            if (i & (1 << j)) {
                count++;
                lcm = lcm * divisors[j] / gcd(lcm, divisors[j]);
            }
        }
        
        if (count % 2 == 1) {
            result += n / lcm;
        } else {
            result -= n / lcm;
        }
    }
    return result;
}

int countUnionSets(const vector<vector<int>>& sets) {
    int n = sets.size();
    int result = 0;
    
    for (int i = 1; i < (1 << n); i++) {
        set<int> intersection;
        if (!sets[0].empty()) {
            intersection.insert(sets[0].begin(), sets[0].end());
        }
        int count = 0;
        
        for (int j = 0; j < n; j++) {
            if (i & (1 << j)) {
                count++;
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

int main() {
    vector<int> divisors = {2, 3, 5};
    int result = countDivisible(100, divisors);
    cout << "Count divisible: " << result << endl;
    
    vector<vector<int>> sets = {{1, 2, 3}, {2, 3, 4}, {3, 4, 5}};
    result = countUnionSets(sets);
    cout << "Count union sets: " << result << endl;
    return 0;
}

