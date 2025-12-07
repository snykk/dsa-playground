/**
 * Bubble Sort Implementation (C++)
 * 
 * Simple sorting algorithm that repeatedly steps through the list,
 * compares adjacent elements and swaps them if they are in wrong order.
 */

#include <iostream>
#include <vector>
#include <algorithm>

template<typename T>
void bubbleSort(std::vector<T>& arr) {
    size_t n = arr.size();
    
    for (size_t i = 0; i < n; ++i) {
        bool swapped = false;
        
        // Last i elements are already in place
        for (size_t j = 0; j < n - i - 1; ++j) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        
        // If no swaps occurred, array is sorted
        if (!swapped) {
            break;
        }
    }
}

// Specialization for common types
template void bubbleSort<int>(std::vector<int>&);
template void bubbleSort<double>(std::vector<double>&);
template void bubbleSort<std::string>(std::vector<std::string>&);

