# Longest Common Subsequence (LCS)

> Given two strings `A` and `B`, find the length (and optionally the sequence itself) of the **longest subsequence that appears in both**. A subsequence keeps the original order but may skip characters — it is **not** a substring.

---

## 🎯 Intuition

Subsequence ≠ substring. A **substring** is contiguous ("ella" in "hello"). A **subsequence** just preserves order — you can skip letters ("hlo" is a subsequence of "hello", but not a substring).

> "The longest chain of matches I can draw through both strings, without ever crossing backwards."

For `A = "ABCBDAB"` and `B = "BDCAB"`, one LCS is `"BCAB"` (length 4). Another is `"BDAB"`. Multiple LCSs of the same maximum length often exist.

---

## 📊 Visual: Matching Lines

Imagine drawing lines between matching characters. The rule: **no line crosses another**.

```
    A B C B D A B
         ╲   ╲  ╲
          ╲   ╲  ╲
    B D C   A B
```

Maximum non-crossing lines = LCS length. (This is also why problems like "Uncrossed Lines" on LeetCode are literally LCS.)

---

## 🧮 Recurrence

Let `dp[i][j]` = LCS length of `A[0..i]` and `B[0..j]`.

**Base case:** `dp[0][j] = dp[i][0] = 0` (empty prefix has no common subsequence).

**Transition:**
```
If A[i-1] == B[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1          # extend the match
Else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])  # skip one char from either side
```

The "match or skip" structure is the DNA of almost every string-alignment DP.

---

## 📋 Visual: Filling the Table

`A = "ABCB"`, `B = "BDCAB"`.

```
         ""  B  D  C  A  B
    ""    0  0  0  0  0  0
    A     0  0  0  0  1  1
    B     0  1  1  1  1  2
    C     0  1  1  2  2  2
    B     0  1  1  2  2  3    ← dp[4][5] = 3, LCS = "BCB"
```

Each "+1 diagonal step" marks a matching character. Reading the path backwards from the bottom-right corner gives you the actual subsequence.

---

## 🚶 Traceback: Recovering the LCS Itself

1. Start at `dp[n][m]`.
2. If `A[i-1] == B[j-1]`, append that char and go diagonally (`i--, j--`).
3. Else, move to the larger neighbor: `dp[i-1][j]` or `dp[i][j-1]`.
4. Stop at row 0 or column 0. Reverse the collected string.

---

## ⏱️ Complexity — and Why

| Approach | Time | Space | Why |
|----------|------|-------|-----|
| Recursion (no memo) | O(2^(n+m)) | O(n+m) stack | Each call branches twice |
| Memoized recursion | O(n·m) | O(n·m) | Subproblems cached |
| Bottom-up 2D | O(n·m) | O(n·m) | Full table |
| **Bottom-up 1D** | **O(n·m)** | **O(min(n, m))** | Only the previous row matters |
| Hirschberg's algo | O(n·m) | **O(min(n,m))** + traceback | Divide-and-conquer for space-efficient traceback |

Time is fundamentally `O(n·m)` — you must examine each (i, j) pair once to decide match-or-skip.

---

## 🎯 When to Use LCS

✅ **Applications:**
- `diff` tools (git diff, file comparison) — find common lines between two versions
- Bioinformatics (DNA/RNA similarity — though alignment with scoring is more common)
- Version control merge
- Plagiarism detection (at structural level)
- Speech / text pattern matching

❌ **Don't use when:**
- You need _contiguous_ match → use **Longest Common Substring** (similar DP, different recurrence)
- You care about edits (insert/delete/replace counts) → use **Edit Distance** (reverse problem)
- Strings are very large and you only need length → consider hashing or suffix automaton

---

## ⚔️ LCS vs. Related Problems

| Problem | What it computes | Recurrence hint |
|---------|-----------------|-----------------|
| **Longest Common Subsequence** | Non-contiguous match length | Skip or match |
| **Longest Common Substring** | Contiguous match length | Match or reset to 0 |
| **Edit Distance** | Minimum insert/delete/replace | 3-way min |
| **Shortest Common Supersequence** | Shortest string containing both as subseq | `n + m - LCS(A, B)` |

Notice: **Edit distance with only insert/delete (no replace)** equals `n + m - 2·LCS(A, B)`. LCS sits at the heart of string alignment.

---

## ⚠️ Common Pitfalls

1. **Confusing subsequence with substring.** "LCS of ABCDEF and ZBCDEG" is 5 (`BCDE` — wait, that's only 4). Actually `"BCDEG"` skipping the 'A' and 'F'... nope, `G` isn't there. Walk the table to verify — don't eyeball.
2. **Off-by-one in string indexing.** The DP table uses `i = 1..n`, meaning `A[i-1]` is the `i`-th character. Skipping the `-1` is the most common bug.
3. **Returning the table value as the LCS string.** `dp[n][m]` is the **length**, not the string. Recovering the string requires traceback.
4. **Multiple valid LCSs.** If there are ties (`max(dp[i-1][j], dp[i][j-1])` equal), any valid traceback path works. Don't expect a unique answer.
5. **1D space optimization mis-ordering.** The 1D version needs a temp variable to save `dp[j-1]` before it's overwritten — otherwise the diagonal reference becomes incorrect.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Bottom-up + 1D space-optimized + traceback |
| C++ | [C++/](C++/) | Standard 2D DP |
| Go | [Go/](Go/) | 2D DP with traceback |

---

## 📝 Practice Problems

- [LeetCode 1143. Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/) — the canonical problem
- [LeetCode 1035. Uncrossed Lines](https://leetcode.com/problems/uncrossed-lines/) — literally LCS in disguise
- [LeetCode 583. Delete Operation for Two Strings](https://leetcode.com/problems/delete-operation-for-two-strings/) — reduces to LCS
- [LeetCode 1092. Shortest Common Supersequence](https://leetcode.com/problems/shortest-common-supersequence/) — LCS + traceback
- [SPOJ LCS](https://www.spoj.com/problems/LCS/) — string version

---

_Part of the [Dynamic Programming](../../README.md) section._
