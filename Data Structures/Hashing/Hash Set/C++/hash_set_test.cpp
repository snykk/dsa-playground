/**
 * Test cases for Hash Set (C++)
 */

#include <iostream>
#include <cassert>
#include <stdexcept>
#include "hash_set.cpp"

void testAdd() {
    HashSet<std::string> set;
    assert(set.add("apple") == true);
    assert(set.add("banana") == true);
    assert(set.add("apple") == false);
    assert(set.getSize() == 2);
    
    std::cout << "[PASS] Add test passed" << std::endl;
}

void testRemove() {
    HashSet<std::string> set;
    set.add("apple");
    set.add("banana");
    
    assert(set.remove("apple") == true);
    assert(set.contains("apple") == false);
    assert(set.getSize() == 1);
    
    std::cout << "[PASS] Remove test passed" << std::endl;
}

void testResizeKeepsElements() {
    // The set used to ignore its load factor: 100000 adds stayed in 16 buckets.
    HashSet<int> set(4);
    for (int k = 0; k < 1000; k++) assert(set.add(k));
    assert(set.getSize() == 1000);
    assert(set.bucketCount() > 4);
    assert((double)set.getSize() / set.bucketCount() <= 0.75);
    for (int k = 0; k < 1000; k++) assert(set.contains(k));
    assert(!set.contains(1000));
    assert(!set.add(500));
    std::cout << "[PASS] Resize keeps elements" << std::endl;
}

void testInvalidCapacity() {
    bool threw = false;
    try { HashSet<int> s(0); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    std::cout << "[PASS] Invalid capacity rejected" << std::endl;
}

int main() {
    std::cout << "Running Hash Set tests..." << std::endl;
    std::cout << std::endl;
    
    testAdd();
    testRemove();
    testResizeKeepsElements();
    testInvalidCapacity();
    
    std::cout << std::endl;
    std::cout << "All tests passed!" << std::endl;
    
    return 0;
}

