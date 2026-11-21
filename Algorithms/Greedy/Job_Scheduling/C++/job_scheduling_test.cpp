/**
 * Test cases for Job Scheduling (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <climits>
#include <cstddef>
#include <numeric>
#include <random>
#include <stdexcept>
#include "job_scheduling.cpp"

using Jobs = std::vector<std::tuple<int, int, int>>;

// A seeded draw in [lo, hi]. The modulo keeps the sequence the same on every
// standard library (std::uniform_int_distribution is implementation-defined).
int pick(std::mt19937& rng, int lo, int hi) {
    return lo + static_cast<int>(rng() % static_cast<unsigned>(hi - lo + 1));
}

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

// The best feasible subset over every subset of up to 7 jobs, checked slot by slot.
void testDeadlineMatchesBruteForce() {
    std::mt19937 rng(3);
    for (int run = 0; run < 200; ++run) {
        int n = pick(rng, 1, 7);
        Jobs jobs;
        for (int i = 0; i < n; ++i) {
            jobs.emplace_back(i, pick(rng, 1, 5), pick(rng, 1, 30));
        }
        int best = 0;
        for (int mask = 0; mask < (1 << n); ++mask) {
            Jobs chosen;
            for (int i = 0; i < n; ++i) {
                if (mask >> i & 1) {
                    chosen.push_back(jobs[i]);
                }
            }
            std::sort(chosen.begin(), chosen.end(),
                      [](const std::tuple<int, int, int>& a, const std::tuple<int, int, int>& b) {
                          return std::get<1>(a) < std::get<1>(b);
                      });
            bool feasible = true;
            int sum = 0;
            for (std::size_t k = 0; k < chosen.size(); ++k) {
                feasible = feasible && static_cast<int>(k) + 1 <= std::get<1>(chosen[k]);
                sum += std::get<2>(chosen[k]);
            }
            if (feasible) {
                best = std::max(best, sum);
            }
        }
        Jobs copy = jobs;  // jobSchedulingDeadline sorts its argument in place
        assert(jobSchedulingDeadline(copy).first == best);
    }
    std::cout << "Deadline brute force test passed" << std::endl;
}

void testEarliestDeadline() {
    Jobs jobs = {{1, 4, 5}, {2, 2, 3}, {3, 6, 4}};
    assert((jobSchedulingEarliestDeadline(jobs) == std::vector<int>{2, 1, 3}));
    // A copy is sorted, as in Python: the argument keeps its order.
    assert((jobs == Jobs{{1, 4, 5}, {2, 2, 3}, {3, 6, 4}}));
    assert(jobSchedulingEarliestDeadline(Jobs{}).empty());
    std::cout << "Earliest deadline test passed" << std::endl;
}

void testWeightedCompletionTime() {
    Jobs jobs = {{1, 3, 10}, {2, 1, 20}, {3, 2, 15}};
    auto result = jobSchedulingWeightedCompletionTime(jobs);
    // Ratios weight / time: 20, 7.5, 3.33; completion times 1, 3, 6
    assert((result.first == std::vector<int>{2, 3, 1}));
    assert(result.second == 20 * 1 + 15 * 3 + 10 * 6);
    assert((jobs == Jobs{{1, 3, 10}, {2, 1, 20}, {3, 2, 15}}));
    auto none = jobSchedulingWeightedCompletionTime(Jobs{});
    assert(none.first.empty() && none.second == 0);
    std::cout << "Weighted completion time test passed" << std::endl;
}

// Python raises ZeroDivisionError for a processing time of 0, whatever the weight
// and wherever the job stands; the C++ port throws std::domain_error.
void testWeightedCompletionTimeZeroProcessingTime() {
    const Jobs cases[] = {{{1, 0, 5}}, {{1, 2, 3}, {2, 0, 4}}, {{1, 0, 0}}};
    for (const Jobs& jobs : cases) {
        bool threw = false;
        try {
            jobSchedulingWeightedCompletionTime(jobs);
        } catch (const std::domain_error&) {
            threw = true;
        }
        assert(threw);
    }
    std::cout << "Zero processing time test passed" << std::endl;
}

// Outputs computed by running the Python implementation: fixed cases first, then
// seeded random ones with many ties, negative values and repeated ids.
struct EdfCase {
    Jobs jobs;  // (id, deadline, processing_time)
    std::vector<int> order;
};

const std::vector<EdfCase> kEdfAgreement = {
    {{{1, 4, 5}, {2, 2, 3}, {3, 6, 4}}, {2, 1, 3}},
    {{{5, 3, 1}, {6, 1, 9}, {7, 3, 2}, {8, -1, 0}}, {8, 6, 5, 7}},
    {{{3, 2, 1}, {1, 2, 1}, {2, 2, 1}}, {3, 1, 2}},
    {{{9, 0, 0}}, {9}},
    {{{-1, 5, 1}, {-1, 2, 1}, {0, 5, 0}}, {-1, -1, 0}},
    {{{1, 5, 1}, {2, 4, 1}, {3, 3, 1}, {4, 2, 1}, {5, 1, 1}}, {5, 4, 3, 2, 1}},
    {{{11, 2, 0}, {3, -1, 1}, {3, -2, 1}}, {3, 3, 11}},
    {{{-4, 2, 1}, {11, -2, 4}, {6, 1, 1}, {6, 3, 1}, {-4, 0, 4}}, {11, -4, 6, -4, 6}},
    {{{7, 3, 4}}, {7}},
    {{{-1, 0, 3}, {9, -2, 0}}, {9, -1}},
    {{{14, -1, 1}, {2, 3, 4}}, {14, 2}},
    {{{4, 2, 0}, {3, 0, 1}, {7, -2, 0}}, {7, 3, 4}},
    {{{2, -2, 2}}, {2}},
    {{{8, 1, 3}, {19, 2, 4}}, {8, 19}},
    {{{6, 0, 0}, {1, 0, 4}, {1, -1, 4}, {9, 1, 4}, {5, 0, 0}, {16, 3, 4}, {19, 2, 2}}, {1, 6, 1, 5, 9, 19, 16}},
    {{{18, -2, 0}, {1, -1, 3}, {5, 3, 4}, {11, 0, 1}, {3, -1, 0}, {10, 2, 3}}, {18, 1, 3, 11, 10, 5}},
    {{{-1, 2, 0}, {1, 3, 3}}, {-1, 1}},
    {{{9, 1, 2}, {4, 1, 4}, {18, 0, 4}}, {18, 9, 4}},
    {{{12, 1, 0}, {8, -1, 3}, {4, 3, 4}, {11, 3, 2}}, {8, 12, 4, 11}},
    {{{-5, -2, 3}, {8, -2, 2}, {2, 0, 4}, {17, -1, 3}, {16, 2, 4}, {6, 2, 3}}, {-5, 8, 17, 2, 16, 6}},
    {{{4, 1, 0}}, {4}},
    {{{12, 3, 2}, {4, 3, 4}, {11, 0, 0}, {3, 1, 2}, {8, 3, 2}}, {11, 3, 12, 4, 8}},
    {{{13, -2, 4}, {9, 2, 3}, {-3, 3, 2}}, {13, 9, -3}},
    {{{0, 1, 4}, {20, 1, 3}, {0, 1, 3}, {9, -1, 4}}, {9, 0, 20, 0}},
    {{{-1, -2, 4}, {-3, 2, 3}, {2, -1, 1}, {1, 1, 0}, {6, -1, 0}, {10, 3, 1}, {-1, 3, 1}}, {-1, 2, 6, 1, -3, 10, -1}},
    {{{19, 3, 0}, {10, 2, 0}, {-5, -2, 2}, {7, -2, 2}, {15, 3, 2}, {12, 0, 0}}, {-5, 7, 12, 10, 19, 15}},
};

struct SmithCase {
    Jobs jobs;  // (id, processing_time, weight)
    std::vector<int> order;
    long long total;
};

const std::vector<SmithCase> kSmithAgreement = {
    {{{1, 3, 10}, {2, 1, 20}, {3, 2, 15}}, {2, 3, 1}, 125LL},
    {{{1, 3, 1}, {2, 1, 2}, {3, 2, 3}}, {2, 3, 1}, 17LL},
    {{{1, 2, 4}, {2, 1, 2}, {3, 3, 6}, {4, 1, 5}}, {4, 1, 2, 3}, 67LL},
    {{{1, 6, 2}, {2, 3, 1}, {3, 9, 3}}, {1, 2, 3}, 75LL},
    {{{1, -2, 3}, {2, 1, 0}}, {2, 1}, -3LL},
    {{{1, 1, 0}, {2, -1, 0}}, {1, 2}, 0LL},
    {{{1, 4, 0}, {2, 2, 0}, {3, 1, 1}}, {3, 1, 2}, 1LL},
    {{{7, 5, 3}}, {7}, 15LL},
    {{{1, 134217730, 134217729}, {2, 134217731, 134217730}}, {1, 2}, 54043197139058700LL},
    {{{6, 2, 1}, {19, 1, 6}, {4, 6, -2}, {4, -3, 3}, {19, 2, 6}, {13, -3, 1}}, {19, 19, 6, 4, 13, 4}, 30LL},
    {{{5, 1, 1}, {5, 4, 1}, {5, 1, 6}, {15, 6, -2}, {2, 2, 5}, {1, 6, 3}, {-2, 3, 5}}, {5, 2, -2, 5, 1, 5, 15}, 68LL},
    {{{20, 6, 6}, {10, 2, 5}, {17, 4, 1}}, {10, 20, 17}, 70LL},
    {{{0, -2, 1}, {14, 4, -2}, {1, -3, 5}}, {0, 14, 1}, -11LL},
    {{{-2, 1, 3}}, {-2}, 3LL},
    {{{-1, -2, -1}, {0, 1, 6}, {14, 1, -2}, {10, 1, 2}, {19, 1, 4}, {13, -3, -1}, {20, 4, -3}}, {0, 19, 10, -1, 13, 20, 14}, 9LL},
    {{{7, 4, 0}, {2, 2, 0}, {18, 6, 6}, {13, 6, 1}, {1, -2, 2}, {13, 1, -1}, {16, 1, -1}}, {18, 13, 7, 2, 1, 13, 16}, 45LL},
    {{{0, 2, 5}, {9, 3, 3}, {15, 3, 5}, {-3, 6, -3}, {0, -1, 1}, {16, 3, 2}, {12, 3, 1}}, {0, 15, 9, 16, 12, -3, 0}, 54LL},
    {{{4, -1, 1}, {18, -3, 1}, {3, -3, 1}, {8, -2, 5}, {1, 6, 5}, {15, -3, 5}}, {1, 18, 3, 4, 15, 8}, -18LL},
    {{{1, 3, 5}}, {1}, 15LL},
    {{{10, -3, 6}, {10, 6, 6}, {11, -3, -1}, {8, 6, 0}, {9, -2, 2}, {5, -3, 0}, {-2, -2, -2}}, {10, -2, 11, 8, 5, 9, 10}, 25LL},
    {{{18, -2, -2}}, {18}, 4LL},
    {{{16, 2, 3}, {2, -1, 2}}, {16, 2}, 8LL},
    {{{-1, 6, 0}}, {-1}, 0LL},
    {{{0, -1, 1}}, {0}, -1LL},
    {{{-3, 1, -2}, {20, 2, 0}, {11, 6, -2}, {0, -2, -2}}, {0, 20, 11, -3}, -22LL},
    {{{14, 3, 5}, {6, -1, 1}, {11, 3, -2}, {0, 6, 2}, {-3, 6, -3}, {20, -2, -3}}, {14, 20, 0, -3, 11, 6}, -30LL},
    {{{-5, 4, 6}, {14, -1, -3}}, {14, -5}, 21LL},
    {{{16, 1, 0}}, {16}, 0LL},
    {{{6, -1, 1}, {-1, 4, 1}, {19, 1, 3}}, {19, -1, 6}, 12LL},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kEdfAgreement.size(); ++i) {
        const EdfCase& c = kEdfAgreement[i];
        if (jobSchedulingEarliestDeadline(c.jobs) != c.order) {
            std::cerr << "earliest deadline: agreement case " << i << " differs from Python\n";
        }
        assert(jobSchedulingEarliestDeadline(c.jobs) == c.order);
    }
    for (std::size_t i = 0; i < kSmithAgreement.size(); ++i) {
        const SmithCase& c = kSmithAgreement[i];
        auto result = jobSchedulingWeightedCompletionTime(c.jobs);
        if (result.first != c.order || result.second != c.total) {
            std::cerr << "weighted completion time: agreement case " << i
                      << " differs from Python\n";
        }
        assert(result.first == c.order && result.second == c.total);
    }
    std::cout << "Agreement with Python test passed" << std::endl;
}

// The largest completion time - deadline over the jobs, run in the given order.
long long maxLateness(const Jobs& jobs, const std::vector<std::size_t>& order) {
    long long time = 0;
    long long worst = LLONG_MIN;
    for (std::size_t index : order) {
        time += std::get<2>(jobs[index]);
        worst = std::max(worst, time - std::get<1>(jobs[index]));
    }
    return worst;
}

// Every order of up to 6 jobs: EDF reaches the smallest maximum lateness, and its
// order is the first one (by input position) that sorts the deadlines, which is
// the order a stable sort gives.
void testEarliestDeadlineMatchesBruteForce() {
    std::mt19937 rng(7);
    for (int run = 0; run < 200; ++run) {
        int n = pick(rng, 1, 6);
        Jobs jobs;  // the id is the input position
        for (int i = 0; i < n; ++i) {
            jobs.emplace_back(i, pick(rng, -2, 6), pick(rng, 1, 5));
        }
        std::vector<int> got = jobSchedulingEarliestDeadline(jobs);
        std::vector<std::size_t> gotOrder(got.begin(), got.end());

        std::vector<std::size_t> perm(n);
        std::iota(perm.begin(), perm.end(), 0);
        long long best = LLONG_MAX;
        std::vector<std::size_t> firstSorted;
        do {
            best = std::min(best, maxLateness(jobs, perm));
            bool sorted = true;
            for (int k = 0; k + 1 < n; ++k) {
                sorted = sorted && std::get<1>(jobs[perm[k]]) <= std::get<1>(jobs[perm[k + 1]]);
            }
            if (sorted && firstSorted.empty()) {
                firstSorted = perm;
            }
        } while (std::next_permutation(perm.begin(), perm.end()));

        assert(maxLateness(jobs, gotOrder) == best);
        assert(gotOrder == firstSorted);
    }
    std::cout << "Earliest deadline brute force test passed" << std::endl;
}

// The sum of weight * completion time, run in the given order.
long long weightedCost(const Jobs& jobs, const std::vector<std::size_t>& order) {
    long long time = 0;
    long long cost = 0;
    for (std::size_t index : order) {
        time += std::get<1>(jobs[index]);
        cost += std::get<2>(jobs[index]) * time;
    }
    return cost;
}

// Every order of up to 6 jobs: Smith's rule reaches the smallest cost, reports the
// cost of the order it returns, and that order is the first one (by input position)
// whose exact ratios w / p never increase, which is the order a stable sort gives.
void testWeightedCompletionTimeMatchesBruteForce() {
    std::mt19937 rng(5);
    for (int run = 0; run < 200; ++run) {
        int n = pick(rng, 1, 6);
        Jobs jobs;  // the id is the input position
        for (int i = 0; i < n; ++i) {
            jobs.emplace_back(i, pick(rng, 1, 6), pick(rng, -3, 9));
        }
        auto result = jobSchedulingWeightedCompletionTime(jobs);
        std::vector<std::size_t> gotOrder(result.first.begin(), result.first.end());

        std::vector<std::size_t> perm(n);
        std::iota(perm.begin(), perm.end(), 0);
        long long best = LLONG_MAX;
        std::vector<std::size_t> firstSorted;
        do {
            best = std::min(best, weightedCost(jobs, perm));
            bool sorted = true;
            for (int k = 0; k + 1 < n; ++k) {
                const auto& a = jobs[perm[k]];
                const auto& b = jobs[perm[k + 1]];
                // w_a / p_a >= w_b / p_b with both times positive
                sorted = sorted && std::get<2>(a) * std::get<1>(b) >= std::get<2>(b) * std::get<1>(a);
            }
            if (sorted && firstSorted.empty()) {
                firstSorted = perm;
            }
        } while (std::next_permutation(perm.begin(), perm.end()));

        assert(result.second == weightedCost(jobs, gotOrder));
        assert(result.second == best);
        assert(gotOrder == firstSorted);
    }
    std::cout << "Weighted completion time brute force test passed" << std::endl;
}

// Small inputs hide an unstable sort (both standard libraries use insertion sort
// below 16 elements), so 60 jobs with many equal keys check the tie order: keys in
// order, and input positions increasing among equal keys.
void testLargeInputsKeepInputOrderAmongTies() {
    std::mt19937 rng(11);
    for (int run = 0; run < 20; ++run) {
        Jobs edf;  // the id is the input position
        Jobs smith;
        for (int i = 0; i < 60; ++i) {
            edf.emplace_back(i, pick(rng, 0, 3), pick(rng, 1, 5));
            smith.emplace_back(i, pick(rng, 1, 3), pick(rng, 0, 3));
        }
        std::vector<int> order = jobSchedulingEarliestDeadline(edf);
        for (std::size_t k = 0; k + 1 < order.size(); ++k) {
            int da = std::get<1>(edf[order[k]]);
            int db = std::get<1>(edf[order[k + 1]]);
            assert(da < db || (da == db && order[k] < order[k + 1]));
        }
        order = jobSchedulingWeightedCompletionTime(smith).first;
        for (std::size_t k = 0; k + 1 < order.size(); ++k) {
            const auto& a = smith[order[k]];
            const auto& b = smith[order[k + 1]];
            int left = std::get<2>(a) * std::get<1>(b);   // w_a * p_b
            int right = std::get<2>(b) * std::get<1>(a);  // w_b * p_a
            assert(left > right || (left == right && order[k] < order[k + 1]));
        }
    }
    std::cout << "Large inputs tie order test passed" << std::endl;
}

int main() {
    std::cout << "Running Job Scheduling tests..." << std::endl;
    testDeadlineScheduling();
    testNegativeJobId();
    testClassicExample();
    testEmptyAndZeroDeadline();
    testDeadlineMatchesBruteForce();
    testEarliestDeadline();
    testWeightedCompletionTime();
    testWeightedCompletionTimeZeroProcessingTime();
    testAgreementWithPython();
    testEarliestDeadlineMatchesBruteForce();
    testWeightedCompletionTimeMatchesBruteForce();
    testLargeInputsKeepInputOrderAmongTies();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
