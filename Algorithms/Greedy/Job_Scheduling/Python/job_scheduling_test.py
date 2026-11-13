"""
Test cases for Job Scheduling
"""

import unittest
from job_scheduling import (
    job_scheduling_deadline,
    job_scheduling_earliest_deadline,
    job_scheduling_weighted_completion_time
)


class TestJobScheduling(unittest.TestCase):
    
    def test_deadline_scheduling(self):
        """Test job scheduling with deadlines"""
        jobs = [(1, 2, 100), (2, 1, 19), (3, 2, 27), (4, 1, 25), (5, 3, 15)]
        profit, scheduled = job_scheduling_deadline(jobs)
        # Jobs taken in profit order: 100 (slot 2), 27 (slot 1), 15 (slot 3);
        # 25 and 19 find no free slot
        self.assertEqual((profit, scheduled), (142, [1, 3, 5]))

    def test_deadline_scheduling_edge_cases(self):
        self.assertEqual(job_scheduling_deadline([]), (0, []))
        # A deadline of 0 or less leaves no slot, so the job is never scheduled
        self.assertEqual(job_scheduling_deadline([(1, 0, 50), (2, 1, 5)]), (5, [2]))

    def test_deadline_scheduling_matches_brute_force(self):
        """Compare with the best feasible subset (checked slot by slot)"""
        import random
        rng = random.Random(3)
        for _ in range(200):
            n = rng.randint(1, 7)
            jobs = [(i, rng.randint(1, 5), rng.randint(1, 30)) for i in range(n)]
            best = 0
            for mask in range(1 << n):
                chosen = sorted((jobs[i] for i in range(n) if mask >> i & 1),
                                key=lambda j: j[1])
                if all(k + 1 <= j[1] for k, j in enumerate(chosen)):
                    best = max(best, sum(j[2] for j in chosen))
            self.assertEqual(job_scheduling_deadline(jobs)[0], best, jobs)
    
    def test_deadline_scheduling_negative_job_id(self):
        """Regression: -1 doubled as the "empty slot" marker, so a job with
        id -1 left its slot looking free and a second job was booked into it."""
        profit, scheduled = job_scheduling_deadline([(-1, 1, 100), (2, 1, 50)])
        self.assertEqual((profit, scheduled), (100, [-1]))
        profit, scheduled = job_scheduling_deadline([(-1, 2, 100), (2, 1, 50), (3, 2, 40)])
        self.assertEqual((profit, scheduled), (150, [-1, 2]))

    def test_earliest_deadline(self):
        """Test earliest deadline first"""
        jobs = [(1, 4, 5), (2, 2, 3), (3, 6, 4)]
        scheduled = job_scheduling_earliest_deadline(jobs)
        self.assertEqual(scheduled, [2, 1, 3])
        self.assertEqual(job_scheduling_earliest_deadline([]), [])
    
    def test_weighted_completion_time(self):
        """Test weighted completion time"""
        jobs = [(1, 3, 10), (2, 1, 20), (3, 2, 15)]
        scheduled, total = job_scheduling_weighted_completion_time(jobs)
        # Ratios weight / time: 20, 7.5, 3.33; completion times 1, 3, 6
        self.assertEqual(scheduled, [2, 3, 1])
        self.assertEqual(total, 20 * 1 + 15 * 3 + 10 * 6)
        self.assertEqual(job_scheduling_weighted_completion_time([]), ([], 0))

    def test_weighted_completion_time_matches_brute_force(self):
        import itertools
        import random
        rng = random.Random(5)
        for _ in range(100):
            n = rng.randint(1, 6)
            jobs = [(i, rng.randint(1, 6), rng.randint(1, 9)) for i in range(n)]
            best = None
            for perm in itertools.permutations(jobs):
                t = 0
                cost = 0
                for _, p, w in perm:
                    t += p
                    cost += w * t
                best = cost if best is None else min(best, cost)
            self.assertEqual(job_scheduling_weighted_completion_time(jobs)[1], best, jobs)


if __name__ == '__main__':
    unittest.main()

