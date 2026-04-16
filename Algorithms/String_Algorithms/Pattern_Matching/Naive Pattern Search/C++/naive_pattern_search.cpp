/**
 * Naive Pattern Search Implementation (C++)
 * 
 * Naive pattern search is the simplest string matching algorithm that checks
 * all positions in the text to see if the pattern matches.
 */

#include <vector>
#include <string>

std::vector<int> naivePatternSearch(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    
    if (pattern.empty()) {
        return result;
    }
    
    if (text.empty() || pattern.length() > text.length()) {
        return result;
    }
    
    int n = text.length();
    int m = pattern.length();
    
    // Check each possible starting position
    for (int i = 0; i <= n - m; i++) {
        // Check if pattern matches at position i
        int j = 0;
        while (j < m && text[i + j] == pattern[j]) {
            j++;
        }
        
        // If we matched the entire pattern
        if (j == m) {
            result.push_back(i);
        }
    }
    
    return result;
}

int naivePatternSearchCount(const std::string& text, const std::string& pattern) {
    return naivePatternSearch(text, pattern).size();
}

int naivePatternSearchFirst(const std::string& text, const std::string& pattern) {
    std::vector<int> occurrences = naivePatternSearch(text, pattern);
    return occurrences.empty() ? -1 : occurrences[0];
}

// Example usage (uncomment to use)
/*
#include <iostream>
#ifndef TESTING
int main() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    
    std::cout << "Naive Pattern Search Example:" << std::endl;
    std::cout << "Text: " << text << std::endl;
    std::cout << "Pattern: " << pattern << std::endl;
    
    std::vector<int> occurrences = naivePatternSearch(text, pattern);
    std::cout << "Occurrences at indices: ";
    for (int idx : occurrences) {
        std::cout << idx << " ";
    }
    std::cout << std::endl;
    
    int count = naivePatternSearchCount(text, pattern);
    std::cout << "Total occurrences: " << count << std::endl;
    
    int first = naivePatternSearchFirst(text, pattern);
    std::cout << "First occurrence at index: " << first << std::endl;
    
    return 0;
}
#endif
*/

