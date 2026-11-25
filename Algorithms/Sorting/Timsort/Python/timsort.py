"""
Timsort Implementation

Timsort is a stable merge sort that works with the order already in the data.
It follows the design of CPython's list.sort() (Objects/listsort.txt):

1. Natural runs. Scan the array from left to right for runs: a run is a
   non-descending stretch (a[i] <= a[i + 1]) or a strictly descending one
   (a[i] > a[i + 1]). A descending run is reversed in place; it is strict, so
   reversing it never reorders equal elements and the sort stays stable.
2. minrun. A run shorter than minrun is extended to minrun elements (or to the
   end of the array) with binary insertion sort. minrun is computed from n:
   n itself below 64, otherwise a value in 32..64 chosen so that n / minrun
   is a power of 2 or a little below one (compute_minrun).
3. The merge stack. Each run is pushed on a stack. After every push,
   merge_collapse merges neighbouring runs until the lengths on the stack
   satisfy, for every three consecutive runs X, Y, Z (Z nearest the top):
       X > Y + Z  and  Y > Z.
   The lengths then grow at least as fast as the Fibonacci numbers from the
   top down, so the stack holds O(log n) runs and the merges stay balanced.
   At the end, merge_force_collapse merges whatever is left.
4. Merging. Two neighbouring runs A and B are merged with a temporary copy of
   the smaller one: merge_lo works left to right when A is the smaller,
   merge_hi right to left when B is. Before merging, two searches trim the
   elements that are already in place.
5. Galloping. While merging, when one run wins min_gallop times in a row
   (MIN_GALLOP = 7 at the start), the merge switches to exponential search
   (gallop_left, gallop_right) to move whole blocks at once. min_gallop
   drops while galloping pays and rises when it stops paying.

Every comparison is a call to <, as in CPython, so wrapping the values in a
class whose __lt__ counts calls counts the comparisons of the sort.
"""

MIN_GALLOP = 7


def compute_minrun(n):
    """
    The minimum run length for an array of n elements, as CPython computes it.

    Take the six most significant bits of n and add 1 if any of the remaining
    bits is set. Below 64 that is n itself; from 64 on the result lies in
    32..64, and n / minrun is a power of 2 or a little below one, so the
    final merges are balanced.
    """
    r = 0
    while n >= 64:
        r |= n & 1
        n >>= 1
    return n + r


def count_run(arr, lo, hi):
    """
    Length of the run that starts at arr[lo], looking no further than hi.

    Returns (length, descending). A run is either non-descending
    (arr[i] <= arr[i + 1], tested as not arr[i + 1] < arr[i]) or strictly
    descending (arr[i + 1] < arr[i]). Strictness keeps equal elements out of
    descending runs, so reversing a descending run is stable. Makes
    length - 1 comparisons, or length if the run ends before hi.
    """
    if lo + 1 == hi:
        return 1, False
    n = 2
    if arr[lo + 1] < arr[lo]:
        while lo + n < hi and arr[lo + n] < arr[lo + n - 1]:
            n += 1
        return n, True
    while lo + n < hi and not arr[lo + n] < arr[lo + n - 1]:
        n += 1
    return n, False


def reverse_range(arr, lo, hi):
    """Reverse arr[lo:hi] in place."""
    hi -= 1
    while lo < hi:
        arr[lo], arr[hi] = arr[hi], arr[lo]
        lo += 1
        hi -= 1


def binary_insertion_sort(arr, lo, hi, start):
    """
    Sort arr[lo:hi], given that arr[lo:start] is already sorted.

    Each element from start on is placed by a binary search over the sorted
    part, then the larger elements shift one place right. An element equal
    to the pivot stays to its left, so the sort is stable. About log2(k)
    comparisons per element, but still up to k moves.
    """
    if start == lo:
        start += 1
    for i in range(start, hi):
        pivot = arr[i]
        left, right = lo, i
        # pivot >= everything in arr[lo:left] and < everything in arr[right:i].
        while left < right:
            mid = left + (right - left) // 2
            if pivot < arr[mid]:
                right = mid
            else:
                left = mid + 1
        for k in range(i, left, -1):
            arr[k] = arr[k - 1]
        arr[left] = pivot


def gallop_left(key, a, base, n, hint):
    """
    Where key belongs in the sorted a[base:base + n], left of any equal elements.

    Returns the k in 0..n with a[base + k - 1] < key <= a[base + k]. The search
    starts at a[base + hint] and probes offsets 1, 3, 7, 15, ... from it
    (exponential search), then binary-searches the last gap, so it costs
    about 2 log2(d) comparisons when the answer is d places from the hint.
    """
    p = base + hint
    if a[p] < key:
        # Gallop right until a[p + last] < key <= a[p + ofs].
        max_ofs = n - hint
        last, ofs = 0, 1
        while ofs < max_ofs and a[p + ofs] < key:
            last, ofs = ofs, 2 * ofs + 1
        ofs = min(ofs, max_ofs)
        lo, hi = hint + last + 1, hint + ofs
    else:
        # Gallop left until a[p - ofs] < key <= a[p - last].
        max_ofs = hint + 1
        last, ofs = 0, 1
        while ofs < max_ofs and not a[p - ofs] < key:
            last, ofs = ofs, 2 * ofs + 1
        ofs = min(ofs, max_ofs)
        lo, hi = hint + 1 - ofs, hint - last
    # Now a[base + lo - 1] < key <= a[base + hi]: binary search in between.
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[base + mid] < key:
            lo = mid + 1
        else:
            hi = mid
    return hi


def gallop_right(key, a, base, n, hint):
    """
    Where key belongs in the sorted a[base:base + n], right of any equal elements.

    Returns the k in 0..n with a[base + k - 1] <= key < a[base + k]. Same
    search as gallop_left; only the side that equal elements fall on differs.
    """
    p = base + hint
    if key < a[p]:
        # Gallop left until a[p - ofs] <= key < a[p - last].
        max_ofs = hint + 1
        last, ofs = 0, 1
        while ofs < max_ofs and key < a[p - ofs]:
            last, ofs = ofs, 2 * ofs + 1
        ofs = min(ofs, max_ofs)
        lo, hi = hint + 1 - ofs, hint - last
    else:
        # Gallop right until a[p + last] <= key < a[p + ofs].
        max_ofs = n - hint
        last, ofs = 0, 1
        while ofs < max_ofs and not key < a[p + ofs]:
            last, ofs = ofs, 2 * ofs + 1
        ofs = min(ofs, max_ofs)
        lo, hi = hint + last + 1, hint + ofs
    # Now a[base + lo - 1] <= key < a[base + hi]: binary search in between.
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if key < a[base + mid]:
            hi = mid
        else:
            lo = mid + 1
    return hi


class MergeState:
    """
    The state of one sort: the array, the stack of pending runs and min_gallop.

    pending holds (base, length) pairs, bottom of the stack first. The runs
    lie side by side: each one starts where the one below it ends.
    """

    def __init__(self, arr, gallop=True):
        self.arr = arr
        self.pending = []
        self.min_gallop = MIN_GALLOP
        self.gallop = gallop


def invariants_hold(lengths):
    """
    True if the run lengths (bottom of the stack first) satisfy the invariants:
    for every three consecutive runs X, Y, Z, X > Y + Z, and for every two, Y > Z.
    """
    for i in range(len(lengths) - 1):
        if lengths[i] <= lengths[i + 1]:
            return False
        if i + 2 < len(lengths) and lengths[i] <= lengths[i + 1] + lengths[i + 2]:
            return False
    return True


def merge_collapse(ms):
    """
    Merge runs near the top of the stack until the invariants hold again.

    With C the top run, B below it, A below B and W below A:
    - if A <= B + C, or W <= A + B, merge B with the smaller of A and C
      (with C on a tie);
    - else if B <= C, merge B and C;
    - else stop.
    The test of W is the 2015 correction: checking only A, B and C can leave
    the invariant broken deeper in the stack (see the README).
    """
    p = ms.pending
    while len(p) > 1:
        n = len(p) - 2  # B = p[n], C = p[n + 1]
        if (n > 0 and p[n - 1][1] <= p[n][1] + p[n + 1][1]) or (
            n > 1 and p[n - 2][1] <= p[n - 1][1] + p[n][1]
        ):
            if p[n - 1][1] < p[n + 1][1]:
                n -= 1  # A is smaller than C: merge A and B
            merge_at(ms, n)
        elif p[n][1] <= p[n + 1][1]:
            merge_at(ms, n)
        else:
            break


def merge_force_collapse(ms):
    """Merge every run left on the stack, top first, until one run remains."""
    p = ms.pending
    while len(p) > 1:
        n = len(p) - 2
        if n > 0 and p[n - 1][1] < p[n + 1][1]:
            n -= 1
        merge_at(ms, n)


def merge_at(ms, i):
    """
    Merge the runs at stack positions i and i + 1 (i is the third or second from the top).

    First trim what is already in place: the elements of A not greater than
    B[0] stay at the front (gallop_right), and the elements of B not less than
    A[-1] stay at the back (gallop_left). Then merge the rest with a temporary
    copy of the smaller side.
    """
    arr = ms.arr
    base_a, na = ms.pending[i]
    base_b, nb = ms.pending[i + 1]
    ms.pending[i] = (base_a, na + nb)
    del ms.pending[i + 1]

    k = gallop_right(arr[base_b], arr, base_a, na, 0)
    base_a += k
    na -= k
    if na == 0:
        return
    nb = gallop_left(arr[base_a + na - 1], arr, base_b, nb, nb - 1)
    if nb == 0:
        return
    if na <= nb:
        merge_lo(ms, base_a, na, base_b, nb)
    else:
        merge_hi(ms, base_a, na, base_b, nb)


def merge_lo(ms, base_a, na, base_b, nb):
    """
    Merge the neighbouring runs A = arr[base_a:base_a + na] and B (na <= nb), left to right.

    A is copied to a temporary list, and the output fills the array from
    base_a. After merge_at's trimming, B[0] < A[0] and A[-1] > B[-1], so B[0]
    goes first and A[-1] last without a comparison. Ties go to A: stable.
    """
    arr = ms.arr
    tmp = arr[base_a:base_a + na]
    a, b, dest = 0, base_b, base_a

    arr[dest] = arr[b]
    dest, b, nb = dest + 1, b + 1, nb - 1
    min_gallop = ms.min_gallop
    while nb > 0 and na > 1:
        # One pair at a time, until one run wins min_gallop times in a row.
        a_count = b_count = 0
        while nb > 0 and na > 1:
            if arr[b] < tmp[a]:
                arr[dest] = arr[b]
                dest, b, nb = dest + 1, b + 1, nb - 1
                b_count, a_count = b_count + 1, 0
                if ms.gallop and b_count >= min_gallop:
                    break
            else:
                arr[dest] = tmp[a]
                dest, a, na = dest + 1, a + 1, na - 1
                a_count, b_count = a_count + 1, 0
                if ms.gallop and a_count >= min_gallop:
                    break
        if nb == 0 or na <= 1:
            break
        # Galloping: search for where the other run's head goes and move a block.
        min_gallop += 1
        while True:
            min_gallop -= min_gallop > 1
            ms.min_gallop = min_gallop
            a_count = gallop_right(arr[b], tmp, a, na, 0)
            if a_count:
                arr[dest:dest + a_count] = tmp[a:a + a_count]
                dest, a, na = dest + a_count, a + a_count, na - a_count
                if na <= 1:
                    break
            arr[dest] = arr[b]
            dest, b, nb = dest + 1, b + 1, nb - 1
            if nb == 0:
                break
            b_count = gallop_left(tmp[a], arr, b, nb, 0)
            if b_count:
                arr[dest:dest + b_count] = arr[b:b + b_count]
                dest, b, nb = dest + b_count, b + b_count, nb - b_count
                if nb == 0:
                    break
            arr[dest] = tmp[a]
            dest, a, na = dest + 1, a + 1, na - 1
            if na == 1:
                break
            if a_count < MIN_GALLOP and b_count < MIN_GALLOP:
                break
        if nb == 0 or na <= 1:
            break
        min_gallop += 1  # leaving galloping mode costs a point
        ms.min_gallop = min_gallop
    # What is left of B slides left; the rest of A (all of it if B ran out, else
    # only A[-1], larger than all of B) goes after it.
    arr[dest:dest + nb] = arr[b:b + nb]
    arr[dest + nb:dest + nb + na] = tmp[a:a + na]


def merge_hi(ms, base_a, na, base_b, nb):
    """
    Merge the neighbouring runs A and B = arr[base_b:base_b + nb] (na > nb), right to left.

    The mirror image of merge_lo: B is copied to a temporary list and the
    output fills the array from the right end of B. A[-1] goes last and B[0]
    first without a comparison. On a tie the element of B is placed first
    (further right): stable.
    """
    arr = ms.arr
    tmp = arr[base_b:base_b + nb]
    a, b, dest = base_a + na - 1, nb - 1, base_b + nb - 1

    arr[dest] = arr[a]
    dest, a, na = dest - 1, a - 1, na - 1
    min_gallop = ms.min_gallop
    while na > 0 and nb > 1:
        a_count = b_count = 0
        while na > 0 and nb > 1:
            if tmp[b] < arr[a]:
                arr[dest] = arr[a]
                dest, a, na = dest - 1, a - 1, na - 1
                a_count, b_count = a_count + 1, 0
                if ms.gallop and a_count >= min_gallop:
                    break
            else:
                arr[dest] = tmp[b]
                dest, b, nb = dest - 1, b - 1, nb - 1
                b_count, a_count = b_count + 1, 0
                if ms.gallop and b_count >= min_gallop:
                    break
        if na == 0 or nb <= 1:
            break
        min_gallop += 1
        while True:
            min_gallop -= min_gallop > 1
            ms.min_gallop = min_gallop
            a_count = na - gallop_right(tmp[b], arr, base_a, na, na - 1)
            if a_count:
                dest, a, na = dest - a_count, a - a_count, na - a_count
                arr[dest + 1:dest + 1 + a_count] = arr[a + 1:a + 1 + a_count]
                if na == 0:
                    break
            arr[dest] = tmp[b]
            dest, b, nb = dest - 1, b - 1, nb - 1
            if nb == 1:
                break
            b_count = nb - gallop_left(arr[a], tmp, 0, nb, nb - 1)
            if b_count:
                dest, b, nb = dest - b_count, b - b_count, nb - b_count
                arr[dest + 1:dest + 1 + b_count] = tmp[b + 1:b + 1 + b_count]
                if nb <= 1:
                    break
            arr[dest] = arr[a]
            dest, a, na = dest - 1, a - 1, na - 1
            if na == 0:
                break
            if a_count < MIN_GALLOP and b_count < MIN_GALLOP:
                break
        if na == 0 or nb <= 1:
            break
        min_gallop += 1
        ms.min_gallop = min_gallop
    # What is left of A slides right to end at dest; the rest of B (all of it if
    # A ran out, else only B[0], smaller than all of A) goes in front of it.
    arr[dest - na + 1:dest + 1] = arr[base_a:base_a + na]
    arr[base_a:base_a + nb] = tmp[:nb]


def timsort(arr, gallop=True, minrun=0):
    """
    Sort a list in place with Timsort.

    Args:
        arr: List of elements that support < (modified in place)
        gallop: False turns galloping mode off inside merges, to measure what
            it saves; the result is the same
        minrun: 0 (the default) computes minrun from len(arr) as CPython does;
            a positive value replaces it (the visualization uses a small one
            so that a short array has several runs)

    Returns:
        The sorted list (same reference as input)

    Raises:
        ValueError: if minrun is negative

    Time Complexity: O(n log n) worst case; O(n) on sorted or strictly
        descending input (n - 1 comparisons)
    Space Complexity: O(n): the temporary copy holds up to n / 2 elements
    Stable: equal elements keep their order.
    """
    if minrun < 0:
        raise ValueError(f"minrun must be 0 (computed) or positive, got {minrun}")
    n = len(arr)
    if n < 2:
        return arr
    ms = MergeState(arr, gallop)
    if minrun == 0:
        minrun = compute_minrun(n)
    lo = 0
    while lo < n:
        run, descending = count_run(arr, lo, n)
        if descending:
            reverse_range(arr, lo, lo + run)
        if run < minrun:
            force = min(minrun, n - lo)
            binary_insertion_sort(arr, lo, lo + force, lo + run)
            run = force
        ms.pending.append((lo, run))
        merge_collapse(ms)
        lo += run
    merge_force_collapse(ms)
    return arr


if __name__ == "__main__":
    print(f"minrun for 64, 65, 100, 1000, 2112: {[compute_minrun(n) for n in (64, 65, 100, 1000, 2112)]}")
    example = [5, 6, 7, 8, 9, 3, 2, 1, 10, 11, 4, 12, 13, 0]
    print("input: ", example)
    print("sorted:", timsort(list(example), minrun=4))
