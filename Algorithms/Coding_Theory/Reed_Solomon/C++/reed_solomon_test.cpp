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

// Shared cross-language fixture (same bytes in the Python and Go tests and in
// the topic README's step-by-step trace).
void testKnownCodewordRS7_5() {
    ReedSolomon rs(7, 5);
    std::vector<uint8_t> cw = rs.encode({2, 3, 5, 7, 11});
    assert((cw == std::vector<uint8_t>{87, 95, 2, 3, 5, 7, 11}));
}

static std::vector<uint8_t> rangeBytes(int count, int start = 0) {
    std::vector<uint8_t> v(count);
    for (int i = 0; i < count; ++i) v[i] = static_cast<uint8_t>(start + i);
    return v;
}

void testErasuresOnlyUseFullParityBudget() {
    // n - k = 4 parity bytes: 4 known-bad positions are recoverable, twice
    // the t = 2 limit for errors at unknown positions.
    ReedSolomon rs(15, 11);
    auto msg = rangeBytes(11);
    auto corrupted = rs.encode(msg);
    std::vector<int> erasures = {0, 5, 9, 14};
    for (int p : erasures) corrupted[p] = 0;
    assert(rs.decode(corrupted, erasures) == msg);
}

void testSameDamageNeedsErasureInfo() {
    // RS(7, 5) has t = 1: two wrong bytes are fixable only if their positions are known.
    ReedSolomon rs(7, 5);
    std::vector<uint8_t> msg = {2, 3, 5, 7, 11};
    auto corrupted = rs.encode(msg);
    corrupted[2] = 0;
    corrupted[5] = 0;
    bool threw = false;
    try { rs.decode(corrupted); } catch (const DecodeError&) { threw = true; }
    assert(threw);
    assert(rs.decode(corrupted, {2, 5}) == msg);
}

void testMixedErasuresAndErrors() {
    // RS(15, 7): 8 parity bytes, budget e + 2v <= 8 -> 4 erasures + 2 errors.
    ReedSolomon rs(15, 7);
    std::vector<uint8_t> msg = {'A', 'B', 'C', 'D', 'E', 'F', 'G'};
    auto corrupted = rs.encode(msg);
    std::vector<int> erasures = {0, 1, 2, 3};
    for (int p : erasures) corrupted[p] = 0xFF;
    corrupted[7] ^= 0xAA;
    corrupted[11] ^= 0x55;
    assert(rs.decode(corrupted, erasures) == msg);
}

void testRandomErrorsAndErasuresWithinBudget() {
    std::mt19937 rng(2024);
    const int codes[][2] = {{15, 7}, {26, 16}, {255, 223}};
    for (const auto& code : codes) {
        const int n = code[0], k = code[1];
        ReedSolomon rs(n, k);
        for (int trial = 0; trial < 30; ++trial) {
            std::vector<uint8_t> msg(k);
            for (auto& b : msg) b = static_cast<uint8_t>(rng() & 0xFF);
            auto corrupted = rs.encode(msg);
            int e = static_cast<int>(rng() % (n - k + 1));
            int v = static_cast<int>(rng() % ((n - k - e) / 2 + 1));
            std::vector<int> positions(n);
            for (int i = 0; i < n; ++i) positions[i] = i;
            std::shuffle(positions.begin(), positions.end(), rng);
            std::vector<int> erasures(positions.begin(), positions.begin() + e);
            for (int p : erasures) corrupted[p] = static_cast<uint8_t>(rng() & 0xFF);
            for (int i = e; i < e + v; ++i) {
                corrupted[positions[i]] ^= static_cast<uint8_t>(1 + rng() % 255);
            }
            assert(rs.decode(corrupted, erasures) == msg);
        }
    }
}

void testErasedButIntactBytesAreFine() {
    // Flagging a position that happens to be correct costs budget but is safe.
    ReedSolomon rs(15, 11);
    auto msg = rangeBytes(11);
    assert(rs.decode(rs.encode(msg), {1, 4}) == msg);
}

void testDuplicateErasuresAreDeduplicated() {
    ReedSolomon rs(15, 11);
    auto msg = rangeBytes(11);
    auto corrupted = rs.encode(msg);
    corrupted[6] ^= 0x10;
    assert(rs.decode(corrupted, {6, 6, 6}) == msg);
}

void testErasurePositionOutOfRange() {
    ReedSolomon rs(15, 11);
    auto cw = rs.encode(rangeBytes(11));
    for (int bad : {15, -1}) {
        bool threw = false;
        try { rs.decode(cw, {bad}); } catch (const std::invalid_argument&) { threw = true; }
        assert(threw);
    }
}

void testTooManyErasures() {
    ReedSolomon rs(15, 11);
    auto cw = rs.encode(rangeBytes(11));
    bool threw = false;
    try { rs.decode(cw, {0, 1, 2, 3, 4}); } catch (const DecodeError&) { threw = true; }
    assert(threw);
}

void testBeyondBudgetWithErasuresDetected() {
    // RS(15, 7): 4 erasures + 3 errors costs 4 + 2*3 = 10 > 8 parity bytes.
    ReedSolomon rs(15, 7);
    auto corrupted = rs.encode(rangeBytes(7));
    std::vector<int> erasures = {0, 1, 2, 3};
    for (int p : erasures) corrupted[p] ^= 0x5A;
    for (int p : {6, 9, 12}) corrupted[p] ^= 0xC3;
    bool threw = false;
    try { rs.decode(corrupted, erasures); } catch (const DecodeError&) { threw = true; }
    assert(threw);
}

void testCodewordVanishesAtGeneratorRoots() {
    // Every codeword is a multiple of g(x), so it is zero at each root alpha^(fcr+i).
    const auto& gf = gf256::shared();
    for (int fcr : {0, 1, 5, 112}) {
        ReedSolomon rs(15, 9, 3, fcr);
        auto cw = rs.encode(rangeBytes(9, 1));
        for (int i = 0; i < rs.n() - rs.k(); ++i) {
            assert(gf.polyEval(cw, gf.pow(rs.alpha(), fcr + i)) == 0);
        }
    }
}

void testRoundTripWithErrorsAndErasuresForEachFcr() {
    std::mt19937 rng(77);
    for (int fcr : {0, 1, 2, 112, 200}) {
        ReedSolomon rs(26, 16, 3, fcr);
        for (int trial = 0; trial < 20; ++trial) {
            std::vector<uint8_t> msg(16);
            for (auto& b : msg) b = static_cast<uint8_t>(rng() & 0xFF);
            auto corrupted = rs.encode(msg);
            int e = static_cast<int>(rng() % 11);
            int v = static_cast<int>(rng() % ((10 - e) / 2 + 1));
            std::vector<int> positions(26);
            for (int i = 0; i < 26; ++i) positions[i] = i;
            std::shuffle(positions.begin(), positions.end(), rng);
            for (int i = 0; i < e + v; ++i) {
                corrupted[positions[i]] ^= static_cast<uint8_t>(1 + rng() % 255);
            }
            std::vector<int> erasures(positions.begin(), positions.begin() + e);
            assert(rs.decode(corrupted, erasures) == msg);
        }
    }
}

void testEncoderAndDecoderMustAgreeOnFcr() {
    // A clean fcr=1 codeword is NOT a codeword of the fcr=0 code.
    auto cw = ReedSolomon(15, 11, 3, 1).encode(rangeBytes(11));
    bool threw = false;
    try { ReedSolomon(15, 11, 3, 0).decode(cw); } catch (const DecodeError&) { threw = true; }
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
    testKnownCodewordRS7_5();
    testErasuresOnlyUseFullParityBudget();
    testSameDamageNeedsErasureInfo();
    testMixedErasuresAndErrors();
    testRandomErrorsAndErasuresWithinBudget();
    testErasedButIntactBytesAreFine();
    testDuplicateErasuresAreDeduplicated();
    testErasurePositionOutOfRange();
    testTooManyErasures();
    testBeyondBudgetWithErasuresDetected();
    testCodewordVanishesAtGeneratorRoots();
    testRoundTripWithErrorsAndErasuresForEachFcr();
    testEncoderAndDecoderMustAgreeOnFcr();
    std::cout << "All 22 tests passed!" << std::endl;
    return 0;
}
