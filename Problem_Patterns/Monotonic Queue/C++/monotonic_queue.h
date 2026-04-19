// Monotonic deque helpers for sliding-window max / min in O(n) total.
//
// The deque stores *indices*; values are compared via the original array.

#ifndef MONOTONIC_QUEUE_H
#define MONOTONIC_QUEUE_H

#include <deque>
#include <vector>

inline std::vector<int> slidingWindowMax(const std::vector<int>& arr, int k) {
    std::vector<int> result;
    if (k <= 0 || arr.empty() || k > static_cast<int>(arr.size())) return result;

    std::deque<int> dq;  // indices with decreasing arr[] from front to back
    for (int i = 0; i < static_cast<int>(arr.size()); ++i) {
        // Evict indices outside the window
        while (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        // Maintain decreasing order
        while (!dq.empty() && arr[dq.back()] <= arr[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) result.push_back(arr[dq.front()]);
    }
    return result;
}

inline std::vector<int> slidingWindowMin(const std::vector<int>& arr, int k) {
    std::vector<int> result;
    if (k <= 0 || arr.empty() || k > static_cast<int>(arr.size())) return result;

    std::deque<int> dq;
    for (int i = 0; i < static_cast<int>(arr.size()); ++i) {
        while (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        while (!dq.empty() && arr[dq.back()] >= arr[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) result.push_back(arr[dq.front()]);
    }
    return result;
}

#endif  // MONOTONIC_QUEUE_H
