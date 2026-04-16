/*
 * Big-Theta (Θ) Notation Implementation and Examples
 *
 * Big-Theta notation describes a tight bound on an algorithm's time complexity.
 * It represents both the upper and lower bounds.
 */

#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Θ(n) - Tight bound example
int tightBoundExample(const vector<int>& arr) {
    int total = 0;
    for (int element : arr) {
        total += element;
    }
    return total;
}

// Θ(log n) - Binary search tight bound
int binarySearchExample(const vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

// Θ(n log n) - Merge sort tight bound
vector<int> mergeSortExample(vector<int> arr) {
    if (arr.size() <= 1) {
        return arr;
    }
    
    sort(arr.begin(), arr.end());
    return arr;
}

void demonstrateBigTheta() {
    cout << "=== Big-Theta (Θ) Notation Examples ===\n\n";
    cout << "Big-Theta provides a TIGHT BOUND (both upper and lower)\n\n";
    
    // Θ(n)
    vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    cout << "Θ(n) - Linear Tight Bound:\n";
    cout << "  Sum: " << tightBoundExample(arr) << "\n\n";
    
    // Θ(log n)
    vector<int> sorted = {1, 3, 5, 7, 9, 11, 13, 15};
    cout << "Θ(log n) - Logarithmic Tight Bound:\n";
    cout << "  Binary search for 11: index " << binarySearchExample(sorted, 11) << "\n\n";
    
    // Θ(n log n)
    vector<int> unsorted = {64, 34, 25, 12, 22, 11, 90};
    vector<int> sorted_result = mergeSortExample(unsorted);
    cout << "Θ(n log n) - Linearithmic Tight Bound:\n";
    cout << "  Sorted: ";
    for (int val : sorted_result) {
        cout << val << " ";
    }
    cout << "\n\n";
}

#ifndef TESTING
int main() {
    demonstrateBigTheta();
    return 0;
}
#endif

