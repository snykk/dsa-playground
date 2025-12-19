"""
Modular Arithmetic Implementation

Modular arithmetic is a system of arithmetic for integers, where numbers
"wrap around" after reaching a certain value (the modulus).
"""


def mod_add(a, b, m):
    """
    Compute (a + b) mod m
    
    Args:
        a: First integer
        b: Second integer
        m: Modulus (positive integer)
        
    Returns:
        (a + b) mod m
        
    Time Complexity: O(1)
    Space Complexity: O(1)
    """
    return ((a % m) + (b % m)) % m


def mod_subtract(a, b, m):
    """
    Compute (a - b) mod m
    
    Args:
        a: First integer
        b: Second integer
        m: Modulus (positive integer)
        
    Returns:
        (a - b) mod m (always non-negative)
        
    Time Complexity: O(1)
    Space Complexity: O(1)
    """
    result = ((a % m) - (b % m)) % m
    # Ensure result is non-negative
    return (result + m) % m


def mod_multiply(a, b, m):
    """
    Compute (a * b) mod m
    
    Args:
        a: First integer
        b: Second integer
        m: Modulus (positive integer)
        
    Returns:
        (a * b) mod m
        
    Time Complexity: O(1)
    Space Complexity: O(1)
    """
    return ((a % m) * (b % m)) % m


def mod_divide(a, b, m):
    """
    Compute (a / b) mod m using modular multiplicative inverse
    
    This is equivalent to (a * b^(-1)) mod m
    
    Args:
        a: Numerator
        b: Denominator (must be coprime with m)
        m: Modulus (positive integer)
        
    Returns:
        (a / b) mod m, or None if inverse doesn't exist
        
    Time Complexity: O(log min(b, m))
    Space Complexity: O(log min(b, m))
    """
    # Find modular inverse of b
    inv = mod_inverse(b, m)
    if inv is None:
        return None
    
    return mod_multiply(a, inv, m)


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
    def extended_gcd(a, b):
        a, b = abs(a), abs(b)
        if b == 0:
            return (a, 1, 0)
        gcd_val, x1, y1 = extended_gcd(b, a % b)
        x = y1
        y = x1 - (a // b) * y1
        return (gcd_val, x, y)
    
    gcd_val, x, _ = extended_gcd(a, m)
    
    if gcd_val != 1:
        return None
    
    return (x % m + m) % m


def mod_power(base, exponent, m):
    """
    Compute (base^exponent) mod m using binary exponentiation
    
    Args:
        base: Base number
        exponent: Exponent (non-negative integer)
        m: Modulus (positive integer)
        
    Returns:
        (base^exponent) mod m
        
    Time Complexity: O(log exponent)
    Space Complexity: O(1)
    """
    if m == 1:
        return 0
    
    result = 1
    base = base % m
    
    while exponent > 0:
        if exponent % 2 == 1:
            result = (result * base) % m
        exponent = exponent >> 1
        base = (base * base) % m
    
    return result


if __name__ == "__main__":
    # Example usage
    m = 11
    
    print("Modular Arithmetic Examples (mod 11):")
    print(f"(7 + 5) mod 11 = {mod_add(7, 5, m)}")  # Should be 1
    print(f"(7 - 5) mod 11 = {mod_subtract(7, 5, m)}")  # Should be 2
    print(f"(7 * 5) mod 11 = {mod_multiply(7, 5, m)}")  # Should be 2
    print(f"(7 / 5) mod 11 = {mod_divide(7, 5, m)}")  # Should be 8
    print(f"(2^5) mod 11 = {mod_power(2, 5, m)}")  # Should be 10
    
    print(f"\nModular Inverse:")
    print(f"Inverse of 3 mod 11 = {mod_inverse(3, m)}")  # Should be 4
    print(f"Verification: (3 * 4) mod 11 = {(3 * 4) % m}")  # Should be 1
