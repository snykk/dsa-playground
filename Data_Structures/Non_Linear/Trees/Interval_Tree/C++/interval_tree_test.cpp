/**
 * Test cases for Interval Tree (C++)
 */

#include <iostream>
#include <cassert>
#include <chrono>
#include <random>
#include <type_traits>
#include <utility>
#include "interval_tree.cpp"

// Regression: the tree owns raw nodes, and the implicit copy freed them twice
// (ASan heap-use-after-free on `{ IntervalTree b = a; }`). Copying must not compile.
static_assert(!std::is_copy_constructible<IntervalTree>::value, "IntervalTree must not be copyable");
static_assert(!std::is_copy_assignable<IntervalTree>::value, "IntervalTree must not be copy-assignable");

typedef std::vector<std::pair<int, int>> Pairs;

static Pairs sorted(const std::vector<Interval>& v) {
    Pairs out;
    for (const Interval& i : v) out.push_back({i.low, i.high});
    std::sort(out.begin(), out.end());
    return out;
}

void testInsertAndSearch() {
    IntervalTree tree;
    for (auto iv : Pairs{{15, 20}, {10, 30}, {17, 19}, {5, 20}, {12, 15}, {30, 40}}) {
        tree.insert(Interval(iv.first, iv.second));
    }

    Pairs expected = {{5, 20}, {10, 30}, {12, 15}, {15, 20}};
    assert(sorted(tree.searchOverlapping(Interval(14, 16))) == expected);

    std::cout << "Insert and search test passed" << std::endl;
}

void testSearchPoint() {
    IntervalTree tree;
    tree.insert(Interval(10, 20));
    tree.insert(Interval(15, 25));
    tree.insert(Interval(30, 40));

    assert(sorted(tree.searchContainingPoint(15)) == (Pairs{{10, 20}, {15, 25}}));
    assert(sorted(tree.searchContainingPoint(20)) == (Pairs{{10, 20}, {15, 25}}));
    assert(tree.searchContainingPoint(26).empty());

    std::cout << "Search point test passed" << std::endl;
}

void testEmptyTree() {
    IntervalTree tree;
    assert(tree.isEmpty());
    assert(tree.size() == 0);
    assert(tree.searchOverlapping(Interval(10, 20)).empty());

    std::cout << "Empty tree test passed" << std::endl;
}

void testContainedAndDelete() {
    IntervalTree tree;
    for (auto iv : Pairs{{10, 20}, {15, 18}, {12, 16}, {25, 30}, {4, 8}, {4, 8}}) {
        tree.insert(Interval(iv.first, iv.second));
    }
    assert(sorted(tree.searchContainedIn(Interval(10, 20))) == (Pairs{{10, 20}, {12, 16}, {15, 18}}));

    assert(tree.remove(Interval(4, 8)));
    assert(tree.size() == 5);
    assert(tree.remove(Interval(4, 8)));
    assert(!tree.remove(Interval(4, 8)));
    assert(tree.remove(Interval(10, 20)));
    assert(tree.validateMax());
    assert(tree.size() == 3);

    std::cout << "Contained and delete test passed" << std::endl;
}

// Regression: every insert used to recompute max over the whole tree (O(n^2) total).
void testInsertIsNotQuadratic() {
    IntervalTree tree;
    std::mt19937 rng(1);
    auto start = std::chrono::steady_clock::now();
    for (int i = 0; i < 100000; i++) {
        int low = rng() % 1000000;
        tree.insert(Interval(low, low + (int)(rng() % 1000)));
    }
    double seconds = std::chrono::duration<double>(std::chrono::steady_clock::now() - start).count();
    assert(seconds < 5.0);
    assert(tree.validateMax());
    assert(tree.size() == 100000);

    std::cout << "Insert scaling test passed" << std::endl;
}

void testRandomAgainstBruteForce() {
    for (int seed = 0; seed < 100; seed++) {
        std::mt19937 rng(seed);
        IntervalTree tree;
        Pairs ref;
        for (int step = 0; step < 80; step++) {
            if (!ref.empty() && rng() % 10 < 3) {
                size_t idx = rng() % ref.size();
                auto victim = ref[idx];
                assert(tree.remove(Interval(victim.first, victim.second)));
                ref.erase(ref.begin() + idx);
            } else {
                int low = rng() % 40;
                int high = low + rng() % 15;
                tree.insert(Interval(low, high));
                ref.push_back({low, high});
            }
            assert(tree.validateMax());
            int lo = rng() % 50;
            int hi = lo + rng() % 15;
            Pairs want_overlap, want_contained;
            for (auto& iv : ref) {
                if (!(iv.second < lo || hi < iv.first)) want_overlap.push_back(iv);
                if (lo <= iv.first && iv.second <= hi) want_contained.push_back(iv);
            }
            std::sort(want_overlap.begin(), want_overlap.end());
            std::sort(want_contained.begin(), want_contained.end());
            assert(sorted(tree.searchOverlapping(Interval(lo, hi))) == want_overlap);
            assert(sorted(tree.searchContainedIn(Interval(lo, hi))) == want_contained);
        }
        assert(tree.size() == (int)ref.size());
    }
    std::cout << "Random test passed" << std::endl;
}

int main() {
    std::cout << "Running Interval Tree tests..." << std::endl;
    std::cout << std::endl;

    testInsertAndSearch();
    testSearchPoint();
    testEmptyTree();
    testContainedAndDelete();
    testInsertIsNotQuadratic();
    testRandomAgainstBruteForce();

    std::cout << std::endl;
    std::cout << "All tests passed!" << std::endl;

    return 0;
}
