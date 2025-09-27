# 📚 String Pattern Matching

Pattern matching is a fundamental topic in strings, used in **searching, text processing, and bioinformatics**.

### Algorithms Covered

- Naive pattern search
- Knuth-Morris-Pratt (KMP) algorithm
- Rabin-Karp algorithm
- Boyer-Moore algorithm

### Key Concepts

- **Prefix function** (KMP)
- **Rolling hash** (Rabin-Karp)
- **Bad character & good suffix heuristics** (Boyer-Moore)

### Complexity Table

| Algorithm   | Best   | Worst   | Average |
| ----------- | ------ | ------- | ------- |
| Naive       | O(n)   | O(n\*m) | O(n\*m) |
| KMP         | O(n)   | O(n)    | O(n)    |
| Rabin-Karp  | O(n)   | O(n\*m) | O(n+m)  |
| Boyer-Moore | O(n/m) | O(n\*m) | O(n/m)  |

### Learning Tips

- Start with **Naive** to understand basic string matching.
- KMP and Rabin-Karp are more **efficient for large texts**.
- Boyer-Moore is optimal for **long patterns and large alphabets**.
