/**
 * KMP (Knuth-Morris-Pratt) Algorithm Implementation (C++)
 * 
 * KMP algorithm is an efficient string matching algorithm that uses preprocessing
 * to avoid rechecking characters that have already been matched.
 */

#include <vector>
#include <string>

std::vector<int> buildLPS(const std::string& pattern) {
    int m = pattern.length();
    std::vector<int> lps(m, 0);
    int length = 0;  // Length of previous longest prefix suffix
    int i = 1;
    
    while (i < m) {
        if (pattern[i] == pattern[length]) {
            length++;
            lps[i] = length;
            i++;
        } else {
            if (length != 0) {
                length = lps[length - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    
    return lps;
}

std::vector<int> kmpSearch(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    
    if (pattern.empty()) {
        return result;
    }
    
    if (text.empty() || pattern.length() > text.length()) {
        return result;
    }
    
    int n = text.length();
    int m = pattern.length();
    
    // Build LPS array
    std::vector<int> lps = buildLPS(pattern);
    
    int i = 0;  // Index for text
    int j = 0;  // Index for pattern
    
    while (i < n) {
        if (text[i] == pattern[j]) {
            i++;
            j++;
        }
        
        if (j == m) {
            result.push_back(i - j);
            j = lps[j - 1];
        } else if (i < n && text[i] != pattern[j]) {
            if (j != 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    
    return result;
}

int kmpSearchCount(const std::string& text, const std::string& pattern) {
    return kmpSearch(text, pattern).size();
}

int kmpSearchFirst(const std::string& text, const std::string& pattern) {
    std::vector<int> occurrences = kmpSearch(text, pattern);
    return occurrences.empty() ? -1 : occurrences[0];
}

// Example usage (uncomment to use)
/*
#include <iostream>
#ifndef TESTING
int main() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    
    std::cout << "KMP Algorithm Example:" << std::endl;
    std::vector<int> lps = buildLPS(pattern);
    std::cout << "LPS array: ";
    for (int val : lps) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    
    std::vector<int> occurrences = kmpSearch(text, pattern);
    std::cout << "Occurrences at indices: ";
    for (int idx : occurrences) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
#endif
*/

