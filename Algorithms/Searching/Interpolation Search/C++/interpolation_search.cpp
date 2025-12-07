/**
 * Interpolation Search Implementation (C++)
 * 
 * Improved variant of Binary Search for uniformly distributed sorted arrays.
 * Uses the value of the target to estimate its position.
 */

#include <vector>

template<typename T>
int interpolationSearch(const std::vector<T>& arr, const T& target) {
    int left = 0;
    int right = static_cast<int>(arr.size()) - 1;
    
    while (left <= right && arr[left] <= target && target <= arr[right]) {
        // If search space has only one element
        if (left == right) {
            if (arr[left] == target) {
                return left;
            }
            return -1;
        }
        
        // Calculate position using interpolation formula
        int pos = left + static_cast<int>(((target - arr[left]) * 
            static_cast<double>(right - left)) / (arr[right] - arr[left]));
        
        // Check if target is at calculated position
        if (arr[pos] == target) {
            return pos;
        }
        
        // If target is smaller, search left
        if (arr[pos] > target) {
            right = pos - 1;
        }
        // If target is larger, search right
        else {
            left = pos + 1;
        }
    }
    
    // Target not found
    return -1;
}

template<typename T>
int interpolationSearchRecursive(const std::vector<T>& arr, const T& target, 
                                int left, int right) {
    // Base case: search space exhausted or target out of range
    if (left > right || arr[left] > target || arr[right] < target) {
        return -1;
    }
    
    // If search space has only one element
    if (left == right) {
        if (arr[left] == target) {
            return left;
        }
        return -1;
    }
    
    // Calculate position using interpolation formula
    int pos = left + static_cast<int>(((target - arr[left]) * 
        static_cast<double>(right - left)) / (arr[right] - arr[left]));
    
    // Check if target is at calculated position
    if (arr[pos] == target) {
        return pos;
    }
    
    // If target is smaller, search left
    if (arr[pos] > target) {
        return interpolationSearchRecursive(arr, target, left, pos - 1);
    }
    // If target is larger, search right
    else {
        return interpolationSearchRecursive(arr, target, pos + 1, right);
    }
}

// Explicit template instantiation
template int interpolationSearch<int>(const std::vector<int>&, const int&);
template int interpolationSearch<double>(const std::vector<double>&, const double&);

template int interpolationSearchRecursive<int>(const std::vector<int>&, const int&, int, int);
template int interpolationSearchRecursive<double>(const std::vector<double>&, const double&, int, int);

