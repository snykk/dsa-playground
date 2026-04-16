#include <cassert>
#include <iostream>
#include "monotonic_stack.cpp"

int main() {
    // Test nextGreaterElement
    assert((nextGreaterElement({4, 5, 2, 10, 8}) == vector<int>{5, 10, 10, -1, -1}));
    assert((nextGreaterElement({5, 4, 3, 2, 1}) == vector<int>{-1, -1, -1, -1, -1}));
    assert((nextGreaterElement({1, 2, 3, 4, 5}) == vector<int>{2, 3, 4, 5, -1}));
    assert((nextGreaterElement({42}) == vector<int>{-1}));
    assert((nextGreaterElement({}) == vector<int>{}));
    assert((nextGreaterElement({2, 2, 2}) == vector<int>{-1, -1, -1}));
    assert((nextGreaterElement({1, 3, 2, 4}) == vector<int>{3, 4, 4, -1}));

    // Test nextSmallerElement
    assert((nextSmallerElement({4, 5, 2, 10, 8}) == vector<int>{2, 2, -1, 8, -1}));
    assert((nextSmallerElement({1, 2, 3, 4, 5}) == vector<int>{-1, -1, -1, -1, -1}));
    assert((nextSmallerElement({5, 4, 3, 2, 1}) == vector<int>{4, 3, 2, 1, -1}));
    assert((nextSmallerElement({42}) == vector<int>{-1}));
    assert((nextSmallerElement({}) == vector<int>{}));
    assert((nextSmallerElement({3, 3, 3}) == vector<int>{-1, -1, -1}));

    // Test previousGreaterElement
    assert((previousGreaterElement({4, 5, 2, 10, 8}) == vector<int>{-1, -1, 5, -1, 10}));
    assert((previousGreaterElement({5, 4, 3, 2, 1}) == vector<int>{-1, 5, 4, 3, 2}));
    assert((previousGreaterElement({1, 2, 3, 4, 5}) == vector<int>{-1, -1, -1, -1, -1}));
    assert((previousGreaterElement({42}) == vector<int>{-1}));
    assert((previousGreaterElement({}) == vector<int>{}));
    assert((previousGreaterElement({3, 3, 3}) == vector<int>{-1, -1, -1}));

    // Test previousSmallerElement
    assert((previousSmallerElement({4, 5, 2, 10, 8}) == vector<int>{-1, 4, -1, 2, 2}));
    assert((previousSmallerElement({1, 2, 3, 4, 5}) == vector<int>{-1, 1, 2, 3, 4}));
    assert((previousSmallerElement({5, 4, 3, 2, 1}) == vector<int>{-1, -1, -1, -1, -1}));
    assert((previousSmallerElement({42}) == vector<int>{-1}));
    assert((previousSmallerElement({}) == vector<int>{}));
    assert((previousSmallerElement({3, 3, 3}) == vector<int>{-1, -1, -1}));

    // Test largestRectangleHistogram
    assert(largestRectangleHistogram({2, 1, 5, 6, 2, 3}) == 10);
    assert(largestRectangleHistogram({5}) == 5);
    assert(largestRectangleHistogram({3, 3, 3, 3}) == 12);
    assert(largestRectangleHistogram({1, 2, 3, 4, 5}) == 9);
    assert(largestRectangleHistogram({5, 4, 3, 2, 1}) == 9);
    assert(largestRectangleHistogram({}) == 0);
    assert(largestRectangleHistogram({2, 4}) == 4);
    assert(largestRectangleHistogram({6, 2, 5, 4, 5, 1, 6}) == 12);

    // Test dailyTemperatures
    assert((dailyTemperatures({73, 74, 75, 71, 69, 72, 76, 73}) == vector<int>{1, 1, 4, 2, 1, 1, 0, 0}));
    assert((dailyTemperatures({5, 4, 3, 2, 1}) == vector<int>{0, 0, 0, 0, 0}));
    assert((dailyTemperatures({1, 2, 3, 4, 5}) == vector<int>{1, 1, 1, 1, 0}));
    assert((dailyTemperatures({30}) == vector<int>{0}));
    assert((dailyTemperatures({}) == vector<int>{}));
    assert((dailyTemperatures({70, 70, 70}) == vector<int>{0, 0, 0}));

    // Test stockSpan
    assert((stockSpan({100, 80, 60, 70, 60, 75, 85}) == vector<int>{1, 1, 1, 2, 1, 4, 6}));
    assert((stockSpan({10, 20, 30, 40}) == vector<int>{1, 2, 3, 4}));
    assert((stockSpan({40, 30, 20, 10}) == vector<int>{1, 1, 1, 1}));
    assert((stockSpan({100}) == vector<int>{1}));
    assert((stockSpan({}) == vector<int>{}));
    assert((stockSpan({50, 50, 50}) == vector<int>{1, 2, 3}));

    cout << "All tests passed!" << endl;
    return 0;
}
