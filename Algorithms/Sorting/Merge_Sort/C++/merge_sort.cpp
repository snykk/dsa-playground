/**
 * Merge Sort Implementation (C++)
 */

#include <vector>
#include <algorithm>

template<typename T>
void merge(std::vector<T>& arr, size_t left, size_t mid, size_t right) {
    size_t n1 = mid - left + 1;
    size_t n2 = right - mid;
    
    std::vector<T> L(n1), R(n2);
    
    for (size_t i = 0; i < n1; ++i) {
        L[i] = arr[left + i];
    }
    for (size_t j = 0; j < n2; ++j) {
        R[j] = arr[mid + 1 + j];
    }
    
    size_t i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            ++i;
        } else {
            arr[k] = R[j];
            ++j;
        }
        ++k;
    }
    
    while (i < n1) {
        arr[k] = L[i];
        ++i;
        ++k;
    }
    
    while (j < n2) {
        arr[k] = R[j];
        ++j;
        ++k;
    }
}

template<typename T>
void mergeSort(std::vector<T>& arr, size_t left, size_t right) {
    if (left < right) {
        size_t mid = left + (right - left) / 2;
        
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        
        merge(arr, left, mid, right);
    }
}

template<typename T>
void mergeSort(std::vector<T>& arr) {
    if (arr.size() > 1) {
        mergeSort(arr, 0, arr.size() - 1);
    }
}

template void mergeSort<int>(std::vector<int>&);
template void mergeSort<double>(std::vector<double>&);

