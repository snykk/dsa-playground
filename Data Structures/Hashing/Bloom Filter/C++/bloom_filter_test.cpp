/**
 * Test cases for Bloom Filter (C++)
 */

#include <iostream>
#include <cassert>
#include <stdexcept>
#include <string>
#include "bloom_filter.cpp"

void testAddAndContains() {
    BloomFilter bf(100, 0.01);
    bf.add("apple");
    bf.add("banana");
    
    assert(bf.contains("apple") == true);
    assert(bf.contains("banana") == true);
    assert(bf.contains("nonexistent") == false);
    
    std::cout << "[PASS] Add and Contains" << std::endl;
}

void testTinyFilterStillRejects() {
    // BloomFilter(2, 0.5) used to get 0 hashes and answer true for everything.
    BloomFilter bf(2, 0.5);
    assert(bf.numHashes() >= 1);
    assert(bf.contains("never") == false);
    std::cout << "[PASS] Tiny filter still rejects" << std::endl;
}

void testSizing() {
    // 100 items at 1%: ceil(958.5) = 959 bits, k = round(6.65) = 7
    BloomFilter bf(100, 0.01);
    assert(bf.numBits() == 959);
    assert(bf.numHashes() == 7);
    std::cout << "[PASS] Sizing" << std::endl;
}

void testInvalidArguments() {
    bool threw = false;
    try { BloomFilter bf(0, 0.01); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    threw = false;
    try { BloomFilter bf(10, 1.0); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    threw = false;
    try { BloomFilter bf(10, 0.0); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    std::cout << "[PASS] Invalid arguments rejected" << std::endl;
}

void testMeasuredFalsePositiveRate() {
    BloomFilter bf(1000, 0.01);
    for (int i = 0; i < 1000; i++) bf.add("member-" + std::to_string(i));
    for (int i = 0; i < 1000; i++) assert(bf.contains("member-" + std::to_string(i)));
    int falsePositives = 0;
    for (int j = 0; j < 20000; j++) {
        if (bf.contains("other-" + std::to_string(j))) falsePositives++;
    }
    // configured 1%; allow up to 3%
    assert(falsePositives < 600);
    std::cout << "[PASS] Measured false positive rate near 1%" << std::endl;
}

int main() {
    std::cout << "Running Bloom Filter tests..." << std::endl;
    std::cout << std::endl;
    
    testAddAndContains();
    testTinyFilterStillRejects();
    testSizing();
    testInvalidArguments();
    testMeasuredFalsePositiveRate();
    
    std::cout << std::endl;
    std::cout << "All tests passed!" << std::endl;
    
    return 0;
}

