/*
 * Big-O Notation Implementation and Examples
 *
 * Big-O notation describes the upper bound of an algorithm's time complexity.
 * It represents the worst-case scenario for how the runtime grows with input size.
 *
 * Formal Definition:
 * f(n) = O(g(n)) if there exist positive constants c and n₀ such that
 * 0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>

using namespace std;

/**
 * O(1) - Constant Time
 * Time complexity doesn't depend on input size.
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
int constantTimeExample(int n) {
    return 42;
}

/**
 * O(log n) - Logarithmic Time
 * Time complexity grows logarithmically with input size.
 * Common in binary search, balanced tree operations.
 * 
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 */
int logarithmicTimeExample(int n) {
    int count = 0;
    int i = n;
    while (i > 1) {
        i = i / 2;
        count++;
    }
    return count;
}

/**
 * O(n) - Linear Time
 * Time complexity grows linearly with input size.
 * Common in single loops, array traversal.
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
int linearTimeExample(const vector<int>& arr) {
    int total = 0;
    for (int element : arr) {
        total += element;
    }
    return total;
}

/**
 * O(n log n) - Linearithmic Time
 * Time complexity grows as n times log n.
 * Common in efficient sorting algorithms (merge sort, heap sort).
 * 
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */
vector<int> linearithmicTimeExample(vector<int> arr) {
    if (arr.size() <= 1) {
        return arr;
    }
    
    // Using built-in sort (typically O(n log n))
    sort(arr.begin(), arr.end());
    return arr;
}

/**
 * O(n²) - Quadratic Time
 * Time complexity grows quadratically with input size.
 * Common in nested loops, bubble sort, selection sort.
 * 
 * Time Complexity: O(n²)
 * Space Complexity: O(n²)
 */
vector<pair<int, int>> quadraticTimeExample(const vector<int>& arr) {
    vector<pair<int, int>> pairs;
    for (size_t i = 0; i < arr.size(); i++) {
        for (size_t j = i + 1; j < arr.size(); j++) {
            pairs.push_back({arr[i], arr[j]});
        }
    }
    return pairs;
}

/**
 * O(n³) - Cubic Time
 * Time complexity grows cubically with input size.
 * Common in triple nested loops, matrix multiplication (naive).
 * 
 * Time Complexity: O(n³)
 * Space Complexity: O(1)
 */
int cubicTimeExample(int n) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            for (int k = 0; k < n; k++) {
                count++;
            }
        }
    }
    return count;
}

/**
 * O(2ⁿ) - Exponential Time
 * Time complexity grows exponentially with input size.
 * Common in recursive algorithms without memoization (naive Fibonacci).
 * 
 * Time Complexity: O(2ⁿ)
 * Space Complexity: O(n) due to recursion stack
 */
int exponentialTimeExample(int n) {
    if (n <= 1) {
        return n;
    }
    return exponentialTimeExample(n - 1) + exponentialTimeExample(n - 2);
}

/**
 * Demonstrate various Big-O complexities with examples.
 */
void demonstrateBigO() {
    cout << "=== Big-O Notation Examples ===\n\n";
    
    // O(1) - Constant
    cout << "O(1) - Constant Time:\n";
    cout << "  Result: " << constantTimeExample(1000) << "\n\n";
    
    // O(log n) - Logarithmic
    cout << "O(log n) - Logarithmic Time:\n";
    vector<int> testSizes = {8, 16, 32, 64};
    for (int n : testSizes) {
        int result = logarithmicTimeExample(n);
        cout << "  n=" << n << ": " << result << " iterations\n";
    }
    cout << "\n";
    
    // O(n) - Linear
    cout << "O(n) - Linear Time:\n";
    vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    cout << "  Sum of " << arr.size() << " elements: " 
         << linearTimeExample(arr) << "\n\n";
    
    // O(n log n) - Linearithmic
    cout << "O(n log n) - Linearithmic Time:\n";
    vector<int> unsorted = {64, 34, 25, 12, 22, 11, 90};
    vector<int> sorted = linearithmicTimeExample(unsorted);
    cout << "  Sorted: ";
    for (int val : sorted) {
        cout << val << " ";
    }
    cout << "\n\n";
    
    // O(n²) - Quadratic
    cout << "O(n²) - Quadratic Time:\n";
    vector<int> testArr = {1, 2, 3, 4};
    vector<pair<int, int>> pairs = quadraticTimeExample(testArr);
    cout << "  All pairs: ";
    for (auto& p : pairs) {
        cout << "(" << p.first << "," << p.second << ") ";
    }
    cout << "\n\n";
    
    // O(n³) - Cubic
    cout << "O(n³) - Cubic Time:\n";
    int n = 5;
    int count = cubicTimeExample(n);
    cout << "  n=" << n << ": " << count << " operations\n\n";
    
    // O(2ⁿ) - Exponential
    cout << "O(2ⁿ) - Exponential Time:\n";
    for (int i = 0; i < 10; i++) {
        int result = exponentialTimeExample(i);
        cout << "  Fibonacci(" << i << ") = " << result << "\n";
    }
    cout << "\n";
}

int main() {
    demonstrateBigO();
    return 0;
}

