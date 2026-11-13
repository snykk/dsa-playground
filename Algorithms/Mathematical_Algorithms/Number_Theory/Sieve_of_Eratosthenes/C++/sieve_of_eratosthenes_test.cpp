/**
 * Unit tests for Sieve of Eratosthenes
 */

#include <cassert>
#include <climits>
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

void testNegativeIndexIsNotPrime() {
    std::vector<bool> sieve = sieveBoolean(101);
    assert(sieve[101]);  // 101 is prime
    assert(!isPrimeSieve(-1, sieve));
    assert(!isPrimeSieve(-101, sieve));
    assert(!isPrimeSieve(INT_MIN, sieve));
}

void testBeyondTheSieveIsFalse() {
    assert(!isPrimeSieve(103, sieveBoolean(100)));
}

void testNegativeLimit() {
    assert(sieveOfEratosthenes(-5).empty());
    assert(sieveBoolean(-5).empty());
    assert(sieveBoolean(-1).empty());
    assert(sieveBoolean(0).size() == 1);
}

void testMatchesTrialDivision() {
    std::vector<bool> sieve = sieveBoolean(20000);
    int count = 0;
    for (int n = 0; n <= 20000; n++) {
        bool prime = n >= 2;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) { prime = false; break; }
        }
        assert(sieve[n] == prime);
        if (prime) count++;
    }
    assert(count == 2262);
    assert(sieveOfEratosthenes(100000).size() == 9592);
}

// Sieves 2^31 numbers: about 17 s at -O2 and 256 MB. Build with
// -DSKIP_SLOW_TESTS to leave it out (for example under sanitizers).
#ifndef SKIP_SLOW_TESTS
void testLimitNearIntMax() {
    // 2^31 - 1 is prime. With 32-bit loop counters i * i overflowed here.
    std::vector<bool> sieve = sieveBoolean(INT_MAX);
    assert(sieve.size() == static_cast<size_t>(INT_MAX) + 1);
    assert(isPrimeSieve(INT_MAX, sieve));
    assert(!isPrimeSieve(INT_MAX - 1, sieve));
    assert(isPrimeSieve(INT_MAX - 18, sieve));  // 2147483629 is the previous prime
    assert(!isPrimeSieve(INT_MAX - 20, sieve)); // 2147483627 is divisible by 47
}
#endif

int main() {
    testSieveSmall();
    testSieveMedium();
    testSieveCount();
    testSieveEmpty();
    testSieveBoolean();
    testIsPrimeSieve();
    testNegativeIndexIsNotPrime();
    testBeyondTheSieveIsFalse();
    testNegativeLimit();
    testMatchesTrialDivision();
#ifndef SKIP_SLOW_TESTS
    testLimitNearIntMax();
#endif
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

