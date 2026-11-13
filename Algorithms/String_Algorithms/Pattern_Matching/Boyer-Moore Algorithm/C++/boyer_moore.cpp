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

// Last index of c in the pattern, or -1 when c does not occur in it. Uses
// find(): operator[] would insert an absent c with index 0, which shrinks the
// shift after a match from m + 1 to m and pollutes the table for later lookups.
int lastOccurrence(const std::unordered_map<char, int>& table, char c) {
    auto it = table.find(c);
    return it == table.end() ? -1 : it->second;
}

std::vector<int> boyerMooreSearch(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    if (pattern.empty() || text.empty() || pattern.length() > text.length()) {
        return result;
    }
    
    int n = text.length();
    int m = pattern.length();
    const auto badChar = buildBadCharTable(pattern);
    int s = 0;
    
    while (s <= n - m) {
        int j = m - 1;
        while (j >= 0 && pattern[j] == text[s + j]) {
            j--;
        }
        if (j < 0) {
            result.push_back(s);
            s += (s + m < n) ? (m - lastOccurrence(badChar, text[s + m])) : 1;
        } else {
            int badCharShift = j - lastOccurrence(badChar, text[s + j]);
            s += std::max(1, badCharShift);
        }
    }
    return result;
}

