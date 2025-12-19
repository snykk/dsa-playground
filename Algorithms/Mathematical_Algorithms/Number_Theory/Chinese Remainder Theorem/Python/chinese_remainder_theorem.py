"""
Chinese Remainder Theorem Implementation

The Chinese Remainder Theorem (CRT) solves systems of simultaneous
congruences with pairwise coprime moduli.
"""


def extended_gcd(a, b):
    """
    Extended Euclidean Algorithm
    
    Returns (gcd, x, y) such that ax + by = gcd(a, b)
    """
    a, b = abs(a), abs(b)
    if b == 0:
        return (a, 1, 0)
    gcd_val, x1, y1 = extended_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return (gcd_val, x, y)


def chinese_remainder_theorem(remainders, moduli):
    """
    Solve system of congruences using Chinese Remainder Theorem
    
    Solves: x ≡ remainders[i] (mod moduli[i]) for all i
    
    Args:
        remainders: List of remainders
        moduli: List of moduli (must be pairwise coprime)
        
    Returns:
        Solution x mod (product of all moduli), or None if moduli are not coprime
        
    Time Complexity: O(n log max(moduli))
    Space Complexity: O(n)
    """
    n = len(remainders)
    if n != len(moduli):
        return None
    
    # Check if moduli are pairwise coprime
    for i in range(n):
        for j in range(i + 1, n):
            gcd_val, _, _ = extended_gcd(moduli[i], moduli[j])
            if gcd_val != 1:
                return None  # Not pairwise coprime
    
    # Compute product of all moduli
    M = 1
    for m in moduli:
        M *= m
    
    # Compute solution
    x = 0
    for i in range(n):
        Mi = M // moduli[i]
        _, Mi_inv, _ = extended_gcd(Mi, moduli[i])
        # Make Mi_inv positive
        Mi_inv = (Mi_inv % moduli[i] + moduli[i]) % moduli[i]
        x += remainders[i] * Mi * Mi_inv
    
    return x % M


def chinese_remainder_theorem_pairwise(a1, m1, a2, m2):
    """
    Solve system of two congruences
    
    Solves: x ≡ a1 (mod m1) and x ≡ a2 (mod m2)
    
    Args:
        a1, a2: Remainders
        m1, m2: Moduli (must be coprime)
        
    Returns:
        Solution x mod (m1 * m2), or None if m1 and m2 are not coprime
    """
    gcd_val, x, _ = extended_gcd(m1, m2)
    if gcd_val != 1:
        return None  # Not coprime
    
    # Find solution
    M = m1 * m2
    x = (a1 * m2 * pow(m2, -1, m1) + a2 * m1 * pow(m1, -1, m2)) % M
    
    return x


def verify_crt_solution(x, remainders, moduli):
    """
    Verify that x satisfies all congruences
    
    Args:
        x: Solution to verify
        remainders: List of remainders
        moduli: List of moduli
        
    Returns:
        True if x satisfies all congruences, False otherwise
    """
    for i in range(len(remainders)):
        if x % moduli[i] != remainders[i]:
            return False
    return True


if __name__ == "__main__":
    # Example usage
    print("Chinese Remainder Theorem Examples:")
    
    # Example 1: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
    remainders = [2, 3, 2]
    moduli = [3, 5, 7]
    solution = chinese_remainder_theorem(remainders, moduli)
    print(f"x ≡ {remainders} (mod {moduli})")
    print(f"Solution: x = {solution}")
    print(f"Verification: {verify_crt_solution(solution, remainders, moduli)}")
    # Should be 23
    
    # Example 2: x ≡ 1 (mod 3), x ≡ 2 (mod 5)
    print(f"\nPairwise CRT:")
    x = chinese_remainder_theorem_pairwise(1, 3, 2, 5)
    print(f"x ≡ 1 (mod 3), x ≡ 2 (mod 5)")
    print(f"Solution: x = {x}")
    # Should be 7
