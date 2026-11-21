"""
Euclidean Algorithm Implementation

The Euclidean algorithm is an efficient method for computing the greatest
common divisor (GCD) of two integers. It can also be used to compute the
least common multiple (LCM).
"""


def gcd(a, b):
    """
    Compute Greatest Common Divisor using Euclidean Algorithm
    
    Args:
        a: First integer
        b: Second integer
        
    Returns:
        GCD of a and b
        
    Time Complexity: O(log min(a, b))
    Space Complexity: O(log min(a, b)) for the recursion stack
    """
    # Ensure non-negative
    a, b = abs(a), abs(b)
    
    # Base case
    if b == 0:
        return a
    
    # Recursive case: GCD(a, b) = GCD(b, a mod b)
    return gcd(b, a % b)


def gcd_iterative(a, b):
    """
    Compute GCD using iterative Euclidean Algorithm
    
    Args:
        a: First integer
        b: Second integer
        
    Returns:
        GCD of a and b
        
    Time Complexity: O(log min(a, b))
    Space Complexity: O(1)
    """
    a, b = abs(a), abs(b)
    
    while b != 0:
        a, b = b, a % b
    
    return a


def lcm(a, b):
    """
    Compute Least Common Multiple using GCD
    
    LCM(a, b) = |a * b| / GCD(a, b)
    
    Args:
        a: First integer
        b: Second integer
        
    Returns:
        LCM of a and b
        
    Time Complexity: O(log min(a, b))
    Space Complexity: O(log min(a, b)) for the recursive gcd it calls
    """
    if a == 0 or b == 0:
        return 0
    
    return abs(a * b) // gcd(a, b)


def _extended_gcd_nonneg(a, b):
    """Extended Euclid for a, b >= 0. Returns (g, x, y) with a*x + b*y = g."""
    if b == 0:
        return (a, 1, 0)

    gcd_val, x1, y1 = _extended_gcd_nonneg(b, a % b)
    return (gcd_val, y1, x1 - (a // b) * y1)


def extended_gcd(a, b):
    """
    Extended Euclidean Algorithm

    Finds integers x and y such that: a*x + b*y = GCD(a, b)
    (Bezout's identity), for inputs of any sign.

    The algorithm runs on |a| and |b|, then negates x when a is negative and
    y when b is negative, so the identity holds for the original inputs.

    Args:
        a: First integer
        b: Second integer

    Returns:
        Tuple (gcd, x, y) where gcd = GCD(a, b) >= 0 and a*x + b*y = gcd

    Time Complexity: O(log min(|a|, |b|))
    Space Complexity: O(log min(|a|, |b|)) due to recursion
    """
    gcd_val, x, y = _extended_gcd_nonneg(abs(a), abs(b))
    return (gcd_val, -x if a < 0 else x, -y if b < 0 else y)


if __name__ == "__main__":
    # Example usage
    print("Euclidean Algorithm Examples:")
    print(f"GCD(48, 18) = {gcd(48, 18)}")  # Should be 6
    print(f"GCD(100, 25) = {gcd(100, 25)}")  # Should be 25
    print(f"GCD(17, 13) = {gcd(17, 13)}")  # Should be 1 (coprime)
    
    print(f"\nLCM(12, 18) = {lcm(12, 18)}")  # Should be 36
    print(f"LCM(7, 5) = {lcm(7, 5)}")  # Should be 35
    
    print("\nExtended GCD(48, 18):")
    gcd_val, x, y = extended_gcd(48, 18)
    print(f"GCD = {gcd_val}, x = {x}, y = {y}")
    print(f"Verification: 48*{x} + 18*{y} = {48*x + 18*y}")

    print("\nExtended GCD(-48, 18):")
    gcd_val, x, y = extended_gcd(-48, 18)
    print(f"GCD = {gcd_val}, x = {x}, y = {y}")
    print(f"Verification: -48*{x} + 18*{y} = {-48*x + 18*y}")
