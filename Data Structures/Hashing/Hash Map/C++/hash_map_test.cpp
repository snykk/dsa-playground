/**
 * Test cases for Hash Map (C++)
 */

#include <iostream>
#include <cassert>
#include "hash_map.cpp"

void testGetOrDefault() {
    HashMap<std::string, int> map;
    map.put("apple", 5);
    
    assert(map.getOrDefault("apple", 0) == 5);
    assert(map.getOrDefault("nonexistent", 0) == 0);
    
    std::cout << "✓ GetOrDefault test passed" << std::endl;
}

void testPutIfAbsent() {
    HashMap<std::string, int> map;
    
    assert(map.putIfAbsent("apple", 5) == true);
    assert(map.getOrDefault("apple", 0) == 5);
    
    assert(map.putIfAbsent("apple", 10) == false);
    assert(map.getOrDefault("apple", 0) == 5);
    
    std::cout << "✓ PutIfAbsent test passed" << std::endl;
}

int main() {
    std::cout << "Running Hash Map tests..." << std::endl;
    std::cout << std::endl;
    
    testGetOrDefault();
    testPutIfAbsent();
    
    std::cout << std::endl;
    std::cout << "All tests passed! ✓" << std::endl;
    
    return 0;
}

