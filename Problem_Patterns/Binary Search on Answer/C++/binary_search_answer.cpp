#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>

using namespace std;

int binarySearchAnswer(int left, int right, function<bool(int)> condition) {
    int result = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (condition(mid)) {
            result = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return result;
}

int findMinCapacity(const vector<int>& weights, int days) {
    auto canShip = [&](int capacity) {
        int currentWeight = 0;
        int daysNeeded = 1;
        for (int weight : weights) {
            if (weight > capacity) return false;
            if (currentWeight + weight > capacity) {
                daysNeeded++;
                currentWeight = weight;
            } else {
                currentWeight += weight;
            }
        }
        return daysNeeded <= days;
    };
    
    int left = *max_element(weights.begin(), weights.end());
    int right = 0;
    for (int w : weights) right += w;
    return binarySearchAnswer(left, right, canShip);
}

int findKthSmallestDistance(vector<int>& nums, int k) {
    sort(nums.begin(), nums.end());
    
    auto countPairsWithDistanceLeq = [&](int dist) {
        int count = 0;
        int left = 0;
        for (int right = 0; right < nums.size(); right++) {
            while (nums[right] - nums[left] > dist) {
                left++;
            }
            count += right - left;
        }
        return count;
    };
    
    int left = 0, right = nums.back() - nums[0];
    return binarySearchAnswer(left, right, [&](int d) {
        return countPairsWithDistanceLeq(d) >= k;
    });
}

int splitArrayLargestSum(const vector<int>& nums, int m) {
    auto canSplit = [&](int maxSum) {
        int currentSum = 0;
        int splits = 1;
        for (int num : nums) {
            if (currentSum + num > maxSum) {
                splits++;
                currentSum = num;
            } else {
                currentSum += num;
            }
        }
        return splits <= m;
    };
    
    int left = *max_element(nums.begin(), nums.end());
    int right = 0;
    for (int n : nums) right += n;
    return binarySearchAnswer(left, right, canSplit);
}

int main() {
    vector<int> weights = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int days = 5;
    int result = findMinCapacity(weights, days);
    cout << "Minimum capacity: " << result << endl;
    
    vector<int> nums = {1, 3, 1};
    int k = 1;
    result = findKthSmallestDistance(nums, k);
    cout << "K-th smallest distance: " << result << endl;
    
    nums = {7, 2, 5, 10, 8};
    int m = 2;
    result = splitArrayLargestSum(nums, m);
    cout << "Split array largest sum: " << result << endl;
    return 0;
}

