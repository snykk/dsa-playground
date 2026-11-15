# Huffman Coding

Huffman coding assigns each symbol a binary code whose length depends on how often it occurs: frequent symbols get short codes, rare ones long codes. Repeatedly merging the two least frequent nodes builds the shortest possible prefix-free code in O(k log k) time for k distinct symbols. Python, C++ and Go give the same code table for the same ASCII text.

## Intuition

Spending 8 bits on every character wastes space when some characters are far more common than others. Give the common ones short codes. To decode without separators, no code may be the beginning of another code (a prefix-free code). A binary tree gives that for free: each symbol is a leaf, its code is the path from the root (left edge `0`, right edge `1`), and no leaf lies on the path to another leaf.

Why merging the two lightest is correct: in some optimal tree the two least frequent symbols are siblings at the deepest level (if a heavier symbol were deeper, swapping it with a lighter one cannot lengthen the output). Merging those two into one symbol with the summed frequency gives a smaller problem, and its optimal cost plus the two frequencies is the cost of the original. Induction finishes the proof.

## Visual

```text
Frequencies: a 45, b 13, c 12, d 16, e 9, f 5   (100 characters)

                 (100)
               0/     \1
             a:45     (55)
                    0/    \1
                 (25)      (30)
               0/   \1    0/   \1
            c:12   b:13 (14)   d:16
                      0/   \1
                    f:5    e:9

a=0  c=100  b=101  f=1100  e=1101  d=111
```

## How It Works

1. Count the frequency of each symbol.
2. Put one leaf per symbol in a min-heap, ordered by frequency.
3. While the heap has more than one node: pop the two smallest, create a parent whose frequency is their sum (first popped = left child, second = right child), and push it.
4. The last node is the root. Walk the tree to read the codes: `0` for left, `1` for right.
5. Encode by concatenating the code of each character. Decode by following bits from the root; at a leaf, output its symbol and restart at the root.

A text with one distinct symbol gives a single leaf; its code would be empty, so the code uses `"0"` in all three languages.

## Step-by-Step Trace

The 100-character text above (every merge has a unique smallest pair, so there is no tie-breaking):

| Step | Heap before the merge (merged nodes in brackets) | Merge | New node |
|------|--------------------------------------------------|-------|----------|
| 1 | f 5, e 9, c 12, b 13, d 16, a 45 | f 5 + e 9 | [14] |
| 2 | c 12, b 13, [14], d 16, a 45 | c 12 + b 13 | [25] |
| 3 | [14], d 16, [25], a 45 | [14] + d 16 | [30] |
| 4 | [25], [30], a 45 | [25] + [30] | [55] |
| 5 | a 45, [55] | a 45 + [55] | [100], the root |

Encoded length: 45 * 1 + 13 * 3 + 12 * 3 + 16 * 3 + 9 * 4 + 5 * 4 = 224 bits, against 800 bits at 8 bits per character (ratio 0.28). Decoding `1010111`: `101` is b, `0` is a, `111` is d, giving `bad`.

## Complexity

N is the text length and k the number of distinct symbols.

| Step | Time | Why |
|------|------|-----|
| Count frequencies | O(N) | one pass |
| Build the tree | O(k log k) | k - 1 merges, each with heap operations on at most k nodes |
| Build the codes | O(total code length) | a walk over the tree; codes are built as strings |
| Encode / decode | O(N + output bits) | one lookup per character; one tree edge per bit |

Space is O(k) for the tree and the code table (plus the output). The average code length L of a Huffman code satisfies H <= L < H + 1, where H is the entropy of the source; the example has H of about 2.22 bits and L = 2.24 bits.

## When to Use

Use it to compress data whose symbols have skewed frequencies, or as the last stage of a larger compressor. Do not use it when all symbols are about equally likely (no gain), when one symbol is extremely likely (arithmetic coding does better, since Huffman needs at least 1 bit per symbol), or when you cannot afford to send the tree or table with the data.

## Huffman Coding vs. Alternatives

| Method | Idea | Strength | Limit |
|--------|------|----------|-------|
| Huffman coding | whole bits per symbol, from frequencies | optimal among prefix codes with one codeword per symbol | at least 1 bit per symbol |
| Fixed-length code | same number of bits for all symbols | trivial, random access | ignores frequencies |
| Arithmetic coding | one number for the whole message | can use fractions of a bit per symbol | more complex |
| Dictionary methods (LZ family) | replace repeated strings with references | exploit repeated phrases | a different kind of redundancy; often combined with Huffman coding |

## Common Pitfalls

- **Assuming the code table is unique.** With tied frequencies several optimal tables exist. `HuffmanNode.__lt__` compares frequency only, so the exact table depends on the heap order. Total length is the same; share the tree or the code lengths, not just the symbols.
- **Decoding with a different tree** than the one used to encode. `huffman_decode(encoded, tree)` needs the tree; the code table alone is not enough in this API.
- **A single distinct symbol.** The code is `"0"`, one bit per character, so there is no gain.
- **Not packed bits.** `huffman_encode` returns a string of `0` and `1` characters (one character per bit). It shows the code but is not a compressed byte stream.
- **The ratio helper.** `calculate_compression_ratio` assumes 8 bits per character, does not count the cost of storing the tree, and ignores its `codes` argument.
- **Bytes are not characters.** The C++ version codes the bytes of a `std::string`, so a UTF-8 character such as U+00E9 is two symbols there; Python and Go code characters (code points). ASCII text gets the same table in all three.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `huffman_coding.py` | tree, codes, encode, decode, ratio; the reference |
| C++ | [C++/](C++/) | `huffman_coding.cpp` | the same functions; a copy of `heapq` gives Python's code tables; symbols are bytes; `std::unique_ptr` tree |
| Go | [Go/](Go/) | `main.go` | the same functions; a copy of `heapq` gives Python's code tables; symbols are runes |

## Practice Problems

- [Minimum Cost to Connect Sticks](https://leetcode.com/problems/minimum-cost-to-connect-sticks/) (LeetCode 1167), the same merge loop with a min-heap

## Related

- [Min Heap](../../../Data_Structures/Non_Linear/Heaps/Min_Heap/) - the priority queue used to find the two lightest nodes
- [Fractional Knapsack](../Fractional_Knapsack/) - another greedy with an exchange-argument proof
- [Activity Selection](../Activity_Selection/) - another greedy with an exchange-argument proof
- [Greedy algorithms overview](../)
