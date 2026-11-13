# Optimization Techniques

Four ways to make a solution fit its time limit without changing the algorithm's idea: read input in bulk, precompute tables once, store a small set in one integer, and keep modular arithmetic exact. They attack different costs, so each applies to a different bottleneck.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Fast I/O](Fast_IO/) | Read and write in big chunks. With about a million numbers, input handling can decide between passing and a time-limit error. | Beginner |
| 2 | [Precomputation](Precomputation/) | Pay once before the queries arrive. Factorial tables, sieves, prefix sums and sparse tables give O(1) or O(log n) per query. | Intermediate |
| 3 | [Bitmasking](Bitmasking/) | A small set as the bits of one integer. Set operations are single instructions and a DP state can index an array. | Intermediate |
| 4 | [Modular Arithmetic Tricks](Modular_Arithmetic_Tricks/) | Safe reduction, fast power, inverses, factorial tables, Lucas and CRT, for answers modulo a prime such as 10^9 + 7. | Intermediate |

Bitmasking builds on the Bit Manipulation pattern, and the modular tricks build on the number-theory topics.

## How They Compare

| Technique | Setup | Per operation | Space |
|-----------|-------|---------------|-------|
| Fast I/O | one buffer or one setup line | O(1) per character | O(1), or the input size when read at once |
| Prefix sum | O(n) | O(1) | O(n) |
| Sieve | O(n log log n) | O(1) | O(n) |
| Sparse table | O(n log n) | O(1) | O(n log n) |
| Factorial tables | O(n) | O(1) for nCr | O(n) |
| All subsets as masks | none | O(2^n) in total | O(1) |
| Bitmask DP for TSP | none | O(n^2 2^n) in total | O(n 2^n) |
| Modular power | none | O(log e) | O(1) |

Fast I/O changes the constant factor only, and the repository gives no timing table for it.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| up to a million numbers of input | Fast I/O | default readers can dominate the running time |
| many range sums or many prime tests | Precomputation | one table answers every query in O(1) |
| a minimum or maximum over ranges of a static array | Precomputation (sparse table) | O(1) per query, for min, max and gcd |
| subsets of 20 items or fewer | Bitmasking | a mask indexes a DP table |
| n is about 40 | [Meet in the Middle](../../Problem_Patterns/Meet_in_the_Middle/) | bitmasking over 2^40 subsets is out of reach |
| the answer is a count modulo 10^9 + 7 | Modular arithmetic tricks | reduce after every operation and use inverse factorials |
| an interactive problem | flush after every query | buffering input and output breaks the conversation with the judge |

## Common Pitfalls

- Optimizing I/O before the algorithm. Fast I/O changes the constant factor only; an O(n^2) loop stays O(n^2).
- Using a sparse table for a sum. It works for idempotent operations such as min, max and gcd; for sums, use prefix sums.
- Bitmasking beyond about 25 items. There are 2^n masks, so the cost doubles with every item.
- Reducing too late. In modular arithmetic, reduce after every operation; a plain product of two residues breaks 64 bits once the modulus exceeds about 3e9.
- Buffering an interactive problem. The judge sees nothing until you flush.

## Related

- [Big-O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Templates](../Templates/): boilerplates with buffered input and a modular power and inverse.
- [Prefix Sum and Difference Array](../../Problem_Patterns/Prefix_Sum_Difference_Array/): the pattern behind prefix-sum precomputation.
- [Bit Manipulation](../../Problem_Patterns/Bit_Manipulation/): the identities that Bitmasking builds on.
- [Number Theory Algorithms](../../Algorithms/Mathematical_Algorithms/Number_Theory/): the number theory behind the modular tricks.
