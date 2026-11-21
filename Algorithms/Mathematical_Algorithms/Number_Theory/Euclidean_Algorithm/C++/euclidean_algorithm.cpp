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
 * LCM(a, b) = |a| / GCD(a, b) * |b|
 *
 * Dividing before multiplying keeps the intermediate value as small as the
 * result. The result itself must still fit in a long long.
 *
 * Time Complexity: O(log min(a, b))
 * Space Complexity: O(log min(a, b)) for the recursive gcd it calls
 */
long long lcm(long long a, long long b) {
    if (a == 0 || b == 0) {
        return 0;
    }

    return std::abs(a) / gcd(a, b) * std::abs(b);
}

/**
 * Extended Euclidean Algorithm
 *
 * Finds integers x and y such that: a*x + b*y = GCD(a, b), for inputs of any
 * sign. It runs on |a| and |b|, then negates x when a is negative and y when
 * b is negative. (LLONG_MIN is not supported: it has no positive counterpart.)
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

// Extended Euclid for a, b >= 0.
static ExtendedGCD extendedGcdNonNeg(long long a, long long b) {
    if (b == 0) {
        return {a, 1, 0};
    }

    ExtendedGCD result = extendedGcdNonNeg(b, a % b);
    return {result.gcd, result.y, result.x - (a / b) * result.y};
}

ExtendedGCD extendedGcd(long long a, long long b) {
    ExtendedGCD result = extendedGcdNonNeg(std::abs(a), std::abs(b));
    if (a < 0) result.x = -result.x;
    if (b < 0) result.y = -result.y;
    return result;
}
