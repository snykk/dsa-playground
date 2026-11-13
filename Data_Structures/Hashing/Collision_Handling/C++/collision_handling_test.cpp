/**
 * Test cases for Collision Handling (C++)
 */

#include <iostream>
#include <cassert>
#include <stdexcept>
#include <string>
#include "collision_handling.cpp"

void testChaining() {
    HashTableChaining<std::string, int> table;
    table.put("apple", 5);
    table.put("banana", 10);
    
    int* value = table.get("apple");
    assert(value != nullptr && *value == 5);
    
    std::cout << "[PASS] Chaining" << std::endl;
}

void testOpenAddressing() {
    HashTableOpenAddressing<std::string, int> table;
    table.put("apple", 5);
    table.put("banana", 10);
    
    int* value = table.get("apple");
    assert(value != nullptr && *value == 5);
    
    std::cout << "[PASS] Open Addressing" << std::endl;
}

void testChainingCollisions() {
    // Integer keys that are multiples of the capacity share bucket 0
    // (libstdc++ and libc++ hash an int to itself).
    HashTableChaining<int, int> table(8);
    for (int k = 0; k < 32; k += 8) table.put(k, k * 10);
    assert(table.longestChain() == 4);
    for (int k = 0; k < 32; k += 8) {
        int* v = table.get(k);
        assert(v != nullptr && *v == k * 10);
    }
    table.put(16, -1);
    assert(*table.get(16) == -1);
    assert(table.get(40) == nullptr);
    std::cout << "[PASS] Chaining collisions" << std::endl;
}

void testOpenAddressingFullTable() {
    // On a full table, put of a new key and get of a missing key used to loop forever.
    HashTableOpenAddressing<int, int> table(4);
    for (int k = 0; k < 4; k++) table.put(k, k);
    bool threw = false;
    try { table.put(100, 1); } catch (const std::runtime_error&) { threw = true; }
    assert(threw);
    assert(table.get(100) == nullptr);
    table.put(2, 22);  // updating an existing key still works
    assert(*table.get(2) == 22);
    std::cout << "[PASS] Open addressing full table" << std::endl;
}

void testOpenAddressingWrapAround() {
    HashTableOpenAddressing<int, int> table(4);
    // 3, 7, 11 and 15 all start at slot 3 and wrap around to 0, 1, 2.
    for (int k : {3, 7, 11, 15}) table.put(k, k);
    for (int k : {3, 7, 11, 15}) assert(*table.get(k) == k);
    std::cout << "[PASS] Open addressing wrap-around" << std::endl;
}

void testOpenAddressingCopyIsDeep() {
    // Slots used to be raw owning pointers: copies shared them and nothing was freed.
    HashTableOpenAddressing<int, int> a(8);
    a.put(1, 10);
    HashTableOpenAddressing<int, int> b = a;
    b.put(1, 99);
    assert(*a.get(1) == 10);
    assert(*b.get(1) == 99);
    std::cout << "[PASS] Open addressing copy is deep" << std::endl;
}

void testInvalidCapacity() {
    bool threw = false;
    try { HashTableChaining<int, int> t(0); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    threw = false;
    try { HashTableOpenAddressing<int, int> t(0); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    std::cout << "[PASS] Invalid capacity rejected" << std::endl;
}

int main() {
    std::cout << "Running Collision Handling tests..." << std::endl;
    std::cout << std::endl;
    
    testChaining();
    testOpenAddressing();
    testChainingCollisions();
    testOpenAddressingFullTable();
    testOpenAddressingWrapAround();
    testOpenAddressingCopyIsDeep();
    testInvalidCapacity();
    
    std::cout << std::endl;
    std::cout << "All tests passed!" << std::endl;
    
    return 0;
}

