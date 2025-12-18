/**
 * Boyer-Moore Algorithm Implementation (C++)
 */
#include <vector>
#include <string>
#include <unordered_map>

std::unordered_map<char, int> buildBadCharTable(const std::string& pattern) {
    std::unordered_map<char, int> table;
    for (size_t i = 0; i < pattern.length(); i++) {
        table[pattern[i]] = i;
    }
    return table;
}

std::vector<int> boyerMooreSearch(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    if (pattern.empty() || text.empty() || pattern.length() > text.length()) {
        return result;
    }
    
    int n = text.length();
    int m = pattern.length();
    auto badChar = buildBadCharTable(pattern);
    int s = 0;
    
    while (s <= n - m) {
        int j = m - 1;
        while (j >= 0 && pattern[j] == text[s + j]) {
            j--;
        }
        if (j < 0) {
            result.push_back(s);
            s += (s + m < n) ? (m - badChar[text[s + m]]) : 1;
        } else {
            int badCharShift = j - (badChar.count(text[s + j]) ? badChar[text[s + j]] : -1);
            s += std::max(1, badCharShift);
        }
    }
    return result;
}

