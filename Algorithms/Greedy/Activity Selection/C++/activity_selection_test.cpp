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
    assert((result == std::vector<int>{0, 3, 4}));
    std::cout << "[PASS] Basic selection test passed" << std::endl;
}

void testNoOverlap() {
    std::vector<Activity> activities = {{1, 2}, {3, 4}, {5, 6}, {7, 8}};
    std::vector<int> result = activitySelection(activities);
    assert(result.size() == 4);
    std::cout << "[PASS] No overlap test passed" << std::endl;
}

void testTouchingActivities() {
    // An activity may start exactly when the previous one finishes.
    std::vector<Activity> activities = {{1, 2}, {2, 3}, {3, 4}};
    assert((activitySelection(activities) == std::vector<int>{0, 1, 2}));
    std::cout << "[PASS] Touching activities test passed" << std::endl;
}

void testEmptyAndSingle() {
    std::vector<Activity> none;
    assert(activitySelection(none).empty());
    std::vector<Activity> one = {{-4, -2}};
    assert((activitySelection(one) == std::vector<int>{0}));
    std::cout << "[PASS] Empty and single test passed" << std::endl;
}

void testInputUntouched() {
    std::vector<Activity> activities = {{5, 7}, {1, 4}};
    std::vector<Activity> copy = activities;
    activitySelection(activities);
    assert(activities == copy);
    std::cout << "[PASS] Input untouched test passed" << std::endl;
}

int main() {
    std::cout << "Running Activity Selection tests..." << std::endl;
    testBasicSelection();
    testNoOverlap();
    testTouchingActivities();
    testEmptyAndSingle();
    testInputUntouched();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}

