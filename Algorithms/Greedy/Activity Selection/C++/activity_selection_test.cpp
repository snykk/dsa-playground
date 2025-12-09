/**
 * Test cases for Activity Selection (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "activity_selection.cpp"

void testBasicSelection() {
    std::vector<Activity> activities = {{1, 4}, {3, 5}, {0, 6}, {5, 7}, {8, 9}};
    std::vector<int> result = activitySelection(activities);
    assert(result.size() >= 3);
    std::cout << "✓ Basic selection test passed" << std::endl;
}

void testNoOverlap() {
    std::vector<Activity> activities = {{1, 2}, {3, 4}, {5, 6}, {7, 8}};
    std::vector<int> result = activitySelection(activities);
    assert(result.size() == 4);
    std::cout << "✓ No overlap test passed" << std::endl;
}

int main() {
    std::cout << "Running Activity Selection tests..." << std::endl;
    testBasicSelection();
    testNoOverlap();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

