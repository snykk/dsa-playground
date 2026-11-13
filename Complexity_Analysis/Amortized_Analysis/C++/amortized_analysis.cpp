/*
 * Amortized Analysis Implementation and Examples
 *
 * Amortized analysis provides the average performance of each operation
 * in the worst case over a sequence of operations.
 */

#include <iostream>
#include <algorithm>
#include <stdexcept>
#include <vector>

using namespace std;

class DynamicArray {
private:
    int capacity;
    int size;
    vector<int> data;
    long long copies;  // total element copies made by all resizes

    void resize() {
        int old_capacity = capacity;
        capacity = max(1, capacity * 2);
        vector<int> new_data(capacity);
        
        for (int i = 0; i < old_capacity; i++) {
            new_data[i] = data[i];
        }
        copies += old_capacity;
        
        data = new_data;
    }

public:
    DynamicArray(int initial_capacity = 4) 
        : capacity(initial_capacity), size(0), copies(0) {
        data.resize(capacity);
    }
    
    // Amortized O(1) append operation
    void append(int value) {
        if (size >= capacity) {
            resize();  // O(n) operation
        }
        data[size++] = value;
    }
    
    int get(int index) {
        if (index >= 0 && index < size) {
            return data[index];
        }
        throw out_of_range("Index out of range");
    }
    
    int getSize() { return size; }
    int getCapacity() { return capacity; }
    long long getCopies() { return copies; }
};

class BinaryCounter {
private:
    vector<int> bits;
    int n_bits;
    long long flips;  // total bit flips made by all increments

public:
    BinaryCounter(int n_bits = 8) : n_bits(n_bits), flips(0) {
        bits.resize(n_bits, 0);
    }
    
    // Amortized O(1) increment operation
    void increment() {
        int i = 0;
        while (i < n_bits && bits[i] == 1) {
            bits[i] = 0;
            flips++;
            i++;
        }
        if (i < n_bits) {
            bits[i] = 1;
            flips++;
        }
    }

    long long getFlips() { return flips; }
    
    int getValue() {
        int value = 0;
        for (int i = 0; i < n_bits; i++) {
            value += bits[i] * (1 << i);
        }
        return value;
    }
};

void demonstrateAmortizedAnalysis() {
    cout << "=== Amortized Analysis Examples ===\n\n";
    
    // Dynamic Array
    cout << "Dynamic Array (Amortized O(1) append):\n";
    DynamicArray arr(2);
    for (int i = 0; i < 10; i++) {
        arr.append(i);
        cout << "  Append " << i << ": size=" << arr.getSize() 
             << ", capacity=" << arr.getCapacity() << "\n";
    }
    cout << "\nAmortized cost: O(1) per append\n\n";
    
    // Binary Counter
    cout << "Binary Counter (Amortized O(1) increment):\n";
    BinaryCounter counter(4);
    for (int i = 0; i < 10; i++) {
        counter.increment();
        cout << "  Increment " << (i + 1) << ": value=" 
             << counter.getValue() << "\n";
    }
    cout << "\nAmortized cost: O(1) per increment\n\n";
    
    cout << "Key Insight: Expensive operations are 'paid for' by cheap ones\n";
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    demonstrateAmortizedAnalysis();
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
