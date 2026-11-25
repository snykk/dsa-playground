/**
 * Timsort Implementation (C++)
 *
 * A stable merge sort that works with the order already in the data, following the design
 * of CPython's list.sort() (Objects/listsort.txt):
 *
 *   1. Natural runs: non-descending (a[i] <= a[i + 1]) or strictly descending stretches;
 *      a descending run is reversed, which is stable because it is strict.
 *   2. minrun (32..64 for n >= 64, n below that): shorter runs are extended with binary
 *      insertion sort.
 *   3. A stack of pending runs whose lengths satisfy, for every three neighbours X, Y, Z
 *      (Z on top), X > Y + Z and Y > Z; mergeCollapse restores this after every push.
 *   4. Merges with a temporary copy of the smaller run, left to right (mergeLo) or right to
 *      left (mergeHi), after trimming the elements already in place.
 *   5. Galloping: after minGallop wins in a row by one run (kMinGallop = 7 at the start),
 *      exponential search moves whole blocks; minGallop adapts to the data.
 *
 * Every comparison is operator<, as in the Python version, so the two make the same
 * comparisons: the tests pin the counts of 40 arrays to the Python outputs.
 */

#include <algorithm>
#include <cstddef>
#include <functional>
#include <iostream>
#include <stdexcept>
#include <vector>

constexpr std::size_t kMinGallop = 7;

// The minimum run length for n elements, as CPython computes it: the six most significant
// bits of n, plus 1 if any remaining bit is set. n itself below 64, else 32..64.
std::size_t computeMinrun(std::size_t n) {
    std::size_t r = 0;
    while (n >= 64) {
        r |= n & 1;
        n >>= 1;
    }
    return n + r;
}

struct RunInfo {
    std::size_t length;
    bool descending;
};

// The run that starts at arr[lo], looking no further than hi (lo < hi). Non-descending
// (tested as !(arr[i + 1] < arr[i])) or strictly descending (arr[i + 1] < arr[i]).
template <typename T>
RunInfo countRun(const std::vector<T>& arr, std::size_t lo, std::size_t hi) {
    if (lo + 1 == hi) return {1, false};
    std::size_t n = 2;
    if (arr[lo + 1] < arr[lo]) {
        while (lo + n < hi && arr[lo + n] < arr[lo + n - 1]) ++n;
        return {n, true};
    }
    while (lo + n < hi && !(arr[lo + n] < arr[lo + n - 1])) ++n;
    return {n, false};
}

// Sorts arr[lo, hi) given that arr[lo, start) is sorted: each element is placed by a binary
// search, then the larger ones shift right. An equal element stays to the left: stable.
template <typename T>
void binaryInsertionSort(std::vector<T>& arr, std::size_t lo, std::size_t hi, std::size_t start) {
    if (start == lo) ++start;
    for (std::size_t i = start; i < hi; ++i) {
        T pivot = arr[i];
        std::size_t left = lo, right = i;
        while (left < right) {
            std::size_t mid = left + (right - left) / 2;
            if (pivot < arr[mid]) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        for (std::size_t k = i; k > left; --k) arr[k] = arr[k - 1];
        arr[left] = pivot;
    }
}

// Where key belongs in the sorted a[base, base + n), left of any equal elements: the k in
// 0..n with a[base + k - 1] < key <= a[base + k]. Starts at a[base + hint], probes offsets
// 1, 3, 7, 15, ... (exponential search), then binary-searches the last gap.
template <typename T>
std::size_t gallopLeft(const T& key, const std::vector<T>& a, std::size_t base, std::size_t n,
                       std::size_t hint) {
    const std::size_t p = base + hint;
    std::size_t lo, hi;
    if (a[p] < key) {
        const std::size_t maxOfs = n - hint;
        std::size_t last = 0, ofs = 1;
        while (ofs < maxOfs && a[p + ofs] < key) {
            last = ofs;
            ofs = 2 * ofs + 1;  // ofs < maxOfs <= n, so this cannot overflow
        }
        ofs = std::min(ofs, maxOfs);
        lo = hint + last + 1;
        hi = hint + ofs;
    } else {
        const std::size_t maxOfs = hint + 1;
        std::size_t last = 0, ofs = 1;
        while (ofs < maxOfs && !(a[p - ofs] < key)) {
            last = ofs;
            ofs = 2 * ofs + 1;
        }
        ofs = std::min(ofs, maxOfs);
        lo = hint + 1 - ofs;
        hi = hint - last;
    }
    while (lo < hi) {
        std::size_t mid = lo + (hi - lo) / 2;
        if (a[base + mid] < key) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return hi;
}

// Where key belongs in the sorted a[base, base + n), right of any equal elements: the k with
// a[base + k - 1] <= key < a[base + k].
template <typename T>
std::size_t gallopRight(const T& key, const std::vector<T>& a, std::size_t base, std::size_t n,
                        std::size_t hint) {
    const std::size_t p = base + hint;
    std::size_t lo, hi;
    if (key < a[p]) {
        const std::size_t maxOfs = hint + 1;
        std::size_t last = 0, ofs = 1;
        while (ofs < maxOfs && key < a[p - ofs]) {
            last = ofs;
            ofs = 2 * ofs + 1;
        }
        ofs = std::min(ofs, maxOfs);
        lo = hint + 1 - ofs;
        hi = hint - last;
    } else {
        const std::size_t maxOfs = n - hint;
        std::size_t last = 0, ofs = 1;
        while (ofs < maxOfs && !(key < a[p + ofs])) {
            last = ofs;
            ofs = 2 * ofs + 1;
        }
        ofs = std::min(ofs, maxOfs);
        lo = hint + last + 1;
        hi = hint + ofs;
    }
    while (lo < hi) {
        std::size_t mid = lo + (hi - lo) / 2;
        if (key < a[base + mid]) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return hi;
}

// A pending run: arr[base, base + length).
struct Run {
    std::size_t base;
    std::size_t length;
};

// True if the run lengths (bottom of the stack first) satisfy X > Y + Z for every three
// neighbours and Y > Z for every two.
bool invariantsHold(const std::vector<Run>& runs) {
    for (std::size_t i = 0; i + 1 < runs.size(); ++i) {
        if (runs[i].length <= runs[i + 1].length) return false;
        if (i + 2 < runs.size() && runs[i].length <= runs[i + 1].length + runs[i + 2].length) return false;
    }
    return true;
}

// Called with the run stack after every mergeCollapse; the tests use it to check the
// invariants. Empty by default.
using CollapseHook = std::function<void(const std::vector<Run>&)>;

template <typename T>
struct MergeState {
    std::vector<T>& arr;
    bool gallop;
    std::vector<Run> pending;  // bottom of the stack first; the runs lie side by side
    std::size_t minGallop = kMinGallop;
    std::vector<T> tmp;  // the temporary copy of the smaller run

    MergeState(std::vector<T>& a, bool g) : arr(a), gallop(g) {}
};

// Merges A = arr[baseA, baseA + na) and B = arr[baseB, baseB + nb), na <= nb, left to right,
// with A copied to ms.tmp. After mergeAt's trimming, B[0] < A[0] and A[na - 1] > B[nb - 1],
// so B[0] goes first and A[na - 1] last without a comparison. Ties go to A: stable.
template <typename T>
void mergeLo(MergeState<T>& ms, std::size_t baseA, std::size_t na, std::size_t baseB, std::size_t nb) {
    std::vector<T>& arr = ms.arr;
    std::vector<T>& tmp = ms.tmp;
    tmp.assign(arr.begin() + baseA, arr.begin() + baseA + na);
    std::size_t a = 0, b = baseB, dest = baseA;

    arr[dest++] = arr[b++];
    --nb;
    std::size_t minGallop = ms.minGallop;
    while (nb > 0 && na > 1) {
        // One pair at a time, until one run wins minGallop times in a row.
        std::size_t aCount = 0, bCount = 0;
        while (nb > 0 && na > 1) {
            if (arr[b] < tmp[a]) {
                arr[dest++] = arr[b++];
                --nb;
                ++bCount;
                aCount = 0;
                if (ms.gallop && bCount >= minGallop) break;
            } else {
                arr[dest++] = tmp[a++];
                --na;
                ++aCount;
                bCount = 0;
                if (ms.gallop && aCount >= minGallop) break;
            }
        }
        if (nb == 0 || na <= 1) break;
        // Galloping: search for where the other run's head goes and move a block.
        ++minGallop;
        while (true) {
            if (minGallop > 1) --minGallop;
            ms.minGallop = minGallop;
            aCount = gallopRight(arr[b], tmp, a, na, 0);
            if (aCount > 0) {
                std::copy(tmp.begin() + a, tmp.begin() + a + aCount, arr.begin() + dest);
                dest += aCount;
                a += aCount;
                na -= aCount;
                if (na <= 1) break;
            }
            arr[dest++] = arr[b++];
            if (--nb == 0) break;
            bCount = gallopLeft(tmp[a], arr, b, nb, 0);
            if (bCount > 0) {
                std::copy(arr.begin() + b, arr.begin() + b + bCount, arr.begin() + dest);  // dest < b
                dest += bCount;
                b += bCount;
                nb -= bCount;
                if (nb == 0) break;
            }
            arr[dest++] = tmp[a++];
            if (--na == 1) break;
            if (aCount < kMinGallop && bCount < kMinGallop) break;
        }
        if (nb == 0 || na <= 1) break;
        ++minGallop;  // leaving galloping mode costs a point
        ms.minGallop = minGallop;
    }
    // What is left of B slides left; the rest of A (all of it if B ran out, else only its
    // last element, larger than all of B) goes after it.
    std::copy(arr.begin() + b, arr.begin() + b + nb, arr.begin() + dest);
    std::copy(tmp.begin() + a, tmp.begin() + a + na, arr.begin() + dest + nb);
}

// Merges A = arr[baseA, baseA + na) and B = arr[baseB, baseB + nb), na > nb, right to left,
// with B copied to ms.tmp: the mirror image of mergeLo. On a tie B's element is placed first
// (further right): stable. a is the last unmerged index of A; once A is empty it may step
// below baseA (wrapping around when baseA is 0, which is defined for unsigned types), and it
// is not read again.
template <typename T>
void mergeHi(MergeState<T>& ms, std::size_t baseA, std::size_t na, std::size_t baseB, std::size_t nb) {
    std::vector<T>& arr = ms.arr;
    std::vector<T>& tmp = ms.tmp;
    tmp.assign(arr.begin() + baseB, arr.begin() + baseB + nb);
    std::size_t a = baseA + na - 1, b = nb - 1, dest = baseB + nb - 1;

    arr[dest--] = arr[a--];
    --na;
    std::size_t minGallop = ms.minGallop;
    while (na > 0 && nb > 1) {
        std::size_t aCount = 0, bCount = 0;
        while (na > 0 && nb > 1) {
            if (tmp[b] < arr[a]) {
                arr[dest--] = arr[a--];
                --na;
                ++aCount;
                bCount = 0;
                if (ms.gallop && aCount >= minGallop) break;
            } else {
                arr[dest--] = tmp[b--];
                --nb;
                ++bCount;
                aCount = 0;
                if (ms.gallop && bCount >= minGallop) break;
            }
        }
        if (na == 0 || nb <= 1) break;
        ++minGallop;
        while (true) {
            if (minGallop > 1) --minGallop;
            ms.minGallop = minGallop;
            aCount = na - gallopRight(tmp[b], arr, baseA, na, na - 1);
            if (aCount > 0) {
                // A's last aCount elements move right as a block (dest > a).
                std::copy_backward(arr.begin() + (a + 1 - aCount), arr.begin() + (a + 1), arr.begin() + (dest + 1));
                dest -= aCount;
                a -= aCount;
                na -= aCount;
                if (na == 0) break;
            }
            arr[dest--] = tmp[b--];
            if (--nb == 1) break;
            bCount = nb - gallopLeft(arr[a], tmp, 0, nb, nb - 1);
            if (bCount > 0) {
                std::copy(tmp.begin() + (b + 1 - bCount), tmp.begin() + (b + 1), arr.begin() + (dest + 1 - bCount));
                dest -= bCount;
                b -= bCount;
                nb -= bCount;
                if (nb <= 1) break;
            }
            arr[dest--] = arr[a--];
            if (--na == 0) break;
            if (aCount < kMinGallop && bCount < kMinGallop) break;
        }
        if (na == 0 || nb <= 1) break;
        ++minGallop;
        ms.minGallop = minGallop;
    }
    // What is left of A slides right to end at dest; the rest of B (all of it if A ran out,
    // else only B[0], smaller than all of A) goes in front of it.
    std::copy_backward(arr.begin() + baseA, arr.begin() + baseA + na, arr.begin() + (dest + 1));
    std::copy(tmp.begin(), tmp.begin() + nb, arr.begin() + baseA);
}

// Merges the runs at stack positions i and i + 1, after trimming what is already in place.
template <typename T>
void mergeAt(MergeState<T>& ms, std::size_t i) {
    std::vector<T>& arr = ms.arr;
    std::size_t baseA = ms.pending[i].base, na = ms.pending[i].length;
    std::size_t baseB = ms.pending[i + 1].base, nb = ms.pending[i + 1].length;
    ms.pending[i].length = na + nb;
    ms.pending.erase(ms.pending.begin() + static_cast<std::ptrdiff_t>(i) + 1);

    std::size_t k = gallopRight(arr[baseB], arr, baseA, na, 0);
    baseA += k;
    na -= k;
    if (na == 0) return;
    nb = gallopLeft(arr[baseA + na - 1], arr, baseB, nb, nb - 1);
    if (nb == 0) return;
    if (na <= nb) {
        mergeLo(ms, baseA, na, baseB, nb);
    } else {
        mergeHi(ms, baseA, na, baseB, nb);
    }
}

// With C the top run, B, A and W below it: merge B with the smaller of A and C (C on a tie)
// while A <= B + C or W <= A + B; else merge B and C while B <= C. The W test is the 2015
// correction: without it the invariant can break deeper in the stack.
template <typename T>
void mergeCollapse(MergeState<T>& ms) {
    std::vector<Run>& p = ms.pending;
    while (p.size() > 1) {
        std::size_t n = p.size() - 2;
        if ((n > 0 && p[n - 1].length <= p[n].length + p[n + 1].length) ||
            (n > 1 && p[n - 2].length <= p[n - 1].length + p[n].length)) {
            if (p[n - 1].length < p[n + 1].length) --n;
            mergeAt(ms, n);
        } else if (p[n].length <= p[n + 1].length) {
            mergeAt(ms, n);
        } else {
            break;
        }
    }
}

// Merges every run left on the stack until one remains.
template <typename T>
void mergeForceCollapse(MergeState<T>& ms) {
    std::vector<Run>& p = ms.pending;
    while (p.size() > 1) {
        std::size_t n = p.size() - 2;
        if (n > 0 && p[n - 1].length < p[n + 1].length) --n;
        mergeAt(ms, n);
    }
}

// Sorts arr in place, stably. gallop = false turns galloping mode off inside merges (same
// result, to measure what galloping saves); minrun = 0 computes minrun from n, a positive
// value replaces it. T needs operator< and to be copyable.
template <typename T>
void timsort(std::vector<T>& arr, bool gallop = true, std::size_t minrun = 0,
             const CollapseHook& afterCollapse = nullptr) {
    const std::size_t n = arr.size();
    if (n < 2) return;
    MergeState<T> ms(arr, gallop);
    if (minrun == 0) minrun = computeMinrun(n);
    std::size_t lo = 0;
    while (lo < n) {
        RunInfo run = countRun(arr, lo, n);
        if (run.descending) std::reverse(arr.begin() + lo, arr.begin() + lo + run.length);
        if (run.length < minrun) {
            std::size_t force = std::min(minrun, n - lo);
            binaryInsertionSort(arr, lo, lo + force, lo + run.length);
            run.length = force;
        }
        ms.pending.push_back({lo, run.length});
        mergeCollapse(ms);
        if (afterCollapse) afterCollapse(ms.pending);
        lo += run.length;
    }
    mergeForceCollapse(ms);
}

template void timsort<int>(std::vector<int>&, bool, std::size_t, const CollapseHook&);
template void timsort<double>(std::vector<double>&, bool, std::size_t, const CollapseHook&);

#ifndef IS_TEST_BUILD
int main() {
    std::cout << "minrun for 64, 65, 100, 1000, 2112:";
    for (std::size_t n : {64, 65, 100, 1000, 2112}) std::cout << ' ' << computeMinrun(n);
    std::cout << '\n';
    std::vector<int> arr = {5, 6, 7, 8, 9, 3, 2, 1, 10, 11, 4, 12, 13, 0};
    timsort(arr, true, 4, [](const std::vector<Run>& runs) {
        std::cout << "stack:";
        for (const Run& r : runs) std::cout << ' ' << r.length;
        std::cout << '\n';
    });
    std::cout << "sorted:";
    for (int v : arr) std::cout << ' ' << v;
    std::cout << '\n';
    return 0;
}
#endif  // !IS_TEST_BUILD
