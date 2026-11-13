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
    assert(result.first >= 0);
    assert(result.second.size() > 0);
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

int main() {
    std::cout << "Running Job Scheduling tests..." << std::endl;
    testDeadlineScheduling();
    testNegativeJobId();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}

