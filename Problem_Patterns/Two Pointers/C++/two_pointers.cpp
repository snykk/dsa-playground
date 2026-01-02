#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <cctype>

using namespace std;

/**
 * Find two numbers that add up to target in sorted array.
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
vector<int> twoSumSorted(const vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left < right) {
        int currentSum = arr[left] + arr[right];
        if (currentSum == target) {
            return {left, right};
        } else if (currentSum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return {};
}

/**
 * Find all unique triplets that sum to target.
 * Time Complexity: O(n²)
 * Space Complexity: O(1) excluding output
 */
vector<vector<int>> threeSum(vector<int>& arr, int target) {
    sort(arr.begin(), arr.end());
    vector<vector<int>> result;
    
    for (int i = 0; i < arr.size() - 2; i++) {
        if (i > 0 && arr[i] == arr[i - 1]) continue;
        
        int left = i + 1, right = arr.size() - 1;
        
        while (left < right) {
            int currentSum = arr[i] + arr[left] + arr[right];
            if (currentSum == target) {
                result.push_back({arr[i], arr[left], arr[right]});
                while (left < right && arr[left] == arr[left + 1]) left++;
                while (left < right && arr[right] == arr[right - 1]) right--;
                left++;
                right--;
            } else if (currentSum < target) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}

/**
 * Check if string is palindrome using two pointers.
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
bool isPalindrome(const string& s) {
    int left = 0, right = s.length() - 1;
    
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        
        if (tolower(s[left]) != tolower(s[right])) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}

/**
 * Remove duplicates from sorted array in-place.
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
int removeDuplicates(vector<int>& arr) {
    if (arr.empty()) return 0;
    
    int writeIndex = 1;
    
    for (int readIndex = 1; readIndex < arr.size(); readIndex++) {
        if (arr[readIndex] != arr[writeIndex - 1]) {
            arr[writeIndex] = arr[readIndex];
            writeIndex++;
        }
    }
    
    return writeIndex;
}

/**
 * Find maximum area of water that can be contained.
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
int containerWithMostWater(const vector<int>& heights) {
    int left = 0, right = heights.size() - 1;
    int maxArea = 0;
    
    while (left < right) {
        int width = right - left;
        int height = min(heights[left], heights[right]);
        int area = width * height;
        maxArea = max(maxArea, area);
        
        if (heights[left] < heights[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxArea;
}

int main() {
    cout << "Two Pointers Examples:" << endl;
    cout << endl;
    
    vector<int> arr = {2, 7, 11, 15};
    vector<int> result = twoSumSorted(arr, 9);
    cout << "Two sum 9: [" << result[0] << ", " << result[1] << "]" << endl;
    cout << endl;
    
    vector<int> arr2 = {-1, 0, 1, 2, -1, -4};
    vector<vector<int>> result2 = threeSum(arr2, 0);
    cout << "Three sum 0: " << result2.size() << " triplets" << endl;
    cout << endl;
    
    string s = "A man, a plan, a canal: Panama";
    cout << "Is palindrome: " << (isPalindrome(s) ? "true" : "false") << endl;
    cout << endl;
    
    vector<int> arr3 = {1, 1, 2, 2, 3, 4, 4, 5};
    int length = removeDuplicates(arr3);
    cout << "After removing duplicates: ";
    for (int i = 0; i < length; i++) {
        cout << arr3[i] << " ";
    }
    cout << endl;
    cout << endl;
    
    vector<int> heights = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    int area = containerWithMostWater(heights);
    cout << "Maximum water area: " << area << endl;
    
    return 0;
}

