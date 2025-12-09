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
    std::cout << "✓ Deadline scheduling test passed" << std::endl;
}

int main() {
    std::cout << "Running Job Scheduling tests..." << std::endl;
    testDeadlineScheduling();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

