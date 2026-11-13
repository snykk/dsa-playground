#include <iostream>
#include <vector>
#include <unordered_set>

using namespace std;

bool subsetSumMeetInMiddle(const vector<int>& arr, int target) {
    int n = arr.size();
    int mid = n / 2;
    
    unordered_set<int> leftSums;
    leftSums.insert(0);
    for (int i = 0; i < mid; i++) {
        unordered_set<int> newSums;
        for (int s : leftSums) {
            newSums.insert(s + arr[i]);
        }
        leftSums.insert(newSums.begin(), newSums.end());
    }
    
    unordered_set<int> rightSums;
    rightSums.insert(0);
    for (int i = mid; i < n; i++) {
        unordered_set<int> newSums;
        for (int s : rightSums) {
            newSums.insert(s + arr[i]);
        }
        rightSums.insert(newSums.begin(), newSums.end());
    }
    
    for (int leftSum : leftSums) {
        if (rightSums.find(target - leftSum) != rightSums.end()) {
            return true;
        }
    }
    return false;
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    vector<int> arr = {1, 2, 3, 4, 5, 6};
    cout << "Subset sum 10: " << subsetSumMeetInMiddle(arr, 10) << endl;
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
