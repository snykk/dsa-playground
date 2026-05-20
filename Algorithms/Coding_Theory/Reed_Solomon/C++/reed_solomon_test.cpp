#include "reed_solomon.h"

#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <random>
#include <vector>

using namespace reed_solomon;

void testEncodeLength() {
    ReedSolomon rs(15, 11);
    std::vector<uint8_t> msg(11);
    for (int i = 0; i < 11; ++i) msg[i] = static_cast<uint8_t>(i);
    auto cw = rs.encode(msg);
    assert(cw.size() == 15);
}

void testSystematicLayout() {
    ReedSolomon rs(15, 11);
    std::vector<uint8_t> msg(11);
    for (int i = 0; i < 11; ++i) msg[i] = static_cast<uint8_t>(i + 1);
    auto cw = rs.encode(msg);
    for (int i = 0; i < 11; ++i) {
        assert(cw[i + 4] == msg[i]);  // last k bytes equal message
    }
}

void testRoundTripNoErrors() {
    ReedSolomon rs(15, 11);
    std::mt19937 rng(42);
    for (int trial = 0; trial < 10; ++trial) {
        std::vector<uint8_t> msg(11);
        for (auto& b : msg) b = static_cast<uint8_t>(rng() & 0xFF);
        auto cw = rs.encode(msg);
        auto recovered = rs.decode(cw);
        assert(recovered == msg);
    }
}

void testOneError() {
    ReedSolomon rs(15, 11);
    std::vector<uint8_t> msg(11);
    for (int i = 0; i < 11; ++i) msg[i] = static_cast<uint8_t>(i);
    auto cw = rs.encode(msg);
    for (int pos = 0; pos < 15; ++pos) {
        auto corrupted = cw;
        corrupted[pos] ^= 0xAA;
        auto recovered = rs.decode(corrupted);
        assert(recovered == msg);
    }
}

void testTwoErrors() {
    ReedSolomon rs(15, 11);
    std::vector<uint8_t> msg(11);
    for (int i = 0; i < 11; ++i) msg[i] = static_cast<uint8_t>(i);
    auto cw = rs.encode(msg);
    std::mt19937 rng(42);
    for (int trial = 0; trial < 20; ++trial) {
        std::vector<int> positions(15);
        for (int i = 0; i < 15; ++i) positions[i] = i;
        std::shuffle(positions.begin(), positions.end(), rng);
        auto corrupted = cw;
        for (int i = 0; i < 2; ++i) {
            uint8_t flip = 1 + (rng() % 255);
            corrupted[positions[i]] ^= flip;
        }
        auto recovered = rs.decode(corrupted);
        assert(recovered == msg);
    }
}

void testVoyagerRS255_223() {
    // The Voyager 2 outer code: tolerates 16 byte errors.
    ReedSolomon rs(255, 223);
    std::mt19937 rng(123);
    std::vector<uint8_t> msg(223);
    for (auto& b : msg) b = static_cast<uint8_t>(rng() & 0xFF);
    auto cw = rs.encode(msg);
    std::vector<int> positions(255);
    for (int i = 0; i < 255; ++i) positions[i] = i;
    std::shuffle(positions.begin(), positions.end(), rng);
    auto corrupted = cw;
    for (int i = 0; i < 16; ++i) {
        corrupted[positions[i]] ^= static_cast<uint8_t>(1 + (rng() % 255));
    }
    auto recovered = rs.decode(corrupted);
    assert(recovered == msg);
}

void testTooManyErrorsDetected() {
    ReedSolomon rs(15, 11);   // t = 2
    std::vector<uint8_t> msg(11);
    for (int i = 0; i < 11; ++i) msg[i] = static_cast<uint8_t>(i);
    auto cw = rs.encode(msg);
    std::mt19937 rng(7);
    auto corrupted = cw;
    // Inject 3 errors at distinct positions.
    corrupted[1] ^= 0x11;
    corrupted[5] ^= 0x22;
    corrupted[10] ^= 0x33;
    bool threw = false;
    try { rs.decode(corrupted); } catch (const DecodeError&) { threw = true; }
    assert(threw);
}

void testInvalidParams() {
    bool threw = false;
    try { ReedSolomon rs(10, 10); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    threw = false;
    try { ReedSolomon rs(5, 10); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    threw = false;
    try { ReedSolomon rs(300, 200); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
}

void testWrongMessageLength() {
    ReedSolomon rs(15, 11);
    std::vector<uint8_t> wrong(3);
    bool threw = false;
    try { rs.encode(wrong); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
}

int main() {
    testEncodeLength();
    testSystematicLayout();
    testRoundTripNoErrors();
    testOneError();
    testTwoErrors();
    testVoyagerRS255_223();
    testTooManyErrorsDetected();
    testInvalidParams();
    testWrongMessageLength();
    std::cout << "All 9 tests passed!" << std::endl;
    return 0;
}
