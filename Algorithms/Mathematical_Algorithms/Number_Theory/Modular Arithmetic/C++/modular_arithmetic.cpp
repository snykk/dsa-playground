/**
 * Modular Arithmetic Implementation (C++)
 * 
 * Modular arithmetic is a system of arithmetic for integers, where numbers
 * "wrap around" after reaching a certain value (the modulus).
 */

#include <cstdlib>  // For abs

/**
 * Compute (a + b) mod m
 * Time Complexity: O(1)
 */
long long modAdd(long long a, long long b, long long m) {
    return ((a % m) + (b % m)) % m;
}

/**
 * Compute (a - b) mod m (always non-negative)
 * Time Complexity: O(1)
 */
long long modSubtract(long long a, long long b, long long m) {
    long long result = ((a % m) - (b % m)) % m;
    return (result + m) % m;
}

/**
 * Compute (a * b) mod m
 * Time Complexity: O(1)
 */
long long modMultiply(long long a, long long b, long long m) {
    return ((a % m) * (b % m)) % m;
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
        return -1;  // Inverse doesn't exist
    }
    
    return (result.x % m + m) % m;
}

/**
 * Compute (a / b) mod m using modular inverse
 * Returns -1 if inverse doesn't exist
 * Time Complexity: O(log min(b, m))
 */
long long modDivide(long long a, long long b, long long m) {
    long long inv = modInverse(b, m);
    if (inv == -1) {
        return -1;  // Inverse doesn't exist
    }
    
    return modMultiply(a, inv, m);
}

/**
 * Compute (base^exponent) mod m using binary exponentiation
 * Time Complexity: O(log exponent)
 */
long long modPower(long long base, long long exponent, long long m) {
    if (m == 1) {
        return 0;
    }
    
    long long result = 1;
    base = base % m;
    
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = (result * base) % m;
        }
        exponent = exponent >> 1;
        base = (base * base) % m;
    }
    
    return result;
}

// Example usage (uncomment to use)
/*
#include <iostream>
int main() {
    long long m = 11;
    
    std::cout << "Modular Arithmetic Examples (mod 11):" << std::endl;
    std::cout << "(7 + 5) mod 11 = " << modAdd(7, 5, m) << std::endl;
    std::cout << "(7 - 5) mod 11 = " << modSubtract(7, 5, m) << std::endl;
    std::cout << "(7 * 5) mod 11 = " << modMultiply(7, 5, m) << std::endl;
    std::cout << "(7 / 5) mod 11 = " << modDivide(7, 5, m) << std::endl;
    std::cout << "(2^5) mod 11 = " << modPower(2, 5, m) << std::endl;
    
    return 0;
}
*/

