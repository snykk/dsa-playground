#include <iostream>
#include <vector>
#include <cassert>
#include "inclusion_exclusion.cpp"

using namespace std;

void testGCD() {
    assert(gcd(12, 18) == 6);
    cout << "✓ testGCD passed" << endl;
}

void testCountDivisible() {
    vector<int> divisors = {2, 3};
    int result = countDivisible(100, divisors);
    assert(result > 0);
    cout << "✓ testCountDivisible passed" << endl;
}

int main() {
    testGCD();
    testCountDivisible();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

