#include <iostream>
#include <vector>
#include <cassert>
#include "inclusion_exclusion.cpp"

using namespace std;

void testGCD() {
    assert(gcd(12, 18) == 6);
    cout << "testGCD passed" << endl;
}

void testCountDivisible() {
    vector<int> divisors = {2, 3};
    int result = countDivisible(100, divisors);
    assert(result == 67);
    assert(countDivisible(100, {2, 3, 5}) == 74);
    // Regression: the lcm used to overflow int (11 primes gave 847147848).
    vector<int> primes = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37};
    assert(countDivisible(1000000000, vector<int>(primes.begin(), primes.begin() + 11)) == 847147843);
    assert(countDivisible(1000000000, primes) == 851278987);
    cout << "testCountDivisible passed" << endl;
}

// Regression: every term used to be intersected with sets[0] as well.
void testCountUnionSets() {
    assert(countUnionSets({{1, 2, 3}, {2, 3, 4}, {3, 4, 5}}) == 5);
    assert(countUnionSets({{1}, {2}}) == 2);
    assert(countUnionSets({{1, 2}, {1, 2}}) == 2);
    assert(countUnionSets({{}, {7}}) == 1);
    assert(countUnionSets({}) == 0);
    cout << "testCountUnionSets passed" << endl;
}

int main() {
    testGCD();
    testCountDivisible();
    testCountUnionSets();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

