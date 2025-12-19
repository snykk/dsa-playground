"""
Modular Exponentiation Implementation

Modular exponentiation computes (base^exponent) mod modulus efficiently
using binary exponentiation (also known as fast exponentiation).
"""


def mod_pow(base, exponent, modulus):
    """
    Compute (base^exponent) mod modulus using binary exponentiation
    
    Args:
        base: Base number
        exponent: Exponent (non-negative integer)
        modulus: Modulus (positive integer)
        
    Returns:
        (base^exponent) mod modulus
        
    Time Complexity: O(log exponent)
    Space Complexity: O(1)
    """
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
        base: Base number
        exponent: Exponent (non-negative integer)
        modulus: Modulus (positive integer)
        
    Returns:
        (base^exponent) mod modulus
        
    Time Complexity: O(log exponent)
    Space Complexity: O(log exponent)
    """
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


def extended_gcd_inline(a, b):
    """Helper function for Extended Euclidean Algorithm"""
    a, b = abs(a), abs(b)
    if b == 0:
        return (a, 1, 0)
    gcd_val, x1, y1 = extended_gcd_inline(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return (gcd_val, x, y)


def mod_inverse(a, m):
    """
    Compute modular multiplicative inverse using Extended Euclidean Algorithm
    
    Finds x such that: (a * x) mod m = 1
    
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
    
    # Make sure result is positive
    return (x % m + m) % m


if __name__ == "__main__":
    # Example usage
    print("Modular Exponentiation Examples:")
    print(f"2^10 mod 1000 = {mod_pow(2, 10, 1000)}")  # Should be 24
    print(f"3^5 mod 7 = {mod_pow(3, 5, 7)}")  # Should be 5
    print(f"5^13 mod 11 = {mod_pow(5, 13, 11)}")  # Should be 3
    
    print(f"\nModular Inverse:")
    print(f"Inverse of 3 mod 11 = {mod_inverse(3, 11)}")  # Should be 4
    print(f"Verification: (3 * 4) mod 11 = {(3 * 4) % 11}")  # Should be 1
