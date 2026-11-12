/*
 * Big-Omega (Omega) Notation Implementation and Examples
 *
 * Big-Omega notation is an asymptotic lower bound on a function. In algorithm
 * analysis that function can be the best-case, average-case or worst-case time
 * (Omega is not a synonym for "best case").
 */

#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Omega(1) lower bound on every input; best case Theta(1), worst case Theta(n)
int linearSearchBestCase(const vector<int>& arr, int target) {
    for (size_t i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

// Omega(n) lower bound on every input (early-exit flag); best case Theta(n), worst Theta(n^2)
vector<int> bubbleSortBestCase(vector<int> arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return arr;
}

// Theta(n^2) for every n x n matrix: it visits every element
int matrixTraversalLowerBound(const vector<vector<int>>& matrix) {
    int total = 0;
    for (const auto& row : matrix) {
        for (int element : row) {
            total += element;
        }
    }
    return total;
}

void demonstrateBigOmega() {
    cout << "=== Big-Omega (Omega) Notation Examples ===\n\n";
    cout << "Big-Omega is a LOWER BOUND on a function (any case can have one)\n\n";
    
    vector<int> arr = {5, 3, 8, 1, 9};
    cout << "Omega(1) - Constant Lower Bound:\n";
    cout << "  Linear search (best case): index " 
         << linearSearchBestCase(arr, 5) << "\n\n";
    
    vector<int> sorted = {1, 2, 3, 4, 5};
    cout << "Omega(n) - Linear Lower Bound:\n";
    cout << "  Bubble sort (best case): already sorted\n\n";
    
    vector<vector<int>> matrix = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    cout << "Omega(n^2) - Quadratic Lower Bound:\n";
    cout << "  Matrix traversal: sum = " 
         << matrixTraversalLowerBound(matrix) << "\n\n";
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    demonstrateBigOmega();
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
