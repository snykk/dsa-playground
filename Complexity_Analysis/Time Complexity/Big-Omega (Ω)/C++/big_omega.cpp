/*
 * Big-Omega (Ω) Notation Implementation and Examples
 *
 * Big-Omega notation describes the lower bound of an algorithm's time complexity.
 * It represents the best-case scenario.
 */

#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Ω(1) - Best case for linear search
int linearSearchBestCase(const vector<int>& arr, int target) {
    for (size_t i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

// Ω(n) - Best case for bubble sort
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

// Ω(n²) - Lower bound for matrix traversal
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
    cout << "=== Big-Omega (Ω) Notation Examples ===\n\n";
    cout << "Big-Omega provides a LOWER BOUND (best case)\n\n";
    
    vector<int> arr = {5, 3, 8, 1, 9};
    cout << "Ω(1) - Constant Lower Bound:\n";
    cout << "  Linear search (best case): index " 
         << linearSearchBestCase(arr, 5) << "\n\n";
    
    vector<int> sorted = {1, 2, 3, 4, 5};
    cout << "Ω(n) - Linear Lower Bound:\n";
    cout << "  Bubble sort (best case): already sorted\n\n";
    
    vector<vector<int>> matrix = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    cout << "Ω(n²) - Quadratic Lower Bound:\n";
    cout << "  Matrix traversal: sum = " 
         << matrixTraversalLowerBound(matrix) << "\n\n";
}

#ifndef TESTING
int main() {
    demonstrateBigOmega();
    return 0;
}
#endif

