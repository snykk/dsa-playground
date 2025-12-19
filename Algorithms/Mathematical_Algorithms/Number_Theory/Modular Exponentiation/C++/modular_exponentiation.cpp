/**
 * Modular Exponentiation Implementation (C++)
 * 
 * Modular exponentiation computes (base^exponent) mod modulus efficiently
 * using binary exponentiation (also known as fast exponentiation).
 */

#include <cstdlib>

/**
 * Compute (base^exponent) mod modulus using binary exponentiation
 * Time Complexity: O(log exponent)
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
 * Extended Euclidean Algorithm helper
 */
struct ExtendedGCD {
    long long gcd;
    long long x;
    long long y;
};

ExtendedGCD extendedGcd(long long a, long long b) {
    a = std::abs(a);
    b = std::abs(b);
    
    if (b == 0) {
        return {a, 1, 0};
    }
    
    ExtendedGCD result = extendedGcd(b, a % b);
    long long x = result.y;
    long long y = result.x - (a / b) * result.y;
    
    return {result.gcd, x, y};
}

/**
 * Compute modular multiplicative inverse
 * Returns -1 if inverse doesn't exist
 * Time Complexity: O(log min(a, m))
 */
long long modInverse(long long a, long long m) {
    ExtendedGCD result = extendedGcd(a, m);
    
    if (result.gcd != 1) {
        return -1;
    }
    
    return (result.x % m + m) % m;
}

// Example usage (uncomment to use)
/*
#include <iostream>
int main() {
    std::cout << "Modular Exponentiation Examples:" << std::endl;
    std::cout << "2^10 mod 1000 = " << modPow(2, 10, 1000) << std::endl;
    std::cout << "3^5 mod 7 = " << modPow(3, 5, 7) << std::endl;
    
    long long inv = modInverse(3, 11);
    std::cout << "Inverse of 3 mod 11 = " << inv << std::endl;
    
    return 0;
}
*/

