#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>

using namespace std;

/**
 * For each element, find the next greater element to its right. -1 if none.
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
vector<int> nextGreaterElement(const vector<int>& arr) {
    int n = arr.size();
    vector<int> result(n, -1);
    stack<int> st; // stores indices

    for (int i = 0; i < n; i++) {
        while (!st.empty() && arr[st.top()] < arr[i]) {
            result[st.top()] = arr[i];
            st.pop();
        }
        st.push(i);
    }

    return result;
}

/**
 * For each element, find the next smaller element to its right. -1 if none.
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
vector<int> nextSmallerElement(const vector<int>& arr) {
    int n = arr.size();
    vector<int> result(n, -1);
    stack<int> st; // stores indices

    for (int i = 0; i < n; i++) {
        while (!st.empty() && arr[st.top()] > arr[i]) {
            result[st.top()] = arr[i];
            st.pop();
        }
        st.push(i);
    }

    return result;
}

/**
 * For each element, find the previous greater element to its left. -1 if none.
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
vector<int> previousGreaterElement(const vector<int>& arr) {
    int n = arr.size();
    vector<int> result(n, -1);
    stack<int> st; // stores indices

    for (int i = 0; i < n; i++) {
        while (!st.empty() && arr[st.top()] <= arr[i]) {
            st.pop();
        }
        if (!st.empty()) {
            result[i] = arr[st.top()];
        }
        st.push(i);
    }

    return result;
}

/**
 * For each element, find the previous smaller element to its left. -1 if none.
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
vector<int> previousSmallerElement(const vector<int>& arr) {
    int n = arr.size();
    vector<int> result(n, -1);
    stack<int> st; // stores indices

    for (int i = 0; i < n; i++) {
        while (!st.empty() && arr[st.top()] >= arr[i]) {
            st.pop();
        }
        if (!st.empty()) {
            result[i] = arr[st.top()];
        }
        st.push(i);
    }

    return result;
}

/**
 * Find the largest rectangular area in a histogram.
 * Uses a monotonic increasing stack to find, for each bar, the nearest
 * shorter bar on both sides.
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
int largestRectangleHistogram(const vector<int>& heights) {
    stack<int> st; // stores indices
    int maxArea = 0;
    int n = heights.size();

    for (int i = 0; i < n; i++) {
        while (!st.empty() && heights[st.top()] >= heights[i]) {
            int height = heights[st.top()];
            st.pop();
            int width = st.empty() ? i : i - st.top() - 1;
            maxArea = max(maxArea, height * width);
        }
        st.push(i);
    }

    // Process remaining elements in stack
    while (!st.empty()) {
        int height = heights[st.top()];
        st.pop();
        int width = st.empty() ? n : n - st.top() - 1;
        maxArea = max(maxArea, height * width);
    }

    return maxArea;
}

/**
 * For each day, find how many days until a warmer temperature. 0 if none.
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
vector<int> dailyTemperatures(const vector<int>& temperatures) {
    int n = temperatures.size();
    vector<int> result(n, 0);
    stack<int> st; // stores indices

    for (int i = 0; i < n; i++) {
        while (!st.empty() && temperatures[st.top()] < temperatures[i]) {
            int prev = st.top();
            st.pop();
            result[prev] = i - prev;
        }
        st.push(i);
    }

    return result;
}

/**
 * For each day, find the span (consecutive days with price <= current day,
 * including the current day).
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
vector<int> stockSpan(const vector<int>& prices) {
    int n = prices.size();
    vector<int> result(n, 0);
    stack<int> st; // stores indices

    for (int i = 0; i < n; i++) {
        while (!st.empty() && prices[st.top()] <= prices[i]) {
            st.pop();
        }
        result[i] = st.empty() ? i + 1 : i - st.top();
        st.push(i);
    }

    return result;
}

#ifndef TESTING
int main() {
    cout << "Monotonic Stack Examples:" << endl;
    cout << endl;

    // Next Greater Element
    vector<int> arr = {4, 5, 2, 10, 8};
    vector<int> result = nextGreaterElement(arr);
    cout << "Next Greater Element of [4, 5, 2, 10, 8]: ";
    for (int x : result) cout << x << " ";
    cout << endl << endl;

    // Largest Rectangle in Histogram
    vector<int> heights = {2, 1, 5, 6, 2, 3};
    int area = largestRectangleHistogram(heights);
    cout << "Largest Rectangle in Histogram: " << area << endl;
    cout << endl;

    // Daily Temperatures
    vector<int> temps = {73, 74, 75, 71, 69, 72, 76, 73};
    result = dailyTemperatures(temps);
    cout << "Daily Temperatures: ";
    for (int x : result) cout << x << " ";
    cout << endl << endl;

    // Stock Span
    vector<int> prices = {100, 80, 60, 70, 60, 75, 85};
    result = stockSpan(prices);
    cout << "Stock Span: ";
    for (int x : result) cout << x << " ";
    cout << endl;

    return 0;
}
#endif
