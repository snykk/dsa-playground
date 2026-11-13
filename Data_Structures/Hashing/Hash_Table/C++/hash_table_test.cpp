/**
 * Test cases for Hash Table (C++)
 */

#include <iostream>
#include <cassert>
#include <stdexcept>
#include <map>
#include <random>
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
    
    std::cout << "[PASS] Put and Get test passed" << std::endl;
}

void testUpdate() {
    HashTable<std::string, int> table;
    table.put("apple", 5);
    table.put("apple", 10);
    
    int* value = table.get("apple");
    assert(value != nullptr && *value == 10);
    assert(table.getSize() == 1);
    
    std::cout << "[PASS] Update test passed" << std::endl;
}

void testRemove() {
    HashTable<std::string, int> table;
    table.put("apple", 5);
    table.put("banana", 10);
    
    assert(table.remove("apple") == true);
    assert(table.get("apple") == nullptr);
    assert(table.getSize() == 1);
    
    assert(table.remove("nonexistent") == false);
    
    std::cout << "[PASS] Remove test passed" << std::endl;
}

void testContains() {
    HashTable<std::string, int> table;
    table.put("apple", 5);
    
    assert(table.contains("apple") == true);
    assert(table.contains("banana") == false);
    
    std::cout << "[PASS] Contains test passed" << std::endl;
}

void testEmptyTable() {
    HashTable<std::string, int> table;
    assert(table.isEmpty());
    assert(table.getSize() == 0);
    assert(table.get("key") == nullptr);
    
    std::cout << "[PASS] Empty table test passed" << std::endl;
}

void testChainLongerThanOne() {
    // int keys that are multiples of the capacity share bucket 0 (std::hash<int> is the identity).
    HashTable<int, int> table(16);
    for (int k = 0; k < 64; k += 16) table.put(k, k * 10);
    for (int k = 0; k < 64; k += 16) {
        int* v = table.get(k);
        assert(v != nullptr && *v == k * 10);
    }
    assert(table.remove(16));
    assert(table.get(16) == nullptr);
    assert(*table.get(48) == 480);
    assert(table.getSize() == 3);
    std::cout << "[PASS] Chain longer than one" << std::endl;
}

void testPointerSurvivesResize() {
    // resize() used to deep-copy the buckets, so a pointer from get() dangled afterwards.
    HashTable<int, int> table(4);
    table.put(1, 100);
    int* p = table.get(1);
    for (int k = 2; k < 200; k++) table.put(k, k);  // several resizes
    assert(table.get(1) == p);
    assert(*p == 100);
    for (int k = 2; k < 200; k++) assert(*table.get(k) == k);
    assert(table.getSize() == 199);
    std::cout << "[PASS] Pointer survives resize" << std::endl;
}

void testInvalidCapacity() {
    bool threw = false;
    try { HashTable<int, int> t(0); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    std::cout << "[PASS] Invalid capacity rejected" << std::endl;
}

void testGetOrDefault() {
    HashTable<std::string, int> table;
    table.put("apple", 5);
    assert(table.getOrDefault("apple", 0) == 5);
    assert(table.getOrDefault("nonexistent", 0) == 0);
    std::cout << "[PASS] GetOrDefault" << std::endl;
}

void testPutIfAbsent() {
    HashTable<std::string, int> table;
    assert(table.putIfAbsent("apple", 5));
    assert(table.getOrDefault("apple", 0) == 5);
    assert(!table.putIfAbsent("apple", 10));
    assert(table.getOrDefault("apple", 0) == 5);
    std::cout << "[PASS] PutIfAbsent" << std::endl;
}

void testUpdateFromMap() {
    HashTable<std::string, int> table;
    table.put("apple", 5);
    std::map<std::string, int> other = {{"apple", 50}, {"banana", 10}};
    table.update(other);
    assert(table.getOrDefault("apple", 0) == 50);  // overwritten by the other map
    assert(table.getOrDefault("banana", 0) == 10);
    assert(table.getSize() == 2);
    std::cout << "[PASS] Update" << std::endl;
}

// Random operations (tiny capacity forces many resizes) against std::map.
void testRandomAgainstStdMap() {
    std::mt19937 rng(11);
    for (int round = 0; round < 100; round++) {
        size_t caps[3] = {1, 2, 16};
        HashTable<int, int> table(caps[rng() % 3]);
        std::map<int, int> reference;
        for (int step = 0; step < 80; step++) {
            int key = (int)(rng() % 21) - 10;
            switch (rng() % 4) {
                case 0: table.put(key, step); reference[key] = step; break;
                case 1: assert(table.remove(key) == (reference.erase(key) == 1)); break;
                case 2: {
                    bool absent = reference.count(key) == 0;
                    assert(table.putIfAbsent(key, 99) == absent);
                    reference.emplace(key, 99);
                    break;
                }
                default: {
                    auto it = reference.find(key);
                    assert(table.getOrDefault(key, -1) == (it == reference.end() ? -1 : it->second));
                }
            }
            assert(table.getSize() == reference.size());
        }
    }
    std::cout << "[PASS] Random operations against std::map" << std::endl;
}

int main() {
    std::cout << "Running Hash Table tests..." << std::endl;
    std::cout << std::endl;
    
    testPutAndGet();
    testUpdate();
    testRemove();
    testContains();
    testEmptyTable();
    testChainLongerThanOne();
    testPointerSurvivesResize();
    testInvalidCapacity();
    testGetOrDefault();
    testPutIfAbsent();
    testUpdateFromMap();
    testRandomAgainstStdMap();
    
    std::cout << std::endl;
    std::cout << "All tests passed!" << std::endl;
    
    return 0;
}

