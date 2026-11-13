/**
 * Test cases for Job Scheduling (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "job_scheduling.cpp"

void testDeadlineScheduling() {
    std::vector<std::tuple<int, int, int>> jobs = {
        {1, 2, 100}, {2, 1, 19}, {3, 2, 27}
    };
    auto result = jobSchedulingDeadline(jobs);
    // 100 takes slot 2, 27 takes slot 1; 19 (deadline 1) finds no free slot
    assert(result.first == 127);
    assert((result.second == std::vector<int>{1, 3}));
    std::cout << "Deadline scheduling test passed" << std::endl;
}

// Regression: -1 doubled as the "empty slot" marker, so a job with id -1
// left its slot looking free and a second job was booked into it.
void testNegativeJobId() {
    std::vector<std::tuple<int, int, int>> jobs = {{-1, 1, 100}, {2, 1, 50}};
    auto result = jobSchedulingDeadline(jobs);
    assert(result.first == 100);
    assert(result.second == std::vector<int>{-1});

    std::vector<std::tuple<int, int, int>> more = {{-1, 2, 100}, {2, 1, 50}, {3, 2, 40}};
    result = jobSchedulingDeadline(more);
    assert(result.first == 150);
    assert((result.second == std::vector<int>{-1, 2}));
    std::cout << "Negative job id test passed" << std::endl;
}

void testClassicExample() {
    std::vector<std::tuple<int, int, int>> jobs = {
        {1, 2, 100}, {2, 1, 19}, {3, 2, 27}, {4, 1, 25}, {5, 3, 15}
    };
    auto result = jobSchedulingDeadline(jobs);
    assert(result.first == 142);
    assert((result.second == std::vector<int>{1, 3, 5}));
    std::cout << "Classic example test passed" << std::endl;
}

void testEmptyAndZeroDeadline() {
    std::vector<std::tuple<int, int, int>> none;
    assert(jobSchedulingDeadline(none).first == 0);
    std::vector<std::tuple<int, int, int>> jobs = {{1, 0, 50}, {2, 1, 5}};
    assert(jobSchedulingDeadlineProfitOnly(jobs) == 5);
    std::cout << "Empty and zero deadline test passed" << std::endl;
}

int main() {
    std::cout << "Running Job Scheduling tests..." << std::endl;
    testDeadlineScheduling();
    testNegativeJobId();
    testClassicExample();
    testEmptyAndZeroDeadline();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}

