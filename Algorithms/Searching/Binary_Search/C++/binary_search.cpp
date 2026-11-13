/**
 * Binary Search Implementation (C++)
 * 
 * Efficient searching algorithm that finds the position of a target value
 * within a sorted array by repeatedly dividing the search interval in half.
 */

#include <vector>
#include <algorithm>

template<typename T>
int binarySearch(const std::vector<T>& arr, const T& target) {
    int left = 0;
    int right = static_cast<int>(arr.size()) - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        // Check if target is present at mid
        if (arr[mid] == target) {
            return mid;
        }
        // If target is greater, ignore left half
        else if (arr[mid] < target) {
            left = mid + 1;
        }
        // If target is smaller, ignore right half
        else {
            right = mid - 1;
        }
    }
    
    // Target not found
    return -1;
}

template<typename T>
int binarySearchRecursive(const std::vector<T>& arr, const T& target, int left, int right) {
    // Base case: search space exhausted
    if (left > right) {
        return -1;
    }
    
    int mid = left + (right - left) / 2;
    
    // Check if target is present at mid
    if (arr[mid] == target) {
        return mid;
    }
    // If target is greater, search right half
    else if (arr[mid] < target) {
        return binarySearchRecursive(arr, target, mid + 1, right);
    }
    // If target is smaller, search left half
    else {
        return binarySearchRecursive(arr, target, left, mid - 1);
    }
}

template<typename T>
int binarySearchFirstOccurrence(const std::vector<T>& arr, const T& target) {
    int left = 0;
    int right = static_cast<int>(arr.size()) - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            result = mid;
            right = mid - 1;  // Continue searching left
        }
        else if (arr[mid] < target) {
            left = mid + 1;
        }
        else {
            right = mid - 1;
        }
    }
    
    return result;
}

template<typename T>
int binarySearchLastOccurrence(const std::vector<T>& arr, const T& target) {
    int left = 0;
    int right = static_cast<int>(arr.size()) - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            result = mid;
            left = mid + 1;  // Continue searching right
        }
        else if (arr[mid] < target) {
            left = mid + 1;
        }
        else {
            right = mid - 1;
        }
    }
    
    return result;
}

// Explicit template instantiation
template int binarySearch<int>(const std::vector<int>&, const int&);
template int binarySearch<double>(const std::vector<double>&, const double&);

template int binarySearchRecursive<int>(const std::vector<int>&, const int&, int, int);
template int binarySearchRecursive<double>(const std::vector<double>&, const double&, int, int);

template int binarySearchFirstOccurrence<int>(const std::vector<int>&, const int&);
template int binarySearchLastOccurrence<int>(const std::vector<int>&, const int&);

