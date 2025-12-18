/**
 * Rabin-Karp Algorithm Implementation (C++)
 */

#include <vector>
#include <string>

const int BASE = 256;
const int MOD = 101;

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
        patternHash = (BASE * patternHash + pattern[i]) % MOD;
        textHash = (BASE * textHash + text[i]) % MOD;
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
            textHash = (BASE * (textHash - text[i] * h) + text[i + m]) % MOD;
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
*/

