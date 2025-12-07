/**
 * Test cases for Collision Handling (C++)
 */

#include <iostream>
#include <cassert>
#include "collision_handling.cpp"

void testChaining() {
    HashTableChaining<std::string, int> table;
    table.put("apple", 5);
    table.put("banana", 10);
    
    int* value = table.get("apple");
    assert(value != nullptr && *value == 5);
    
    std::cout << "✓ Chaining test passed" << std::endl;
}

void testOpenAddressing() {
    HashTableOpenAddressing<std::string, int> table;
    table.put("apple", 5);
    table.put("banana", 10);
    
    int* value = table.get("apple");
    assert(value != nullptr && *value == 5);
    
    std::cout << "✓ Open Addressing test passed" << std::endl;
}

int main() {
    std::cout << "Running Collision Handling tests..." << std::endl;
    std::cout << std::endl;
    
    testChaining();
    testOpenAddressing();
    
    std::cout << std::endl;
    std::cout << "All tests passed! ✓" << std::endl;
    
    return 0;
}

