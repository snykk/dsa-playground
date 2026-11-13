/**
 * Rabin-Karp Algorithm Implementation (C++)
 */

#include <vector>
#include <string>

const int BASE = 256;
const int MOD = 101;

// Hash bytes as unsigned values 0..255. char is signed on common platforms, so a
// byte >= 0x80 would make the initial hashes negative while the rolled hash is
// normalized into [0, MOD): equal windows would then get different hashes.
inline int byteValue(char c) {
    return static_cast<unsigned char>(c);
}

std::vector<int> rabinKarpSearch(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    
    if (pattern.empty()) {
        return result;
    }
    
    if (text.empty() || pattern.length() > text.length()) {
        return result;
    }
    
    int n = text.length();
    int m = pattern.length();
    
    int patternHash = 0;
    int textHash = 0;
    int h = 1;
    
    // Calculate h = base^(m-1) % mod
    for (int i = 0; i < m - 1; i++) {
        h = (h * BASE) % MOD;
    }
    
    // Calculate initial hash values
    for (int i = 0; i < m; i++) {
        patternHash = (BASE * patternHash + byteValue(pattern[i])) % MOD;
        textHash = (BASE * textHash + byteValue(text[i])) % MOD;
    }
    
    // Slide the pattern over text
    for (int i = 0; i <= n - m; i++) {
        if (patternHash == textHash) {
            bool match = true;
            for (int j = 0; j < m; j++) {
                if (text[i + j] != pattern[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                result.push_back(i);
            }
        }
        
        // Calculate hash for next window
        if (i < n - m) {
            textHash = (BASE * (textHash - byteValue(text[i]) * h) + byteValue(text[i + m])) % MOD;
            if (textHash < 0) {
                textHash += MOD;
            }
        }
    }
    
    return result;
}

// Example usage (uncomment to use)
/*
#include <iostream>
#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    std::vector<int> occurrences = rabinKarpSearch(text, pattern);
    for (int idx : occurrences) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;
    return 0;
}
#endif
#endif
*/
