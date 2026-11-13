# Competitive Programming Utilities

The tools around the algorithms in a contest: starter templates in three languages, techniques that make a correct solution fast enough, and problem types defined by their format. This folder holds no new data structure, and it is used together with the rest of the repository.

## Topics

| # | Section | What it adds | Level |
|---|---------|--------------|-------|
| 1 | [Templates](Templates/) | The C++, Go and Python boilerplates, each with its tests, to copy at the start of a contest. | 3 templates |
| 2 | [Optimization Techniques](Optimization_Techniques/) | Four ways to make a solution fit its time limit, from fast input to modular arithmetic. | 4 topics |
| 3 | [Problem Types](Problem_Types/) | Constructive, interactive and game problems, which are defined by their format and each need their own proof. | 3 topics |

Choosing the algorithm is only part of a contest. You also have to start from a working file, read and write fast enough, keep integers exact, and recognise problems that are not about computing a value at all. None of these replaces an algorithm.

## How They Compare

| Section | Use it when | Contains |
|---------|-------------|----------|
| Templates | you start a contest or a new problem | C++, Go and Python boilerplates |
| Optimization Techniques | the algorithm is right and the program is too slow or overflows | Fast I/O, Precomputation, Bitmasking, Modular Arithmetic Tricks |
| Problem Types | the statement asks for an object, a dialogue or a winner | Constructive Algorithms, Interactive Problems, Game Theory |

## Where to Start

1. **Copy a template** for your language, and read what it gives you: buffered input, a modular power and inverse, and a few structures.
2. **Fast I/O**, then **Precomputation**, the Beginner and first Intermediate topics of [Optimization Techniques](Optimization_Techniques/).
3. **Bitmasking** and **Modular Arithmetic Tricks**, when you meet subsets or counting modulo a prime.
4. **Constructive Algorithms** and **Interactive Problems** in [Problem Types](Problem_Types/), once you are comfortable with greedy solutions and binary search.
5. **Game Theory**, the Advanced topic, after Bit Manipulation and dynamic programming.

## Common Pitfalls

- Trusting a template blindly. Read it first and test it on small inputs; a helper you do not understand can fail silently.
- Optimizing before the algorithm is right. These techniques change constants, not the order of growth.
- Skipping the proof in a constructive problem. A pattern that works on small cases is not yet a solution.
- Buffering in an interactive problem. Read and write one query at a time, and flush after every answer.

## Related

- [Big-O Notation](../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Problem Solving Patterns](../Problem_Patterns/): recurring solution shapes; Bitmasking builds on Bit Manipulation.
- [Algorithms](../Algorithms/): the algorithms these tools support.
- [Data Structures](../Data_Structures/): the structures the templates reuse, such as union-find and the segment tree.
