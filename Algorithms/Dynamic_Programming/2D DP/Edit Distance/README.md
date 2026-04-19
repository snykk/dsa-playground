# Edit Distance (Levenshtein Distance)

> Minimum number of single-character edits needed to transform string `A` into string `B`, where edits are: **insert**, **delete**, or **replace**.

---

## 🎯 Intuition

Imagine you're proofreading. You have a draft (`A`) and the corrected version (`B`). How many keystrokes minimum do you need to fix the draft? Each "keystroke" is one of three moves:

- **Insert** a character ("typo → typos")
- **Delete** a character ("hellop → hello")
- **Replace** one character with another ("ran → run")

**Edit distance answers: what's the minimum total moves?** If edit distance between "kitten" and "sitting" is 3, that means 3 well-chosen edits turn one into the other — and no sequence of 2 edits can.

---

## 📊 Visual: Filling the DP Table

For `A = "cat"`, `B = "bat"`, we build a `(|A|+1) × (|B|+1)` table. `dp[i][j]` = edit distance between first `i` chars of `A` and first `j` chars of `B`.

```
        ""  b  a  t
    ""   0  1  2  3     ← base: B has j chars, need j inserts from ""
    c    1  1  2  3
    a    2  2  1  2
    t    3  3  2  1     ← dp[3][3] = 1 → answer: 1 edit (replace 'c' with 'b')
```

Each cell asks: "to convert `A[0..i]` → `B[0..j]`, what's the cheapest route?"

---

## 🧮 Recurrence

**Base cases:**
- `dp[0][j] = j` → turning `""` into `B[0..j]` costs `j` inserts.
- `dp[i][0] = i` → turning `A[0..i]` into `""` costs `i` deletes.

**General case:**
```
If A[i-1] == B[j-1]:
    dp[i][j] = dp[i-1][j-1]            # free — last chars match
Else:
    dp[i][j] = 1 + min(
        dp[i-1][j],                    # delete A[i-1]
        dp[i][j-1],                    # insert B[j-1]
        dp[i-1][j-1]                   # replace A[i-1] with B[j-1]
    )
```

Three choices, one minimum, plus 1 for the edit. That's the whole algorithm.

---

## 🚶 Step-by-Step Walkthrough

Convert `"cat" → "bat"`:

1. `dp[0][0] = 0` (empty → empty, 0 edits)
2. Row 1 (first char of A is 'c'):
   - `dp[1][1]`: compare `'c' vs 'b'` → differ. `min(1, 1, 0) + 1 = 1`. Replace.
   - `dp[1][2]`: compare `'c' vs 'a'` → differ. `min(2, 1, 1) + 1 = 2`.
   - `dp[1][3]`: compare `'c' vs 't'` → differ. `min(3, 2, 2) + 1 = 3`.
3. Row 2 (A="ca"):
   - `dp[2][1]`: `'a' vs 'b'` differ → `min(1, 2, 1) + 1 = 2`.
   - `dp[2][2]`: `'a' vs 'a'` **match** → `dp[1][1] = 1` (free).
   - `dp[2][3]`: `'a' vs 't'` differ → `min(2, 1, 2) + 1 = 2`.
4. Row 3 (A="cat"):
   - `dp[3][3]`: `'t' vs 't'` **match** → `dp[2][2] = 1`. ✓ Answer: 1 edit.

---

## ⏱️ Complexity — and Why

| Approach | Time | Space | Why |
|----------|------|-------|-----|
| Recursive (no memo) | O(3^(n+m)) | O(n+m) stack | Each call branches 3 ways, depth up to `n+m` |
| Top-down DP | O(n·m) | O(n·m) | Each of `n·m` subproblems solved once |
| Bottom-up 2D | O(n·m) | O(n·m) | Classic table fill |
| **Bottom-up 1D** | **O(n·m)** | **O(min(n,m))** | Only need previous row — keep two rows |

Time is fundamentally O(n·m) because each cell depends on three neighbors and each is computed once. Space can drop to two rows (or one row + one variable) because the recurrence only looks one row/column back.

---

## 🎯 When to Use

✅ **Use Edit Distance when:**
- Spell checkers / autocorrect ("did you mean ___?")
- DNA / protein sequence alignment (bioinformatics)
- Diff tools (git diff, file comparison)
- Fuzzy string search, OCR error correction
- Plagiarism detection

❌ **Don't use when:**
- You need semantic similarity ("cat" vs "feline" — these are 5 edits apart but conceptually close). Use word embeddings instead.
- You care about phonetic similarity ("Knight" vs "Night"). Use Soundex or Metaphone.
- You only care whether they're equal. Just use `==`.

---

## ⚠️ Common Pitfalls

1. **Off-by-one in indices**: `A[i-1]` vs `A[i]`. The DP table is 1-indexed (includes the empty prefix at index 0), so string access must use `i-1`. Forgetting this is the #1 bug.
2. **Base cases wrong**: `dp[0][j] = j`, not `0`. Converting `""` to a j-length string needs j inserts, not zero.
3. **Taking `min` of four things instead of three**: some learners accidentally include `dp[i][j]` (the cell itself) as an option. That's circular.
4. **Replace counted as two edits**: replace is **one** edit, not delete + insert. Many wrong implementations double-count.
5. **Case sensitivity / unicode**: "Café" vs "cafe" — are accented chars equivalent? Be explicit about normalization upstream.

---

## ⚔️ Edit Distance vs. Alternatives

| Metric | Edit Distance | Hamming Distance | Longest Common Subsequence |
|--------|---------------|-----------------|----------------------------|
| Operations allowed | Insert, Delete, Replace | Replace only | Neither — asks "what's shared"? |
| Requires equal length | No | **Yes** | No |
| Computes | Minimum edits | Differing positions | Length of common subsequence |
| Time | O(n·m) | O(n) | O(n·m) |

**Hamming** is a special case of edit distance when only substitutions are allowed (and strings are equal-length). **LCS** is related — in fact, if only insert/delete are allowed (no replace), the edit distance is `n + m - 2·LCS(A, B)`.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Both recursive-with-memo and bottom-up, plus space-optimized variant |
| C++ | [C++/](C++/) | Bottom-up with 2D table and space-optimized 1D |
| Go | [Go/](Go/) | Bottom-up table with traceback to recover the edit sequence |

---

## 📝 Practice Problems

- [LeetCode 72. Edit Distance](https://leetcode.com/problems/edit-distance/) — the canonical problem
- [LeetCode 583. Delete Operation for Two Strings](https://leetcode.com/problems/delete-operation-for-two-strings/) — edit distance with only delete/insert
- [LeetCode 161. One Edit Distance](https://leetcode.com/problems/one-edit-distance/) — "is the distance exactly 1?"
- [LeetCode 1035. Uncrossed Lines](https://leetcode.com/problems/uncrossed-lines/) — LCS in disguise
- [Codeforces 56D. Changing a String](https://codeforces.com/problemset/problem/56/D) — edit distance with traceback

---

_Part of the [Dynamic Programming](../../README.md) section._
