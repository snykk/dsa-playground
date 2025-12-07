/**
 * Test cases for Hash Table (C++)
 */

#include <iostream>
#include <cassert>
#include "hash_table.cpp"

void testPutAndGet() {
    HashTable<std::string, int> table;
    table.put("apple", 5);
    table.put("banana", 10);
    table.put("cherry", 15);
    
    int* value = table.get("apple");
    assert(value != nullptr && *value == 5);
    
    value = table.get("banana");
    assert(value != nullptr && *value == 10);
    
    std::cout << "✓ Put and Get test passed" << std::endl;
}

void testUpdate() {
    HashTable<std::string, int> table;
    table.put("apple", 5);
    table.put("apple", 10);
    
    int* value = table.get("apple");
    assert(value != nullptr && *value == 10);
    assert(table.getSize() == 1);
    
    std::cout << "✓ Update test passed" << std::endl;
}

void testRemove() {
    HashTable<std::string, int> table;
    table.put("apple", 5);
    table.put("banana", 10);
    
    assert(table.remove("apple") == true);
    assert(table.get("apple") == nullptr);
    assert(table.getSize() == 1);
    
    assert(table.remove("nonexistent") == false);
    
    std::cout << "✓ Remove test passed" << std::endl;
}

void testContains() {
    HashTable<std::string, int> table;
    table.put("apple", 5);
    
    assert(table.contains("apple") == true);
    assert(table.contains("banana") == false);
    
    std::cout << "✓ Contains test passed" << std::endl;
}

void testEmptyTable() {
    HashTable<std::string, int> table;
    assert(table.isEmpty());
    assert(table.getSize() == 0);
    assert(table.get("key") == nullptr);
    
    std::cout << "✓ Empty table test passed" << std::endl;
}

int main() {
    std::cout << "Running Hash Table tests..." << std::endl;
    std::cout << std::endl;
    
    testPutAndGet();
    testUpdate();
    testRemove();
    testContains();
    testEmptyTable();
    
    std::cout << std::endl;
    std::cout << "All tests passed! ✓" << std::endl;
    
    return 0;
}

