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
    cout << "✓ Dynamic array tests passed\n";
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
    cout << "✓ Binary counter tests passed\n";
}

int main() {
    cout << "Running Amortized Analysis tests...\n\n";
    
    testDynamicArray();
    testBinaryCounter();
    
    cout << "\nAll tests passed! ✓\n";
    return 0;
}
