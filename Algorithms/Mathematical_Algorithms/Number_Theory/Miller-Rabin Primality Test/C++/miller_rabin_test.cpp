/**
 * Unit tests for Miller-Rabin Primality Test
 */

#include <cassert>
#include <iostream>
#include <vector>
#include "miller_rabin.cpp"

void testSmallPrimes() {
    std::vector<long long> primes = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 97, 101};
    for (long long p : primes) {
        assert(isPrimeMillerRabin(p, 10));
        assert(millerRabinDeterministic(p));
    }
}

void testComposites() {
    std::vector<long long> composites = {4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 100};
    for (long long c : composites) {
        assert(!isPrimeMillerRabin(c, 10));
        assert(!millerRabinDeterministic(c));
    }
}

void testEdgeCases() {
    assert(!isPrimeMillerRabin(0));
    assert(!isPrimeMillerRabin(1));
    assert(isPrimeMillerRabin(2));
    assert(!isPrimeMillerRabin(4));
}

void testDeterministic() {
    // Test deterministic version
    assert(millerRabinDeterministic(2));
    assert(millerRabinDeterministic(3));
    assert(millerRabinDeterministic(17));
    assert(millerRabinDeterministic(97));
    assert(!millerRabinDeterministic(100));
    assert(millerRabinDeterministic(101));
}

int main() {
    testSmallPrimes();
    testComposites();
    testEdgeCases();
    testDeterministic();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

