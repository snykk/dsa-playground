/**
 * Miller-Rabin Primality Test Implementation (C++)
 * 
 * The Miller-Rabin test is a probabilistic algorithm for determining whether
 * a number is prime. It is based on Fermat's little theorem and is widely
 * used in practice.
 */

#include <cstdlib>
#include <ctime>
#include <vector>

/**
 * Compute (base^exponent) mod modulus using binary exponentiation
 */
long long modPow(long long base, long long exponent, long long modulus) {
    if (modulus == 1) {
        return 0;
    }
    
    long long result = 1;
    base = base % modulus;
    
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1;
        base = (base * base) % modulus;
    }
    
    return result;
}

/**
 * Miller-Rabin primality test
 * Time Complexity: O(k log³ n)
 */
bool millerRabin(long long n, int k = 5) {
    if (n < 2) {
        return false;
    }
    if (n == 2 || n == 3) {
        return true;
    }
    if (n % 2 == 0) {
        return false;
    }
    
    // Write n-1 as d * 2^r
    long long d = n - 1;
    int r = 0;
    while (d % 2 == 0) {
        d /= 2;
        r++;
    }
    
    // Witness loop
    for (int i = 0; i < k; i++) {
        long long a = 2 + rand() % (n - 3);
        long long x = modPow(a, d, n);
        
        if (x == 1 || x == n - 1) {
            continue;
        }
        
        bool composite = true;
        for (int j = 0; j < r - 1; j++) {
            x = modPow(x, 2, n);
            if (x == n - 1) {
                composite = false;
                break;
            }
        }
        
        if (composite) {
            return false;  // Composite
        }
    }
    
    return true;  // Probably prime
}

/**
 * Check if n is prime using Miller-Rabin test
 */
bool isPrimeMillerRabin(long long n, int k = 5) {
    if (n < 2) {
        return false;
    }
    if (n == 2) {
        return true;
    }
    if (n % 2 == 0) {
        return false;
    }
    
    return millerRabin(n, k);
}

/**
 * Deterministic Miller-Rabin for n < 2^64
 * Uses specific bases that are known to work for all numbers < 2^64
 */
bool millerRabinDeterministic(long long n) {
    if (n < 2) {
        return false;
    }
    if (n == 2 || n == 3) {
        return true;
    }
    if (n % 2 == 0) {
        return false;
    }
    
    // Bases for deterministic test (for n < 2^64)
    std::vector<long long> bases = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37};
    
    // Write n-1 as d * 2^r
    long long d = n - 1;
    int r = 0;
    while (d % 2 == 0) {
        d /= 2;
        r++;
    }
    
    for (long long a : bases) {
        if (a >= n) {
            continue;
        }
        
        long long x = modPow(a, d, n);
        if (x == 1 || x == n - 1) {
            continue;
        }
        
        bool composite = true;
        for (int i = 0; i < r - 1; i++) {
            x = modPow(x, 2, n);
            if (x == n - 1) {
                composite = false;
                break;
            }
        }
        
        if (composite) {
            return false;
        }
    }
    
    return true;
}

// Example usage (uncomment to use)
/*
#include <iostream>
int main() {
    srand(time(NULL));
    
    std::vector<long long> test_numbers = {2, 3, 17, 97, 100, 101, 561, 1105};
    
    std::cout << "Miller-Rabin Primality Test Examples:" << std::endl;
    for (long long n : test_numbers) {
        bool result = isPrimeMillerRabin(n);
        std::cout << n << " is " << (result ? "probably prime" : "composite") << std::endl;
    }
    
    return 0;
}
*/

