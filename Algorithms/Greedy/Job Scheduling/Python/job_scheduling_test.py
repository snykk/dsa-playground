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
        self.assertGreater(profit, 0)
        self.assertGreater(len(scheduled), 0)
    
    def test_earliest_deadline(self):
        """Test earliest deadline first"""
        jobs = [(1, 4, 5), (2, 2, 3), (3, 6, 4)]
        scheduled = job_scheduling_earliest_deadline(jobs)
        self.assertEqual(len(scheduled), 3)
    
    def test_weighted_completion_time(self):
        """Test weighted completion time"""
        jobs = [(1, 3, 10), (2, 1, 20), (3, 2, 15)]
        scheduled, total = job_scheduling_weighted_completion_time(jobs)
        self.assertEqual(len(scheduled), 3)
        self.assertGreater(total, 0)


if __name__ == '__main__':
    unittest.main()

