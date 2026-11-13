#include <cassert>
#include <iostream>
#include <cstdint>
#include "bit_manipulation.cpp"

void testIsPowerOfTwo() {
    assert(isPowerOfTwo(1) == true);
    assert(isPowerOfTwo(2) == true);
    assert(isPowerOfTwo(4) == true);
    assert(isPowerOfTwo(1024) == true);
    assert(isPowerOfTwo(0) == false);
    assert(isPowerOfTwo(3) == false);
    assert(isPowerOfTwo(6) == false);
    assert(isPowerOfTwo(15) == false);
    assert(isPowerOfTwo(-4) == false);
    cout << "testIsPowerOfTwo passed" << endl;
}

void testCountSetBits() {
    assert(countSetBits(0) == 0);
    assert(countSetBits(1) == 1);
    assert(countSetBits(7) == 3);
    assert(countSetBits(13) == 3);
    assert(countSetBits(255) == 8);
    assert(countSetBits(1024) == 1);
    // Regression: negatives were signed overflow (UB) in n - 1. They now count
    // as 64-bit two's complement values, like the Python and Go versions.
    assert(countSetBits(-1) == 64);
    assert(countSetBits(-8) == 61);
    assert(countSetBits(INT64_MIN) == 1);
    assert(countDifferingBits(-1, 0) == 64);
    cout << "testCountSetBits passed" << endl;
}

void testGetBit() {
    // 13 = 1101
    assert(getBit(13, 0) == 1);
    assert(getBit(13, 1) == 0);
    assert(getBit(13, 2) == 1);
    assert(getBit(13, 3) == 1);
    assert(getBit(0, 0) == 0);
    assert(getBit(0, 5) == 0);
    cout << "testGetBit passed" << endl;
}

void testSetBit() {
    assert(setBit(0, 0) == 1);
    assert(setBit(0, 3) == 8);
    assert(setBit(8, 1) == 10);
    assert(setBit(7, 0) == 7);  // already set
    cout << "testSetBit passed" << endl;
}

void testClearBit() {
    assert(clearBit(15, 2) == 11);
    assert(clearBit(7, 1) == 5);
    assert(clearBit(8, 0) == 8);  // already clear
    cout << "testClearBit passed" << endl;
}

void testToggleBit() {
    assert(toggleBit(0, 3) == 8);
    assert(toggleBit(15, 2) == 11);
    // Double toggle returns original
    assert(toggleBit(toggleBit(42, 3), 3) == 42);
    cout << "testToggleBit passed" << endl;
}

void testLowestSetBit() {
    assert(lowestSetBit(12) == 4);
    assert(lowestSetBit(10) == 2);
    assert(lowestSetBit(1) == 1);
    assert(lowestSetBit(8) == 8);
    assert(lowestSetBit(0) == 0);
    cout << "testLowestSetBit passed" << endl;
}

void testHighestSetBit() {
    assert(highestSetBit(1) == 0);
    assert(highestSetBit(8) == 3);
    assert(highestSetBit(13) == 3);
    assert(highestSetBit(255) == 7);
    assert(highestSetBit(0) == -1);
    assert(highestSetBit(-1) == -1);
    cout << "testHighestSetBit passed" << endl;
}

void testCountDifferingBits() {
    assert(countDifferingBits(0, 0) == 0);
    assert(countDifferingBits(1, 4) == 2);
    assert(countDifferingBits(7, 0) == 3);
    assert(countDifferingBits(42, 42) == 0);
    assert(countDifferingBits(7, 10) == 3);
    cout << "testCountDifferingBits passed" << endl;
}

void testSwapWithoutTemp() {
    auto [a1, b1] = swapWithoutTemp(3, 7);
    assert(a1 == 7 && b1 == 3);
    auto [a2, b2] = swapWithoutTemp(0, 5);
    assert(a2 == 5 && b2 == 0);
    auto [a3, b3] = swapWithoutTemp(4, 4);
    assert(a3 == 4 && b3 == 4);
    cout << "testSwapWithoutTemp passed" << endl;
}

void testIsEven() {
    assert(isEven(0) == true);
    assert(isEven(2) == true);
    assert(isEven(100) == true);
    assert(isEven(-4) == true);
    assert(isEven(1) == false);
    assert(isEven(3) == false);
    assert(isEven(99) == false);
    assert(isEven(-1) == false);
    cout << "testIsEven passed" << endl;
}

void testNextPowerOfTwo() {
    assert(nextPowerOfTwo(0) == 1);
    assert(nextPowerOfTwo(1) == 1);
    assert(nextPowerOfTwo(3) == 4);
    assert(nextPowerOfTwo(5) == 8);
    assert(nextPowerOfTwo(13) == 16);
    assert(nextPowerOfTwo(4) == 4);
    assert(nextPowerOfTwo(16) == 16);
    assert(nextPowerOfTwo(1024) == 1024);
    cout << "testNextPowerOfTwo passed" << endl;
}

void testSubsetGeneration() {
    auto empty = subsetGeneration(0);
    assert(empty.size() == 1);
    assert(empty[0].empty());

    auto single = subsetGeneration(1);
    assert(single.size() == 2);

    auto three = subsetGeneration(3);
    assert(three.size() == 8);

    auto four = subsetGeneration(4);
    assert(four.size() == 16);
    cout << "testSubsetGeneration passed" << endl;
}

int main() {
    cout << "Running Bit Manipulation tests..." << endl;
    testIsPowerOfTwo();
    testCountSetBits();
    testGetBit();
    testSetBit();
    testClearBit();
    testToggleBit();
    testLowestSetBit();
    testHighestSetBit();
    testCountDifferingBits();
    testSwapWithoutTemp();
    testIsEven();
    testNextPowerOfTwo();
    testSubsetGeneration();
    cout << "\nAll tests passed!" << endl;
    return 0;
}
