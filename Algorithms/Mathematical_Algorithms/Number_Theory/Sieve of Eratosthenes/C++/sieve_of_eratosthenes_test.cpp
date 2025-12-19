/**
 * Unit tests for Sieve of Eratosthenes
 */

#include <cassert>
#include <iostream>
#include <vector>
#include "sieve_of_eratosthenes.cpp"

void testSieveSmall() {
    std::vector<int> primes = sieveOfEratosthenes(10);
    std::vector<int> expected = {2, 3, 5, 7};
    assert(primes == expected);
}

void testSieveMedium() {
    std::vector<int> primes = sieveOfEratosthenes(30);
    std::vector<int> expected = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29};
    assert(primes == expected);
}

void testSieveCount() {
    std::vector<int> primes_100 = sieveOfEratosthenes(100);
    assert(primes_100.size() == 25);
    
    std::vector<int> primes_50 = sieveOfEratosthenes(50);
    assert(primes_50.size() == 15);
}

void testSieveEmpty() {
    std::vector<int> primes = sieveOfEratosthenes(1);
    assert(primes.empty());
    
    primes = sieveOfEratosthenes(0);
    assert(primes.empty());
}

void testSieveBoolean() {
    std::vector<bool> sieve = sieveBoolean(20);
    assert(!sieve[0]);
    assert(!sieve[1]);
    assert(sieve[2]);
    assert(sieve[3]);
    assert(!sieve[4]);
    assert(sieve[5]);
    assert(!sieve[6]);
    assert(sieve[7]);
    assert(!sieve[8]);
    assert(!sieve[9]);
    assert(!sieve[10]);
    assert(sieve[11]);
}

void testIsPrimeSieve() {
    std::vector<bool> sieve = sieveBoolean(100);
    assert(isPrimeSieve(17, sieve));
    assert(isPrimeSieve(29, sieve));
    assert(!isPrimeSieve(20, sieve));
    assert(!isPrimeSieve(1, sieve));
    assert(!isPrimeSieve(0, sieve));
}

int main() {
    testSieveSmall();
    testSieveMedium();
    testSieveCount();
    testSieveEmpty();
    testSieveBoolean();
    testIsPrimeSieve();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

