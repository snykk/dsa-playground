#include "galois_field.h"

#include <cassert>
#include <iostream>

using namespace gf256;

void testAddIsXor() {
    const auto& gf = shared();
    assert(gf.add(0x53, 0xCA) == (0x53 ^ 0xCA));
    for (int a = 0; a < 256; ++a) {
        assert(gf.add(a, 0) == a);
        assert(gf.add(a, a) == 0);
    }
}

void testMulByZeroAndOne() {
    const auto& gf = shared();
    for (int a = 0; a < 256; ++a) {
        assert(gf.mul(a, 0) == 0);
        assert(gf.mul(0, a) == 0);
        assert(gf.mul(a, 1) == a);
    }
}

void testAesKnownVector() {
    const auto& gf = shared();
    assert(gf.mul(0x53, 0xCA) == 0x01);
    assert(gf.inv(0x53) == 0xCA);
    assert(gf.inv(0xCA) == 0x53);
}

void testMulMatchesSlow() {
    const auto& gf = shared();
    int probes[] = {0, 1, 2, 17, 0x53, 0xCA, 0xFF};
    for (int a : probes) {
        for (int b : probes) {
            assert(gf.mul(a, b) == slowMultiply(a, b));
        }
    }
}

void testEveryNonzeroHasInverse() {
    const auto& gf = shared();
    for (int a = 1; a < 256; ++a) {
        assert(gf.mul(a, gf.inv(a)) == 1);
    }
}

void testInvZeroThrows() {
    const auto& gf = shared();
    bool threw = false;
    try { gf.inv(0); } catch (const std::domain_error&) { threw = true; }
    assert(threw);
}

void testFermatLittleAnalog() {
    const auto& gf = shared();
    for (int a = 1; a < 256; ++a) {
        assert(gf.pow(a, 255) == 1);
    }
}

void testDistributiveLaw() {
    const auto& gf = shared();
    int as[] = {1, 7, 0x53};
    int bs[] = {3, 0x80, 0xCA};
    int cs[] = {5, 0x10, 0xFF};
    for (int a : as) for (int b : bs) for (int c : cs) {
        int lhs = gf.mul(a, b ^ c);
        int rhs = gf.mul(a, b) ^ gf.mul(a, c);
        assert(lhs == rhs);
    }
}

void testPolynomialMul() {
    const auto& gf = shared();
    // (x + 1) * (x + 1) = x^2 + 1 in GF(2)[x] -- middle terms XOR-cancel.
    auto r = gf.polyMul({1, 1}, {1, 1});
    assert((r == std::vector<uint8_t>{1, 0, 1}));
}

void testPolynomialEvalHorner() {
    const auto& gf = shared();
    std::vector<uint8_t> p = {2, 3, 5};
    uint8_t x = 2;
    uint8_t expected = static_cast<uint8_t>(p[0] ^ gf.mul(p[1], x) ^ gf.mul(p[2], gf.mul(x, x)));
    assert(gf.polyEval(p, x) == expected);
}

int main() {
    testAddIsXor();
    testMulByZeroAndOne();
    testAesKnownVector();
    testMulMatchesSlow();
    testEveryNonzeroHasInverse();
    testInvZeroThrows();
    testFermatLittleAnalog();
    testDistributiveLaw();
    testPolynomialMul();
    testPolynomialEvalHorner();
    std::cout << "All 10 tests passed!" << std::endl;
    return 0;
}
