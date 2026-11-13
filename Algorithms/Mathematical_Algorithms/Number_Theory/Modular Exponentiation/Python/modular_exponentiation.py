"""
Modular Exponentiation Implementation

Modular exponentiation computes (base^exponent) mod modulus efficiently
using binary exponentiation (also known as fast exponentiation).
"""


def mod_pow(base, exponent, modulus):
    """
    Compute (base^exponent) mod modulus using binary exponentiation
    
    Args:
        base: Base number (any sign)
        exponent: Exponent; a negative exponent means the inverse power,
            base^(-e) = (base^-1)^e
        modulus: Modulus (positive integer)
        
    Returns:
        (base^exponent) mod modulus in [0, modulus), or None if the exponent
        is negative and base has no inverse modulo modulus
        
    Time Complexity: O(log |exponent|)
    Space Complexity: O(1)
    """
    if exponent < 0:
        inv = mod_inverse(base, modulus)
        if inv is None:
            return None
        return mod_pow(inv, -exponent, modulus)
    if modulus == 1:
        return 0
    
    result = 1
    base = base % modulus
    
    while exponent > 0:
        # If exponent is odd, multiply result with base
        if exponent % 2 == 1:
            result = (result * base) % modulus
        
        # Square the base and halve the exponent
        exponent = exponent >> 1  # exponent //= 2
        base = (base * base) % modulus
    
    return result


def mod_pow_recursive(base, exponent, modulus):
    """
    Compute (base^exponent) mod modulus using recursive binary exponentiation
    
    Args:
        base: Base number (any sign)
        exponent: Exponent; a negative exponent means the inverse power
        modulus: Modulus (positive integer)
        
    Returns:
        (base^exponent) mod modulus in [0, modulus), or None if the exponent
        is negative and base has no inverse modulo modulus
        
    Time Complexity: O(log |exponent|)
    Space Complexity: O(log |exponent|)
    """
    if exponent < 0:
        inv = mod_inverse(base, modulus)
        if inv is None:
            return None
        return mod_pow_recursive(inv, -exponent, modulus)
    if modulus == 1:
        return 0
    
    if exponent == 0:
        return 1
    
    if exponent % 2 == 0:
        # Even exponent: base^exponent = (base^(exponent/2))^2
        temp = mod_pow_recursive(base, exponent // 2, modulus)
        return (temp * temp) % modulus
    else:
        # Odd exponent: base^exponent = base * base^(exponent-1)
        return (base * mod_pow_recursive(base, exponent - 1, modulus)) % modulus


def _extended_gcd_nonneg(a, b):
    """Extended Euclid for a, b >= 0. Returns (g, x, y) with a*x + b*y = g."""
    if b == 0:
        return (a, 1, 0)
    gcd_val, x1, y1 = _extended_gcd_nonneg(b, a % b)
    return (gcd_val, y1, x1 - (a // b) * y1)


def extended_gcd_inline(a, b):
    """
    Helper function for Extended Euclidean Algorithm

    Returns (g, x, y) with a*x + b*y = g = gcd(a, b) >= 0, for inputs of any
    sign: it runs on |a| and |b|, then negates x when a < 0 and y when b < 0.
    """
    gcd_val, x, y = _extended_gcd_nonneg(abs(a), abs(b))
    return (gcd_val, -x if a < 0 else x, -y if b < 0 else y)


def mod_inverse(a, m):
    """
    Compute modular multiplicative inverse using Extended Euclidean Algorithm
    
    Finds x in [0, m) such that: (a * x) mod m = 1. Negative a is fine:
    the inverse of -3 modulo 11 is 7.
    
    Args:
        a: Number to find inverse for
        m: Modulus (must be coprime with a)
        
    Returns:
        Modular inverse of a mod m, or None if it doesn't exist
        
    Time Complexity: O(log min(a, m))
    Space Complexity: O(log min(a, m))
    """
    gcd_val, x, _ = extended_gcd_inline(a, m)
    
    if gcd_val != 1:
        # Inverse doesn't exist if a and m are not coprime
        return None
    
    return x % m


if __name__ == "__main__":
    # Example usage
    print("Modular Exponentiation Examples:")
    print(f"2^10 mod 1000 = {mod_pow(2, 10, 1000)}")  # Should be 24
    print(f"3^5 mod 7 = {mod_pow(3, 5, 7)}")  # Should be 5
    print(f"5^13 mod 11 = {mod_pow(5, 13, 11)}")  # Should be 4
    print(f"2^-1 mod 11 = {mod_pow(2, -1, 11)}")  # Should be 6
    
    print("\nModular Inverse:")
    print(f"Inverse of 3 mod 11 = {mod_inverse(3, 11)}")  # Should be 4
    print(f"Verification: (3 * 4) mod 11 = {(3 * 4) % 11}")  # Should be 1
