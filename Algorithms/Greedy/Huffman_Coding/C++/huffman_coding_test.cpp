/**
 * Test cases for Huffman Coding (C++)
 */

#include <algorithm>
#include <cassert>
#include <cmath>
#include <iostream>
#include <map>
#include <random>
#include <string>
#include <vector>
#include "huffman_coding.cpp"

using Codes = std::map<char, std::string>;

// Sum of the internal node frequencies: the cost of the tree in bits.
long long internalSum(const HuffmanNode* node) {
    if (!node || node->isLeaf()) {
        return 0;
    }
    return node->freq + internalSum(node->left.get()) + internalSum(node->right.get());
}

bool isPrefixFree(const Codes& codes) {
    for (const auto& a : codes) {
        for (const auto& b : codes) {
            if (a.first != b.first && b.second.compare(0, a.second.size(), a.second) == 0) {
                return false;
            }
        }
    }
    return true;
}

void testSimpleEncodeDecode() {
    auto [encoded, codes, tree] = huffmanEncode("hello");
    assert(huffmanDecode(encoded, tree.get()) == "hello");
    std::cout << "[PASS] Simple encode decode test passed" << std::endl;
}

void testSingleCharacter() {
    auto [encoded, codes, tree] = huffmanEncode("aaaa");
    assert(huffmanDecode(encoded, tree.get()) == "aaaa");
    std::cout << "[PASS] Single character test passed" << std::endl;
}

void testEmptyString() {
    auto [encoded, codes, tree] = huffmanEncode("");
    assert(encoded.empty());
    assert(codes.empty());
    assert(tree == nullptr);
    assert(buildHuffmanTree("") == nullptr);
    std::cout << "[PASS] Empty string test passed" << std::endl;
}

void testRepeatedCharacters() {
    auto [encoded, codes, tree] = huffmanEncode("aaaabbbb");
    assert(huffmanDecode(encoded, tree.get()) == "aaaabbbb");
    std::cout << "[PASS] Repeated characters test passed" << std::endl;
}

void testAllDifferent() {
    auto [encoded, codes, tree] = huffmanEncode("abcdef");
    assert(huffmanDecode(encoded, tree.get()) == "abcdef");
    std::cout << "[PASS] All different test passed" << std::endl;
}

void testCompressionRatio() {
    const std::string text = "aaaaabbbcc";
    auto [encoded, codes, tree] = huffmanEncode(text);
    auto [ratio, savings] = calculateCompressionRatio(text, encoded, codes);
    // Frequencies 5, 3, 2 give an optimal cost of 5 + 10 = 15 bits, out of 80.
    assert(encoded.size() == 15);
    assert(std::fabs(ratio - 15.0 / 80) < 1e-12);
    assert(std::fabs(savings - (1 - 15.0 / 80) * 100) < 1e-9);
    std::cout << "[PASS] Compression ratio test passed" << std::endl;
}

void testKnownCodeTable() {
    // Frequencies 45, 13, 12, 16, 9, 5 have no ties, so the tree is unique.
    const std::string text = std::string(45, 'a') + std::string(13, 'b') + std::string(12, 'c') +
                             std::string(16, 'd') + std::string(9, 'e') + std::string(5, 'f');
    auto [encoded, codes, tree] = huffmanEncode(text);
    assert((codes == Codes{{'a', "0"}, {'c', "100"}, {'b', "101"}, {'f', "1100"}, {'e', "1101"}, {'d', "111"}}));
    assert(encoded.size() == 224);
    assert(huffmanDecode(encoded, tree.get()) == text);
    std::cout << "[PASS] Known code table test passed" << std::endl;
}

void testSingleSymbolGetsCodeZero() {
    // One distinct symbol: its code is "0", one bit per character.
    auto [encoded, codes, tree] = huffmanEncode("aaaa");
    assert((codes == Codes{{'a', "0"}}));
    assert(encoded == "0000");
    std::cout << "[PASS] Single symbol gets code zero test passed" << std::endl;
}

void testCodesArePrefixFreeAndOptimal() {
    // No code is a prefix of another; the length equals the sum of the internal
    // node frequencies. The last text is UTF-8: its symbols are bytes.
    for (const std::string text : {"hello", "abracadabra", "mississippi", "abcdefghabcdefghabcdefgh",
                                   "h\xc3\xa9llo w\xc3\xb6rld"}) {
        auto [encoded, codes, tree] = huffmanEncode(text);
        assert(isPrefixFree(codes));
        if (codes.size() > 1) {
            assert(static_cast<long long>(encoded.size()) == internalSum(tree.get()));
        }
        assert(huffmanDecode(encoded, tree.get()) == text);
    }
    std::cout << "[PASS] Codes are prefix-free and optimal test passed" << std::endl;
}

void testDecodeEmptyInputs() {
    assert(huffmanDecode("0101", nullptr).empty());
    auto [encoded, codes, tree] = huffmanEncode("ab");
    assert(huffmanDecode("", tree.get()).empty());
    std::cout << "[PASS] Decode empty inputs test passed" << std::endl;
}

void testAgreesWithPython() {
    // Code tables and encodings printed by the Python huffman_encode. Tied
    // frequencies are resolved by the heap order, which these pin down: in
    // "aabbccdd" a and c are merged first, so b gets 10 and c gets 01.
    struct Case {
        std::string text;
        Codes codes;
        std::string encoded;
    };
    const std::vector<Case> cases = {
        {"aabbccdd", {{'a', "00"}, {'b', "10"}, {'c', "01"}, {'d', "11"}}, "0000101001011111"},
        {"abracadabra", {{'a', "0"}, {'b', "111"}, {'c', "100"}, {'d', "101"}, {'r', "110"}},
         "01111100100010101111100"},
        {"hello", {{'e', "01"}, {'h', "00"}, {'l', "11"}, {'o', "10"}}, "0001111110"},
        {"mississippi", {{'i', "0"}, {'m', "100"}, {'p', "101"}, {'s', "11"}}, "100011110111101011010"},
        {"abcdefghabcdefghabcdefgh",
         {{'a', "000"}, {'b', "011"}, {'c', "001"}, {'d', "111"}, {'e', "110"}, {'f', "101"}, {'g', "100"},
          {'h', "010"}},
         "000011001111110101100010000011001111110101100010000011001111110101100010"},
        {"aaaabbbb", {{'a', "0"}, {'b', "1"}}, "00001111"},
        {"aaaaabbbcc", {{'a', "0"}, {'b', "11"}, {'c', "10"}}, "000001111111010"},
        {"the quick brown fox jumps over the lazy dog",
         {{' ', "00"}, {'a', "111011"}, {'b', "01101"}, {'c', "01100"}, {'d', "110000"}, {'e', "1010"},
          {'f', "101111"}, {'g', "110100"}, {'h', "11100"}, {'i', "10011"}, {'j', "101101"}, {'k', "110011"},
          {'l', "111110"}, {'m', "01110"}, {'n', "101110"}, {'o', "010"}, {'p', "01111"}, {'q', "10010"},
          {'r', "11011"}, {'s', "111111"}, {'t', "11110"}, {'u', "1000"}, {'v', "110010"}, {'w', "110101"},
          {'x', "101100"}, {'y', "110001"}, {'z', "111010"}},
         "111101110010100010010100010011011001100110001101110110101101011011100010111101010110000101101100"
         "001110011111111110001011001010101101100111101110010100011111011101111101011000100110000010110100"},
        {"aaaa", {{'a', "0"}}, "0000"},
        {"ab", {{'a', "0"}, {'b', "1"}}, "01"},
        {"", {}, ""},
    };
    for (const Case& c : cases) {
        auto [encoded, codes, tree] = huffmanEncode(c.text);
        assert(codes == c.codes);
        assert(encoded == c.encoded);
        assert(huffmanDecode(encoded, tree.get()) == c.text);
    }

    auto [abraRatio, abraSavings] = calculateCompressionRatio("abracadabra", cases[1].encoded, cases[1].codes);
    assert(abraRatio == 0.26136363636363635);
    assert(abraSavings == 73.86363636363636);
    auto [emptyRatio, emptySavings] = calculateCompressionRatio("", "", {});
    assert(emptyRatio == 0 && emptySavings == 100);
    std::cout << "[PASS] Agrees with Python test passed" << std::endl;
}

// Cheapest total cost over every order of merging two nodes: the optimum
// over all code trees, found without a heap.
long long bruteForceCost(std::vector<long long> weights) {
    if (weights.size() < 2) {
        return 0;
    }
    long long best = -1;
    for (std::size_t i = 0; i < weights.size(); ++i) {
        for (std::size_t j = i + 1; j < weights.size(); ++j) {
            std::vector<long long> rest;
            for (std::size_t m = 0; m < weights.size(); ++m) {
                if (m != i && m != j) {
                    rest.push_back(weights[m]);
                }
            }
            rest.push_back(weights[i] + weights[j]);
            const long long cost = weights[i] + weights[j] + bruteForceCost(rest);
            if (best < 0 || cost < best) {
                best = cost;
            }
        }
    }
    return best;
}

void testMatchesBruteForceOptimum() {
    std::mt19937 rng(20261115);
    for (int trial = 0; trial < 300; ++trial) {
        const std::size_t alphabet = 1 + rng() % 6;
        const std::size_t length = 1 + rng() % 40;
        std::string text;
        std::map<char, long long> freq;
        for (std::size_t i = 0; i < length; ++i) {
            const char c = static_cast<char>('a' + rng() % alphabet);
            text += c;
            ++freq[c];
        }
        std::vector<long long> weights;
        for (const auto& entry : freq) {
            weights.push_back(entry.second);
        }

        auto [encoded, codes, tree] = huffmanEncode(text);
        assert(isPrefixFree(codes));
        assert(huffmanDecode(encoded, tree.get()) == text);
        const long long optimum = weights.size() == 1 ? static_cast<long long>(length) : bruteForceCost(weights);
        assert(static_cast<long long>(encoded.size()) == optimum);
    }
    std::cout << "[PASS] Matches brute force optimum test passed" << std::endl;
}

int main() {
    std::cout << "Running Huffman Coding tests..." << std::endl;
    testSimpleEncodeDecode();
    testSingleCharacter();
    testEmptyString();
    testRepeatedCharacters();
    testAllDifferent();
    testCompressionRatio();
    testKnownCodeTable();
    testSingleSymbolGetsCodeZero();
    testCodesArePrefixFreeAndOptimal();
    testDecodeEmptyInputs();
    testAgreesWithPython();
    testMatchesBruteForceOptimum();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
