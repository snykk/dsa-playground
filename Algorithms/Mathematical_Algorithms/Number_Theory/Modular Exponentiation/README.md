# Modular Exponentiation

Computing a^b mod m efficiently using binary exponentiation.

## Algorithm

```
power(a, b, m):
    result = 1
    a = a mod m
    while b > 0:
        if b is odd:
            result = (result * a) mod m
        b = b / 2
        a = (a * a) mod m
    return result
```

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Power | O(log b) | O(1) |

## Applications

- RSA encryption
- Modular inverse computation
- Large number calculations

