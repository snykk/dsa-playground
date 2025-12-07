/**
 * Ternary Search Implementation (C++)
 * 
 * Divide-and-conquer algorithm that finds the position of a target value
 * in a sorted array by dividing the search space into three parts.
 */

#include <vector>
#include <functional>

template<typename T>
int ternarySearch(const std::vector<T>& arr, const T& target) {
    int left = 0;
    int right = static_cast<int>(arr.size()) - 1;
    
    while (left <= right) {
        // Divide search space into three parts
        int mid1 = left + (right - left) / 3;
        int mid2 = right - (right - left) / 3;
        
        // Check if target is at mid1
        if (arr[mid1] == target) {
            return mid1;
        }
        
        // Check if target is at mid2
        if (arr[mid2] == target) {
            return mid2;
        }
        
        // If target is in left third
        if (target < arr[mid1]) {
            right = mid1 - 1;
        }
        // If target is in right third
        else if (target > arr[mid2]) {
            left = mid2 + 1;
        }
        // If target is in middle third
        else {
            left = mid1 + 1;
            right = mid2 - 1;
        }
    }
    
    // Target not found
    return -1;
}

template<typename T>
int ternarySearchRecursive(const std::vector<T>& arr, const T& target, int left, int right) {
    // Base case: search space exhausted
    if (left > right) {
        return -1;
    }
    
    // Divide search space into three parts
    int mid1 = left + (right - left) / 3;
    int mid2 = right - (right - left) / 3;
    
    // Check if target is at mid1
    if (arr[mid1] == target) {
        return mid1;
    }
    
    // Check if target is at mid2
    if (arr[mid2] == target) {
        return mid2;
    }
    
    // If target is in left third
    if (target < arr[mid1]) {
        return ternarySearchRecursive(arr, target, left, mid1 - 1);
    }
    // If target is in right third
    else if (target > arr[mid2]) {
        return ternarySearchRecursive(arr, target, mid2 + 1, right);
    }
    // If target is in middle third
    else {
        return ternarySearchRecursive(arr, target, mid1 + 1, mid2 - 1);
    }
}

// Explicit template instantiation
template int ternarySearch<int>(const std::vector<int>&, const int&);
template int ternarySearch<double>(const std::vector<double>&, const double&);

template int ternarySearchRecursive<int>(const std::vector<int>&, const int&, int, int);
template int ternarySearchRecursive<double>(const std::vector<double>&, const double&, int, int);

