/**
 * Quick Sort Implementation (C++)
 */

#include <vector>
#include <algorithm>

template<typename T>
size_t partition(std::vector<T>& arr, size_t low, size_t high) {
    T pivot = arr[high];
    size_t i = low;
    
    for (size_t j = low; j < high; ++j) {
        if (arr[j] <= pivot) {
            std::swap(arr[i], arr[j]);
            ++i;
        }
    }
    std::swap(arr[i], arr[high]);
    return i;
}

template<typename T>
void quickSort(std::vector<T>& arr, size_t low, size_t high) {
    if (low < high) {
        size_t pi = partition(arr, low, high);
        if (pi > 0) quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

template<typename T>
void quickSort(std::vector<T>& arr) {
    if (arr.size() > 1) {
        quickSort(arr, 0, arr.size() - 1);
    }
}

template void quickSort<int>(std::vector<int>&);
template void quickSort<double>(std::vector<double>&);

