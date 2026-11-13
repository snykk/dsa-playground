/**
 * Sieve of Eratosthenes Implementation (C++)
 *
 * The Sieve of Eratosthenes is an efficient algorithm for finding all prime
 * numbers up to a given limit n.
 *
 * The loop counters are long long, so the sieve is also correct for n close
 * to INT_MAX (a 32-bit i * i or j + i would overflow there). A negative n
 * gives an empty result.
 */

#include <algorithm>
#include <vector>

/**
 * Find all prime numbers up to n using Sieve of Eratosthenes
 * Time Complexity: O(n log log n)
 * Space Complexity: O(n)
 */
std::vector<int> sieveOfEratosthenes(int n) {
    std::vector<int> primes;
    
    if (n < 2) {
        return primes;
    }
    
    // Create boolean array, initially all true
    std::vector<bool> isPrime(static_cast<size_t>(n) + 1, true);
    isPrime[0] = isPrime[1] = false;
    
    // Sieve process: composites below i * i were crossed out by smaller primes
    for (long long i = 2; i * i <= n; i++) {
        if (isPrime[i]) {
            // Mark multiples of i as composite
            for (long long j = i * i; j <= n; j += i) {
                isPrime[j] = false;
            }
        }
    }
    
    // Collect all primes
    for (int i = 2; i <= n; i++) {
        if (isPrime[i]) {
            primes.push_back(i);
        }
    }
    
    return primes;
}

/**
 * Return boolean array indicating primes up to n (size n + 1; empty for n < 0)
 * Time Complexity: O(n log log n)
 * Space Complexity: O(n)
 */
std::vector<bool> sieveBoolean(int n) {
    if (n < 0) {
        return std::vector<bool>();
    }
    
    std::vector<bool> isPrime(static_cast<size_t>(n) + 1, false);
    
    if (n < 2) {
        return isPrime;
    }
    
    std::fill(isPrime.begin(), isPrime.end(), true);
    isPrime[0] = isPrime[1] = false;
    
    for (long long i = 2; i * i <= n; i++) {
        if (isPrime[i]) {
            for (long long j = i * i; j <= n; j += i) {
                isPrime[j] = false;
            }
        }
    }
    
    return isPrime;
}

/**
 * Check if n is prime using precomputed sieve. A negative n is not prime, and
 * an n beyond the end of the sieve is reported as false (it was never sieved).
 * Time Complexity: O(1)
 */
bool isPrimeSieve(int n, const std::vector<bool>& sieve) {
    if (n >= 0 && static_cast<size_t>(n) < sieve.size()) {
        return sieve[n];
    }
    return false;
}
