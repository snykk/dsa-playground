# Mathematical Algorithms

A comprehensive collection of **Mathematical Algorithms** implementations, including number theory and advanced mathematical algorithms.

---

## Overview

This folder contains implementations of fundamental mathematical algorithms in Python, C++, and Go. Each algorithm includes:
- Complete implementation
- Comprehensive test suites
- Detailed documentation
- Complexity analysis

---

## Categories

### 🔹 Number Theory

- **[Euclidean Algorithm (GCD, LCM)](Number_Theory/Euclidean_Algorithm/)**
  - Finds Greatest Common Divisor and Least Common Multiple
  - Time: O(log min(a, b)), Space: O(1)
  - Fundamental algorithm for number theory

- **[Modular Arithmetic](Number_Theory/Modular_Arithmetic/)**
  - Operations under modular arithmetic
  - Time: O(1) for basic operations
  - Essential for cryptography and number theory

- **[Modular Exponentiation](Number_Theory/Modular_Exponentiation/)**
  - Efficient exponentiation under modulo
  - Time: O(log exponent), Space: O(1)
  - Uses binary exponentiation

- **[Sieve of Eratosthenes](Number_Theory/Sieve_of_Eratosthenes/)**
  - Finds all primes up to n
  - Time: O(n log log n), Space: O(n)
  - Efficient prime number generation

- **[Miller-Rabin Primality Test](Number_Theory/Miller_Rabin_Primality_Test/)**
  - Probabilistic primality test
  - Time: O(k log³ n) where k is iterations
  - Fast and practical for large numbers

- **[Chinese Remainder Theorem](Number_Theory/Chinese_Remainder_Theorem/)**
  - Solves system of modular congruences
  - Time: O(n log max(moduli)), Space: O(n)
  - Useful in cryptography and number theory

---

### 🔹 Advanced Math

- **[Fast Fourier Transform (FFT)](Advanced_Math/Fast_Fourier_Transform/)**
  - Efficient polynomial multiplication
  - Time: O(n log n), Space: O(n)
  - Fundamental in signal processing

- **[Matrix Exponentiation](Advanced_Math/Matrix_Exponentiation/)**
  - Fast computation of matrix powers
  - Time: O(n³ log k) for n×n matrix to k-th power
  - Useful for linear recurrences

---

## Comparison

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|-------------------|----------|
| **Euclidean Algorithm** | O(log min(a,b)) | O(1) | GCD, LCM computation |
| **Modular Arithmetic** | O(1) | O(1) | Basic modular operations |
| **Modular Exponentiation** | O(log exp) | O(1) | Large power computations |
| **Sieve of Eratosthenes** | O(n log log n) | O(n) | Prime generation |
| **Miller-Rabin** | O(k log³ n) | O(1) | Primality testing |
| **Chinese Remainder Theorem** | O(n log max(m)) | O(n) | Modular systems |
| **FFT** | O(n log n) | O(n) | Polynomial multiplication |
| **Matrix Exponentiation** | O(n³ log k) | O(n²) | Linear recurrences |

---

## When to Use

- **Euclidean Algorithm**: When computing GCD/LCM
- **Modular Arithmetic**: Cryptography, hashing
- **Modular Exponentiation**: RSA, discrete logarithms
- **Sieve of Eratosthenes**: Generating prime lists
- **Miller-Rabin**: Testing large numbers for primality
- **Chinese Remainder Theorem**: Solving modular systems
- **FFT**: Signal processing, polynomial operations
- **Matrix Exponentiation**: Fibonacci, linear recurrences

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen
- "Concrete Mathematics" by Graham, Knuth, Patashnik

---

_Last Updated: December 2025_

