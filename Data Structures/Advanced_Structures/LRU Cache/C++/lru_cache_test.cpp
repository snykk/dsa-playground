/**
 * Test suite for LRU Cache data structure (C++)
 */

#include <iostream>
#include <cassert>
#include <type_traits>
#include "lru_cache.cpp"

void testBasicGetPut() {
    LRUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    assert(cache.get(1) == 10);
    assert(cache.get(2) == 20);
    std::cout << "  [PASS] Basic get/put" << std::endl;
}

void testGetNonexistentKey() {
    LRUCache cache(2);
    assert(cache.get(99) == -1);
    cache.put(1, 10);
    assert(cache.get(5) == -1);
    std::cout << "  [PASS] Get nonexistent key" << std::endl;
}

void testEvictsLRU() {
    LRUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(3, 30);  // evicts key 1
    assert(cache.get(1) == -1);
    assert(cache.get(2) == 20);
    assert(cache.get(3) == 30);
    std::cout << "  [PASS] Evicts LRU when capacity exceeded" << std::endl;
}

void testMultipleEvictions() {
    LRUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(3, 30);  // evicts key 1
    cache.put(4, 40);  // evicts key 2
    assert(cache.get(1) == -1);
    assert(cache.get(2) == -1);
    assert(cache.get(3) == 30);
    assert(cache.get(4) == 40);
    std::cout << "  [PASS] Multiple evictions" << std::endl;
}

void testEvictionRespectsAccessOrder() {
    LRUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.get(1);       // 1 is now most recently used
    cache.put(3, 30);   // evicts key 2, not key 1
    assert(cache.get(1) == 10);
    assert(cache.get(2) == -1);
    assert(cache.get(3) == 30);
    std::cout << "  [PASS] Eviction respects access order" << std::endl;
}

void testUpdateExistingKey() {
    LRUCache cache(2);
    cache.put(1, 10);
    cache.put(1, 100);
    assert(cache.get(1) == 100);
    std::cout << "  [PASS] Update existing key" << std::endl;
}

void testUpdateMovesToFront() {
    LRUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(1, 100);  // updates key 1, moves to front
    cache.put(3, 30);   // evicts key 2, not key 1
    assert(cache.get(1) == 100);
    assert(cache.get(2) == -1);
    assert(cache.get(3) == 30);
    std::cout << "  [PASS] Update moves to front" << std::endl;
}

void testUpdateDoesNotChangeSize() {
    LRUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    assert(cache.size() == 2);
    cache.put(1, 100);
    assert(cache.size() == 2);
    std::cout << "  [PASS] Update does not change size" << std::endl;
}

void testGetMovesToFront() {
    LRUCache cache(3);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(3, 30);
    cache.get(1);        // 1 is now most recently used
    cache.put(4, 40);    // evicts key 2
    assert(cache.get(1) == 10);
    assert(cache.get(2) == -1);
    std::cout << "  [PASS] Get moves to front" << std::endl;
}

void testGetReordersCorrectly() {
    LRUCache cache(3);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(3, 30);
    cache.get(1);        // order: 1, 3, 2
    cache.get(2);        // order: 2, 1, 3
    cache.put(4, 40);    // evicts key 3
    assert(cache.get(3) == -1);
    assert(cache.get(1) == 10);
    assert(cache.get(2) == 20);
    assert(cache.get(4) == 40);
    std::cout << "  [PASS] Get reorders correctly" << std::endl;
}

void testCapacityOne() {
    LRUCache cache(1);
    cache.put(1, 10);
    assert(cache.get(1) == 10);

    cache.put(2, 20);  // evicts key 1
    assert(cache.get(1) == -1);
    assert(cache.get(2) == 20);

    cache.put(2, 200);
    assert(cache.get(2) == 200);
    assert(cache.size() == 1);
    std::cout << "  [PASS] Capacity 1 edge case" << std::endl;
}

void testSizeGrows() {
    LRUCache cache(3);
    assert(cache.size() == 0);
    cache.put(1, 10);
    assert(cache.size() == 1);
    cache.put(2, 20);
    assert(cache.size() == 2);
    cache.put(3, 30);
    assert(cache.size() == 3);
    std::cout << "  [PASS] Size grows" << std::endl;
}

void testSizeDoesNotExceedCapacity() {
    LRUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(3, 30);
    assert(cache.size() == 2);
    std::cout << "  [PASS] Size does not exceed capacity" << std::endl;
}

void testCapacityZeroAndNegative() {
    LRUCache zero(0);
    zero.put(1, 10);
    assert(zero.size() == 0);
    assert(zero.get(1) == -1);
    LRUCache neg(-1);
    for (int i = 0; i < 10; i++) neg.put(i, i);
    assert(neg.size() == 0);
    assert(neg.get(5) == -1);
    std::cout << "  [PASS] Capacity 0 and negative store nothing" << std::endl;
}

void testNotCopyable() {
    // A copy would keep iterators into the source's list (use-after-free).
    static_assert(!std::is_copy_constructible<LRUCache>::value, "LRUCache must not be copyable");
    static_assert(!std::is_copy_assignable<LRUCache>::value, "LRUCache must not be copy-assignable");
    LRUCache a(2);
    a.put(1, 10);
    LRUCache b = std::move(a);
    assert(b.get(1) == 10);
    std::cout << "  [PASS] Not copyable, movable" << std::endl;
}

int main() {
    std::cout << "Running LRU Cache tests..." << std::endl;
    testBasicGetPut();
    testGetNonexistentKey();
    testEvictsLRU();
    testMultipleEvictions();
    testEvictionRespectsAccessOrder();
    testUpdateExistingKey();
    testUpdateMovesToFront();
    testUpdateDoesNotChangeSize();
    testGetMovesToFront();
    testGetReordersCorrectly();
    testCapacityOne();
    testSizeGrows();
    testSizeDoesNotExceedCapacity();
    testCapacityZeroAndNegative();
    testNotCopyable();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
