/**
 * Test cases for Huffman Coding (C++)
 */

#include <iostream>
#include <string>
#include <cassert>
#include "huffman_coding.cpp"

void testBasicEncode() {
    std::string text = "hello";
    auto codes = huffmanEncode(text);
    // Basic test - just check it doesn't crash
    std::cout << "✓ Basic encode test passed" << std::endl;
}

int main() {
    std::cout << "Running Huffman Coding tests..." << std::endl;
    testBasicEncode();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

