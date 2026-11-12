/**
 * Heap Sort Implementation (C++)
 */

#include <vector>
#include <algorithm>

template<typename T>
void heapify(std::vector<T>& arr, size_t n, size_t i) {
    size_t largest = i;
    size_t left = 2 * i + 1;
    size_t right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest != i) {
        std::swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

template<typename T>
void heapSort(std::vector<T>& arr) {
    size_t n = arr.size();
    if (n < 2) {
        return;  // already sorted; n - 1 below would wrap around for n == 0
    }
    
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; --i) {
        heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (size_t i = n - 1; i > 0; --i) {
        std::swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}

template void heapSort<int>(std::vector<int>&);
template void heapSort<double>(std::vector<double>&);

