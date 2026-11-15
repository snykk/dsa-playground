/**
 * Bitmask Dynamic Programming (C++)
 *
 * Traveling Salesman Problem over subsets of cities encoded as bitmasks.
 * dp[mask][last] is the cheapest path that starts at city 0, visits exactly
 * the cities in mask and stands at city last.
 */

#include <algorithm>
#include <cstddef>
#include <limits>
#include <vector>

// A missing edge in the distance matrix, and the result when no tour exists
// (Python uses float('inf') for both).
constexpr double kInfinity = std::numeric_limits<double>::infinity();

/**
 * Minimum cost to visit all cities and return to city 0.
 *
 * distances is an n x n matrix; kInfinity marks a missing edge.
 * Returns kInfinity if no tour exists (every tour uses a missing edge) and 0
 * for no cities.
 *
 * Time Complexity: O(n^2 * 2^n)
 * Space Complexity: O(n * 2^n)
 */
double travelingSalesmanDp(const std::vector<std::vector<double>>& distances) {
    const std::size_t n = distances.size();
    if (n == 0) {
        return 0;
    }

    const std::size_t full = (std::size_t{1} << n) - 1;
    std::vector<std::vector<double>> dp(full + 1, std::vector<double>(n, kInfinity));
    dp[1][0] = 0;  // Start at city 0

    for (std::size_t mask = 1; mask <= full; ++mask) {
        if (!(mask & 1)) {
            continue;  // every tour starts at city 0
        }
        for (std::size_t last = 0; last < n; ++last) {
            if (!(mask & (std::size_t{1} << last))) {
                continue;
            }
            for (std::size_t next = 0; next < n; ++next) {
                if (mask & (std::size_t{1} << next)) {
                    continue;
                }
                const std::size_t newMask = mask | (std::size_t{1} << next);
                dp[newMask][next] = std::min(dp[newMask][next], dp[mask][last] + distances[last][next]);
            }
        }
    }

    // Return to start
    double result = kInfinity;
    for (std::size_t last = 0; last < n; ++last) {
        result = std::min(result, dp[full][last] + distances[last][0]);
    }
    return result;
}
