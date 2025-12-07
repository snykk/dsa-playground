/**
 * Test cases for Bloom Filter (C++)
 */

#include <iostream>
#include <cassert>
#include "bloom_filter.cpp"

void testAddAndContains() {
    BloomFilter bf(100, 0.01);
    bf.add("apple");
    bf.add("banana");
    
    assert(bf.contains("apple") == true);
    assert(bf.contains("banana") == true);
    assert(bf.contains("nonexistent") == false);
    
    std::cout << "✓ Add and Contains test passed" << std::endl;
}

int main() {
    std::cout << "Running Bloom Filter tests..." << std::endl;
    std::cout << std::endl;
    
    testAddAndContains();
    
    std::cout << std::endl;
    std::cout << "All tests passed! ✓" << std::endl;
    
    return 0;
}

