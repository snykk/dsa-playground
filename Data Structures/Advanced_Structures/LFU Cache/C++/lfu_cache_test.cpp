#include "lfu_cache.h"

#include <cassert>
#include <iostream>

void testMissReturnsMinusOne() {
    LFUCache cache(2);
    assert(cache.get(1) == -1);
}

void testBasicPutGet() {
    LFUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    assert(cache.get(1) == 10);
    assert(cache.get(2) == 20);
}

void testEvictionLeastFrequentFirst() {
    LFUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.get(1);           // freq(1)=2, freq(2)=1
    cache.put(3, 30);       // evicts 2
    assert(cache.get(2) == -1);
    assert(cache.get(1) == 10);
    assert(cache.get(3) == 30);
}

void testEvictionTieBrokenByLRU() {
    LFUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(3, 30);       // both freq=1; 1 is LRU → evict 1
    assert(cache.get(1) == -1);
    assert(cache.get(2) == 20);
    assert(cache.get(3) == 30);
}

void testUpdateValueDoesNotEvict() {
    LFUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(1, 100);
    assert(cache.get(1) == 100);
    assert(cache.get(2) == 20);
}

void testUpdatePromotesFrequency() {
    LFUCache cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(1, 100);      // freq(1)=2, freq(2)=1
    cache.put(3, 30);       // evicts 2
    assert(cache.get(2) == -1);
    assert(cache.get(1) == 100);
}

void testCapacityZero() {
    LFUCache cache(0);
    cache.put(1, 10);
    assert(cache.get(1) == -1);
}

void testCapacityOne() {
    LFUCache cache(1);
    cache.put(1, 10);
    assert(cache.get(1) == 10);
    cache.put(2, 20);
    assert(cache.get(1) == -1);
    assert(cache.get(2) == 20);
}

void testLeetCodeOfficial() {
    LFUCache cache(2);
    cache.put(1, 1);
    cache.put(2, 2);
    assert(cache.get(1) == 1);
    cache.put(3, 3);
    assert(cache.get(2) == -1);
    assert(cache.get(3) == 3);
    cache.put(4, 4);
    assert(cache.get(1) == -1);
    assert(cache.get(3) == 3);
    assert(cache.get(4) == 4);
}

int main() {
    testMissReturnsMinusOne();
    testBasicPutGet();
    testEvictionLeastFrequentFirst();
    testEvictionTieBrokenByLRU();
    testUpdateValueDoesNotEvict();
    testUpdatePromotesFrequency();
    testCapacityZero();
    testCapacityOne();
    testLeetCodeOfficial();
    std::cout << "All 9 tests passed!" << std::endl;
    return 0;
}
