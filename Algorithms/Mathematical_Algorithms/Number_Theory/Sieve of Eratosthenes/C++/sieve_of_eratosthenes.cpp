/**
 * Sieve of Eratosthenes Implementation (C++)
 * 
 * The Sieve of Eratosthenes is an efficient algorithm for finding all prime
 * numbers up to a given limit n.
 */

#include <vector>
#include <cmath>

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
    std::vector<bool> isPrime(n + 1, true);
    isPrime[0] = isPrime[1] = false;
    
    // Sieve process
    for (int i = 2; i * i <= n; i++) {
        if (isPrime[i]) {
            // Mark multiples of i as composite
            for (int j = i * i; j <= n; j += i) {
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
 * Return boolean array indicating primes up to n
 * Time Complexity: O(n log log n)
 * Space Complexity: O(n)
 */
std::vector<bool> sieveBoolean(int n) {
    std::vector<bool> isPrime(n + 1, false);
    
    if (n < 2) {
        return isPrime;
    }
    
    std::fill(isPrime.begin(), isPrime.end(), true);
    isPrime[0] = isPrime[1] = false;
    
    for (int i = 2; i * i <= n; i++) {
        if (isPrime[i]) {
            for (int j = i * i; j <= n; j += i) {
                isPrime[j] = false;
            }
        }
    }
    
    return isPrime;
}

/**
 * Check if n is prime using precomputed sieve
 * Time Complexity: O(1)
 */
bool isPrimeSieve(int n, const std::vector<bool>& sieve) {
    if (n < static_cast<int>(sieve.size())) {
        return sieve[n];
    }
    return false;
}

// Example usage (uncomment to use)
/*
#include <iostream>
int main() {
    std::vector<int> primes = sieveOfEratosthenes(30);
    std::cout << "Primes up to 30: ";
    for (int p : primes) {
        std::cout << p << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
*/

