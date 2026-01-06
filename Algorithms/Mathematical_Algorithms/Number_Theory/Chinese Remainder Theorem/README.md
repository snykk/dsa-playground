# Chinese Remainder Theorem

Solving systems of simultaneous linear congruences.

## Problem

Given:
- x ≡ a₁ (mod m₁)
- x ≡ a₂ (mod m₂)
- ...
- x ≡ aₖ (mod mₖ)

Find x if all mᵢ are pairwise coprime.

## Algorithm

1. Compute M = m₁ × m₂ × ... × mₖ
2. For each i, compute Mᵢ = M / mᵢ
3. Find yᵢ such that Mᵢ × yᵢ ≡ 1 (mod mᵢ)
4. x = Σ(aᵢ × Mᵢ × yᵢ) mod M

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Solve | O(n log M) | O(n) |

## Applications

- Cryptography (RSA)
- Calendar calculations
- Large integer reconstruction

