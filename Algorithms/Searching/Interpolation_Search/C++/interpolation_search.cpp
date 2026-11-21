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
        // If search space has only one element, or all of its values are equal
        // (a run of duplicates): there is nothing to interpolate, and the
        // formula below would divide by zero (arr[right] - arr[left] == 0)
        if (left == right || arr[left] == arr[right]) {
            if (arr[left] == target) {
                return left;
            }
            return -1;
        }

        // Calculate position using interpolation formula. The differences are
        // taken in double because in T they can overflow (INT_MAX - INT_MIN)
        double num = static_cast<double>(target) - static_cast<double>(arr[left]);
        double den = static_cast<double>(arr[right]) - static_cast<double>(arr[left]);
        double offset = num * (right - left) / den;
        if (!(offset < right - left)) {  // also inf or NaN, for doubles too large for the formula
            offset = right - left;
        }
        int pos = left + static_cast<int>(offset);
        
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
    
    // If search space has only one element, or all of its values are equal
    // (a run of duplicates): there is nothing to interpolate, and the
    // formula below would divide by zero (arr[right] - arr[left] == 0)
    if (left == right || arr[left] == arr[right]) {
        if (arr[left] == target) {
            return left;
        }
        return -1;
    }

    // Calculate position using interpolation formula. The differences are
    // taken in double because in T they can overflow (INT_MAX - INT_MIN)
    double num = static_cast<double>(target) - static_cast<double>(arr[left]);
    double den = static_cast<double>(arr[right]) - static_cast<double>(arr[left]);
    double offset = num * (right - left) / den;
    if (!(offset < right - left)) {  // also inf or NaN, for doubles too large for the formula
        offset = right - left;
    }
    int pos = left + static_cast<int>(offset);
    
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

