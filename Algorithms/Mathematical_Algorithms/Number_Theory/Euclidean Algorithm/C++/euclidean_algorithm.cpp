/**
 * Euclidean Algorithm Implementation (C++)
 * 
 * The Euclidean algorithm is an efficient method for computing the greatest
 * common divisor (GCD) of two integers. It can also be used to compute the
 * least common multiple (LCM).
 */

#include <cstdlib>  // For abs

/**
 * Compute Greatest Common Divisor using recursive Euclidean Algorithm
 * 
 * Time Complexity: O(log min(a, b))
 * Space Complexity: O(log min(a, b))
 */
long long gcd(long long a, long long b) {
    a = std::abs(a);
    b = std::abs(b);
    
    if (b == 0) {
        return a;
    }
    
    return gcd(b, a % b);
}

/**
 * Compute GCD using iterative Euclidean Algorithm
 * 
 * Time Complexity: O(log min(a, b))
 * Space Complexity: O(1)
 */
long long gcdIterative(long long a, long long b) {
    a = std::abs(a);
    b = std::abs(b);
    
    while (b != 0) {
        long long temp = b;
        b = a % b;
        a = temp;
    }
    
    return a;
}

/**
 * Compute Least Common Multiple using GCD
 * 
 * LCM(a, b) = |a * b| / GCD(a, b)
 * 
 * Time Complexity: O(log min(a, b))
 * Space Complexity: O(1)
 */
long long lcm(long long a, long long b) {
    if (a == 0 || b == 0) {
        return 0;
    }
    
    return std::abs(a * b) / gcd(a, b);
}

/**
 * Extended Euclidean Algorithm
 * 
 * Finds integers x and y such that: ax + by = GCD(a, b)
 * 
 * Returns: struct containing gcd, x, and y
 * Time Complexity: O(log min(a, b))
 * Space Complexity: O(log min(a, b))
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

// Example usage (uncomment to use)
/*
#include <iostream>
int main() {
    std::cout << "Euclidean Algorithm Examples:" << std::endl;
    std::cout << "GCD(48, 18) = " << gcd(48, 18) << std::endl;
    std::cout << "LCM(12, 18) = " << lcm(12, 18) << std::endl;
    
    ExtendedGCD result = extendedGcd(48, 18);
    std::cout << "Extended GCD(48, 18): GCD = " << result.gcd 
              << ", x = " << result.x << ", y = " << result.y << std::endl;
    
    return 0;
}
*/
