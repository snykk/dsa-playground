"""
Sieve of Eratosthenes Implementation

The Sieve of Eratosthenes is an efficient algorithm for finding all prime
numbers up to a given limit n.
"""


def sieve_of_eratosthenes(n):
    """
    Find all prime numbers up to n using Sieve of Eratosthenes
    
    Args:
        n: Upper limit (inclusive)
        
    Returns:
        List of prime numbers up to n
        
    Time Complexity: O(n log log n)
    Space Complexity: O(n)
    """
    if n < 2:
        return []
    
    # Create boolean array, initially all True
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    
    # Sieve process
    for i in range(2, int(n ** 0.5) + 1):
        if is_prime[i]:
            # Mark multiples of i as composite
            for j in range(i * i, n + 1, i):
                is_prime[j] = False
    
    # Collect all primes
    primes = [i for i in range(2, n + 1) if is_prime[i]]
    return primes


def sieve_boolean(n):
    """
    Return boolean array indicating primes up to n
    
    Args:
        n: Upper limit (inclusive)
        
    Returns:
        Boolean list where is_prime[i] = True if i is prime
        
    Time Complexity: O(n log log n)
    Space Complexity: O(n)
    """
    if n < 2:
        return [False] * (n + 1)
    
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    
    for i in range(2, int(n ** 0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False
    
    return is_prime


def is_prime_sieve(n, sieve):
    """
    Check if n is prime using precomputed sieve
    
    Args:
        n: Number to check
        sieve: Boolean array from sieve_boolean
        
    Returns:
        True if n is prime, False otherwise
        
    Time Complexity: O(1)
    Space Complexity: O(1)
    """
    if n < len(sieve):
        return sieve[n]
    return False


if __name__ == "__main__":
    # Example usage
    print("Sieve of Eratosthenes Examples:")
    primes = sieve_of_eratosthenes(30)
    print(f"Primes up to 30: {primes}")
    # Should be: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    
    print(f"\nNumber of primes up to 100: {len(sieve_of_eratosthenes(100))}")
    # Should be 25
    
    # Using boolean array
    sieve = sieve_boolean(100)
    print(f"\nIs 17 prime? {sieve[17]}")  # True
    print(f"Is 20 prime? {sieve[20]}")  # False
