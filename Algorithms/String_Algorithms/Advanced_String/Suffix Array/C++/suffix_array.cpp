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
        std::string suffix = text.substr(idx);
        
        if (suffix.substr(0, m) == pattern) {
            first = mid;
            right = mid - 1;
        } else if (suffix < pattern) {
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
        std::string suffix = text.substr(idx);
        
        if (suffix.substr(0, m) == pattern) {
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

