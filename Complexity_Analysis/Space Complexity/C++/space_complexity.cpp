/*
 * Space Complexity Analysis and Examples
 *
 * Space complexity measures the amount of memory space an algorithm uses
 * relative to the input size.
 */

#include <iostream>
#include <vector>

using namespace std;

// O(1) - Constant Space
int constantSpaceExample(int n) {
    int total = 0;
    for (int i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}

// O(n) - Linear Space
vector<int> linearSpaceExample(int n) {
    vector<int> result;
    for (int i = 1; i <= n; i++) {
        result.push_back(i);
    }
    return result;
}

// O(n²) - Quadratic Space
vector<vector<int>> quadraticSpaceExample(int n) {
    vector<vector<int>> matrix;
    for (int i = 0; i < n; i++) {
        vector<int> row;
        for (int j = 0; j < n; j++) {
            row.push_back(i * n + j);
        }
        matrix.push_back(row);
    }
    return matrix;
}

// O(1) - In-place reverse
void inPlaceReverse(vector<int>& arr) {
    int left = 0, right = arr.size() - 1;
    while (left < right) {
        swap(arr[left], arr[right]);
        left++;
        right--;
    }
}

void demonstrateSpaceComplexity() {
    cout << "=== Space Complexity Examples ===\n\n";
    
    cout << "O(1) - Constant Space:\n";
    cout << "  Sum 1 to 100: " << constantSpaceExample(100) << "\n\n";
    
    cout << "O(n) - Linear Space:\n";
    vector<int> arr = linearSpaceExample(10);
    cout << "  Created array of size " << arr.size() << "\n\n";
    
    cout << "O(n²) - Quadratic Space:\n";
    vector<vector<int>> matrix = quadraticSpaceExample(3);
    cout << "  Created " << matrix.size() << "×" << matrix[0].size() << " matrix\n\n";
    
    vector<int> test = {1, 2, 3, 4, 5};
    inPlaceReverse(test);
    cout << "O(1) - In-place Reverse:\n";
    cout << "  Reversed: ";
    for (int val : test) {
        cout << val << " ";
    }
    cout << "\n\n";
}

#ifndef TESTING
int main() {
    demonstrateSpaceComplexity();
    return 0;
}
#endif

