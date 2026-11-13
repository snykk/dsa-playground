/*
 * Test cases for Amortized Analysis examples
 */

#include <iostream>
#include <cassert>
#include "amortized_analysis.cpp"

using namespace std;

void testDynamicArray() {
    DynamicArray arr(2);
    
    // Test appends
    for (int i = 0; i < 10; i++) {
        arr.append(i);
    }
    
    assert(arr.getSize() == 10);
    assert(arr.getCapacity() >= 10);
    
    // Test access
    assert(arr.get(0) == 0);
    assert(arr.get(9) == 9);
    
    // Test index error
    try {
        arr.get(10);
        assert(false);  // Should throw
    } catch (const out_of_range& e) {
        // Expected
    }
    cout << "OK Dynamic array tests passed\n";
}

void testBinaryCounter() {
    BinaryCounter counter(4);
    
    // Test increments
    for (int i = 0; i < 5; i++) {
        counter.increment();
    }
    
    assert(counter.getValue() == 5);
    
    // Test more increments
    for (int i = 0; i < 10; i++) {
        counter.increment();
    }
    
    // Value should wrap around for 4-bit counter
    int value = counter.getValue();
    assert(value >= 0 && value < 16);
    cout << "OK Binary counter tests passed\n";
}

void testZeroInitialCapacity() {
    // Regression: capacity 0 used to stay 0 after doubling (out-of-bounds write)
    DynamicArray arr(0);
    for (int i = 0; i < 5; i++) {
        arr.append(i);
    }
    assert(arr.getSize() == 5);
    for (int i = 0; i < 5; i++) {
        assert(arr.get(i) == i);
    }
    cout << "OK Zero initial capacity test passed\n";
}

void testAggregateBounds() {
    for (int n : {1, 10, 100, 1000}) {
        DynamicArray arr(1);
        for (int i = 0; i < n; i++) {
            arr.append(i);
        }
        assert(arr.getCopies() <= 2LL * n);
    }
    BinaryCounter counter(16);
    for (int i = 0; i < 1000; i++) {
        counter.increment();
    }
    assert(counter.getFlips() <= 2000);
    assert(counter.getValue() == 1000);
    cout << "OK Aggregate bound tests passed\n";
}

int main() {
    cout << "Running Amortized Analysis tests...\n\n";
    
    testDynamicArray();
    testBinaryCounter();
    testZeroInitialCapacity();
    testAggregateBounds();
    
    cout << "\nAll tests passed! OK\n";
    return 0;
}
