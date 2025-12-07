/**
 * Linear Search Implementation (C++)
 * 
 * Simple searching algorithm that sequentially checks each element
 * in a list until a match is found or the entire list has been searched.
 */

#include <vector>
#include <string>

template<typename T>
int linearSearch(const std::vector<T>& arr, const T& target) {
    for (size_t i = 0; i < arr.size(); ++i) {
        if (arr[i] == target) {
            return static_cast<int>(i);
        }
    }
    return -1;
}

template<typename T>
int linearSearchRecursive(const std::vector<T>& arr, const T& target, size_t index = 0) {
    // Base case: reached end of array
    if (index >= arr.size()) {
        return -1;
    }
    
    // Base case: found target
    if (arr[index] == target) {
        return static_cast<int>(index);
    }
    
    // Recursive case: check next element
    return linearSearchRecursive(arr, target, index + 1);
}

template<typename T>
std::vector<int> linearSearchAllOccurrences(const std::vector<T>& arr, const T& target) {
    std::vector<int> indices;
    for (size_t i = 0; i < arr.size(); ++i) {
        if (arr[i] == target) {
            indices.push_back(static_cast<int>(i));
        }
    }
    return indices;
}

// Explicit template instantiation
template int linearSearch<int>(const std::vector<int>&, const int&);
template int linearSearch<double>(const std::vector<double>&, const double&);
template int linearSearch<std::string>(const std::vector<std::string>&, const std::string&);

template int linearSearchRecursive<int>(const std::vector<int>&, const int&, size_t);
template int linearSearchRecursive<double>(const std::vector<double>&, const double&, size_t);
template int linearSearchRecursive<std::string>(const std::vector<std::string>&, const std::string&, size_t);

template std::vector<int> linearSearchAllOccurrences<int>(const std::vector<int>&, const int&);
template std::vector<int> linearSearchAllOccurrences<double>(const std::vector<double>&, const double&);
template std::vector<int> linearSearchAllOccurrences<std::string>(const std::vector<std::string>&, const std::string&);

