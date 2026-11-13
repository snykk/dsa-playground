/*
 * Big-Theta (Theta) Notation Implementation and Examples
 *
 * Big-Theta notation is a tight bound on a function (O and Omega together). In
 * algorithm analysis it attaches to a chosen case (best, average or worst), not to
 * the algorithm as a whole.
 */

#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Theta(n) - Tight bound example
int tightBoundExample(const vector<int>& arr) {
    int total = 0;
    for (int element : arr) {
        total += element;
    }
    return total;
}

// Binary search: best case Theta(1) (target at the first middle probe),
// worst case Theta(log n).
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

// Library sort, NOT a hand-written merge sort (the name is historical).
// std::sort is O(n log n) in the worst case, but it is not Theta(n log n) in
// every case: an implementation may finish sorted input faster.
vector<int> mergeSortExample(vector<int> arr) {
    if (arr.size() <= 1) {
        return arr;
    }
    
    sort(arr.begin(), arr.end());
    return arr;
}

void demonstrateBigTheta() {
    cout << "=== Big-Theta (Theta) Notation Examples ===\n\n";
    cout << "Big-Theta is a TIGHT BOUND on a function (O and Omega together)\n\n";
    
    // Theta(n)
    vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    cout << "Theta(n) - Linear Tight Bound:\n";
    cout << "  Sum: " << tightBoundExample(arr) << "\n\n";
    
    // Theta(log n)
    vector<int> sorted = {1, 3, 5, 7, 9, 11, 13, 15};
    cout << "Theta(log n) - Logarithmic Tight Bound:\n";
    cout << "  Binary search for 11: index " << binarySearchExample(sorted, 11) << "\n\n";
    
    // Theta(n log n)
    vector<int> unsorted = {64, 34, 25, 12, 22, 11, 90};
    vector<int> sorted_result = mergeSortExample(unsorted);
    cout << "Library sort (O(n log n) worst case):\n";
    cout << "  Sorted: ";
    for (int val : sorted_result) {
        cout << val << " ";
    }
    cout << "\n\n";
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    demonstrateBigTheta();
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
