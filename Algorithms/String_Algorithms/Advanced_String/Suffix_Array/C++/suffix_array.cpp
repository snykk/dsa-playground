/**
 * Suffix Array Implementation (C++)
 */
#include <vector>
#include <string>
#include <algorithm>

std::vector<int> buildSuffixArray(const std::string& s) {
    int n = s.length();
    std::vector<std::pair<std::string, int>> suffixes;
    for (int i = 0; i < n; i++) {
        suffixes.push_back({s.substr(i), i});
    }
    std::sort(suffixes.begin(), suffixes.end());
    
    std::vector<int> result;
    for (const auto& p : suffixes) {
        result.push_back(p.second);
    }
    return result;
}

std::vector<int> searchPattern(const std::vector<int>& suffixArray, 
                               const std::string& text, 
                               const std::string& pattern) {
    std::vector<int> result;
    int n = text.length();
    int m = pattern.length();
    
    int left = 0, right = n - 1;
    int first = -1;
    
    while (left <= right) {
        int mid = (left + right) / 2;
        int idx = suffixArray[mid];
        
        if (text.compare(idx, m, pattern) == 0) {
            first = mid;
            right = mid - 1;
        } else if (text.compare(idx, m, pattern) < 0) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    if (first == -1) return result;
    
    left = first;
    right = n - 1;
    int last = first;
    
    while (left <= right) {
        int mid = (left + right) / 2;
        int idx = suffixArray[mid];
        
        if (text.compare(idx, m, pattern) == 0) {
            last = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    for (int i = first; i <= last; i++) {
        result.push_back(suffixArray[i]);
    }
    std::sort(result.begin(), result.end());
    return result;
}


std::vector<std::string> getSuffixes(const std::vector<int>& suffixArray,
                                     const std::string& text) {
    std::vector<std::string> result;
    for (int idx : suffixArray) {
        result.push_back(text.substr(idx));
    }
    return result;
}

int longestCommonPrefix(const std::string& text, int i, int j) {
    int n = text.length();
    int k = 0;
    while (i + k < n && j + k < n && text[i + k] == text[j + k]) {
        k++;
    }
    return k;
}

// Data-structure view: keeps the text and its suffix array together.
class SuffixArray {
public:
    std::string text;
    std::vector<int> suffixArray;

    explicit SuffixArray(const std::string& s)
        : text(s), suffixArray(buildSuffixArray(s)) {}

    std::vector<int> search(const std::string& pattern) const {
        return searchPattern(suffixArray, text, pattern);
    }

    std::vector<std::string> getSuffixes() const {
        return ::getSuffixes(suffixArray, text);
    }

    int longestCommonPrefix(int i, int j) const {
        return ::longestCommonPrefix(text, i, j);
    }
};
