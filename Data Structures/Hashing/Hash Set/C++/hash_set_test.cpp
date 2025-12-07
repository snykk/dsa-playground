/**
 * Test cases for Hash Set (C++)
 */

#include <iostream>
#include <cassert>
#include "hash_set.cpp"

void testAdd() {
    HashSet<std::string> set;
    assert(set.add("apple") == true);
    assert(set.add("banana") == true);
    assert(set.add("apple") == false);
    assert(set.getSize() == 2);
    
    std::cout << "✓ Add test passed" << std::endl;
}

void testRemove() {
    HashSet<std::string> set;
    set.add("apple");
    set.add("banana");
    
    assert(set.remove("apple") == true);
    assert(set.contains("apple") == false);
    assert(set.getSize() == 1);
    
    std::cout << "✓ Remove test passed" << std::endl;
}

int main() {
    std::cout << "Running Hash Set tests..." << std::endl;
    std::cout << std::endl;
    
    testAdd();
    testRemove();
    
    std::cout << std::endl;
    std::cout << "All tests passed! ✓" << std::endl;
    
    return 0;
}

