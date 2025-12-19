/**
 * Chinese Remainder Theorem Implementation (C++)
 * 
 * The Chinese Remainder Theorem (CRT) solves systems of simultaneous
 * congruences with pairwise coprime moduli.
 */

#include <vector>
#include <cstdlib>

/**
 * Extended Euclidean Algorithm
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
 */
long long modInverse(long long a, long long m) {
    ExtendedGCD result = extendedGcd(a, m);
    
    if (result.gcd != 1) {
        return -1;
    }
    
    return (result.x % m + m) % m;
}

/**
 * Compute (base^exponent) mod modulus
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
 * Solve system of congruences using Chinese Remainder Theorem
 * Time Complexity: O(n log max(moduli))
 */
long long chineseRemainderTheorem(const std::vector<long long>& remainders,
                                  const std::vector<long long>& moduli) {
    int n = remainders.size();
    if (n != static_cast<int>(moduli.size())) {
        return -1;
    }
    
    // Check if moduli are pairwise coprime
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            ExtendedGCD result = extendedGcd(moduli[i], moduli[j]);
            if (result.gcd != 1) {
                return -1;  // Not pairwise coprime
            }
        }
    }
    
    // Compute product of all moduli
    long long M = 1;
    for (long long m : moduli) {
        M *= m;
    }
    
    // Compute solution
    long long x = 0;
    for (int i = 0; i < n; i++) {
        long long Mi = M / moduli[i];
        long long Mi_inv = modInverse(Mi, moduli[i]);
        if (Mi_inv == -1) {
            return -1;
        }
        x = (x + remainders[i] * Mi % M * Mi_inv % M) % M;
    }
    
    return x;
}

/**
 * Solve system of two congruences
 */
long long chineseRemainderTheoremPairwise(long long a1, long long m1,
                                          long long a2, long long m2) {
    ExtendedGCD result = extendedGcd(m1, m2);
    if (result.gcd != 1) {
        return -1;  // Not coprime
    }
    
    long long M = m1 * m2;
    long long m2_inv = modInverse(m2, m1);
    long long m1_inv = modInverse(m1, m2);
    
    if (m2_inv == -1 || m1_inv == -1) {
        return -1;
    }
    
    long long x = (a1 * m2 % M * m2_inv % M + a2 * m1 % M * m1_inv % M) % M;
    return x;
}

/**
 * Verify that x satisfies all congruences
 */
bool verifyCrtSolution(long long x, const std::vector<long long>& remainders,
                      const std::vector<long long>& moduli) {
    for (size_t i = 0; i < remainders.size(); i++) {
        if (x % moduli[i] != remainders[i]) {
            return false;
        }
    }
    return true;
}

// Example usage (uncomment to use)
/*
#include <iostream>
int main() {
    std::vector<long long> remainders = {2, 3, 2};
    std::vector<long long> moduli = {3, 5, 7};
    long long solution = chineseRemainderTheorem(remainders, moduli);
    std::cout << "Solution: " << solution << std::endl;
    
    return 0;
}
*/

