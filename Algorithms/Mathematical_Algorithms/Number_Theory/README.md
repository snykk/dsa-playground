# Number Theory Algorithms

Fundamental number theory algorithms for competitive programming.

## Topics

| Algorithm | Description |
|-----------|-------------|
| [Euclidean Algorithm](Euclidean%20Algorithm/) | GCD computation |
| [Sieve of Eratosthenes](Sieve%20of%20Eratosthenes/) | Prime number generation |
| [Modular Arithmetic](Modular%20Arithmetic/) | Operations under modulo |
| [Modular Exponentiation](Modular%20Exponentiation/) | Fast power with modulo |
| [Chinese Remainder Theorem](Chinese%20Remainder%20Theorem/) | Solving modular equations |
| [Miller-Rabin Primality Test](Miller-Rabin%20Primality%20Test/) | Probabilistic primality test |

## Complexity

| Algorithm | Time | Space |
|-----------|------|-------|
| GCD (Euclidean) | O(log min(a,b)) | O(1) |
| Sieve | O(n log log n) | O(n) |
| Modular Exponentiation | O(log n) | O(1) |
| Miller-Rabin | O(k log³ n) | O(1) |

## Key Formulas

- **GCD**: gcd(a, b) = gcd(b, a mod b)
- **Extended GCD**: ax + by = gcd(a, b)
- **Modular Inverse**: a⁻¹ ≡ a^(p-2) mod p (Fermat's)
- **Euler's Theorem**: a^φ(n) ≡ 1 mod n

