# Chinese Remainder Theorem (Python)

**Chinese Remainder Theorem (CRT)** solves systems of simultaneous congruences with pairwise coprime moduli.

---

## Overview

The Chinese Remainder Theorem is a theorem that provides conditions for the existence and uniqueness of solutions to systems of simultaneous linear congruences. It is widely used in number theory, cryptography, and computer science.

**Key Characteristics:**
- Solves systems of congruences efficiently
- Requires pairwise coprime moduli
- Unique solution modulo product of all moduli
- Essential for cryptography and number theory

---

## Theorem

Given a system of congruences:
```
x ≡ a₁ (mod m₁)
x ≡ a₂ (mod m₂)
...
x ≡ aₙ (mod mₙ)
```

Where m₁, m₂, ..., mₙ are pairwise coprime, there exists a unique solution modulo M = m₁ × m₂ × ... × mₙ.

---

## Algorithm

1. Verify that all moduli are pairwise coprime
2. Compute M = product of all moduli
3. For each congruence i:
   - Compute Mᵢ = M / mᵢ
   - Find modular inverse of Mᵢ mod mᵢ
   - Add aᵢ × Mᵢ × Mᵢ⁻¹ to solution
4. Return solution mod M

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **chinese_remainder_theorem** | O(n log max(moduli)) | O(n) |
| **chinese_remainder_theorem_pairwise** | O(log max(m₁, m₂)) | O(1) |
| **verify_crt_solution** | O(n) | O(1) |

Where n is the number of congruences.

---

## Implementation Details

### Functions

1. **`chinese_remainder_theorem(remainders, moduli)`**
   - Solve system of congruences
   - Returns solution mod (product of moduli), or None if moduli not coprime
   - Time: O(n log max(moduli)), Space: O(n)

2. **`chinese_remainder_theorem_pairwise(a1, m1, a2, m2)`**
   - Solve system of two congruences
   - Returns solution mod (m1 × m2), or None if not coprime
   - Time: O(log max(m1, m2)), Space: O(1)

3. **`verify_crt_solution(x, remainders, moduli)`**
   - Verify that x satisfies all congruences
   - Returns True if valid, False otherwise
   - Time: O(n), Space: O(1)

---

## Usage

```python
from chinese_remainder_theorem import chinese_remainder_theorem, verify_crt_solution

# Solve: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
remainders = [2, 3, 2]
moduli = [3, 5, 7]
solution = chinese_remainder_theorem(remainders, moduli)
print(solution)  # 23

# Verify solution
print(verify_crt_solution(solution, remainders, moduli))  # True
```

---

## Applications

1. **Cryptography**: RSA decryption, secret sharing
2. **Number Theory**: Solving systems of congruences
3. **Computer Science**: Parallel computation, error correction
4. **Competitive Programming**: Modular arithmetic problems

---

## Important Notes

- **Pairwise Coprime**: All moduli must be pairwise coprime (GCD = 1)
- **Unique Solution**: Solution is unique modulo product of all moduli
- **Verification**: Always verify solution to ensure correctness

---

## Testing

Run tests with:

```bash
python -m unittest chinese_remainder_theorem_test.py
```

Or:

```bash
python chinese_remainder_theorem_test.py
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Number Theory" by Rosen
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

