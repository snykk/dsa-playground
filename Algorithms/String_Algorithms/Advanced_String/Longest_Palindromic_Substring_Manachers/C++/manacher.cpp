/**
 * Manacher's Algorithm Implementation (C++)
 */
#include <string>
#include <vector>
#include <algorithm>

std::string manacher(const std::string& s) {
    if (s.empty()) return "";
    
    // "abc" -> "#a#b#c#". No sentinel characters: the expansion is bounds-checked,
    // so any byte (including '^' and '$') is safe in s.
    std::string transformed = "#";
    for (char c : s) {
        transformed += c;
        transformed += '#';
    }
    
    int n = transformed.length();
    std::vector<int> p(n, 0);
    int center = 0, right = 0;
    
    for (int i = 0; i < n; i++) {
        int mirror = 2 * center - i;
        if (i < right) {
            p[i] = std::min(right - i, p[mirror]);
        }
        
        while (i - p[i] - 1 >= 0 && i + p[i] + 1 < n &&
               transformed[i + p[i] + 1] == transformed[i - p[i] - 1]) {
            p[i]++;
        }
        
        if (i + p[i] > right) {
            center = i;
            right = i + p[i];
        }
    }
    
    int maxLen = 0, centerIndex = 0;
    for (int i = 0; i < n; i++) {
        if (p[i] > maxLen) {
            maxLen = p[i];
            centerIndex = i;
        }
    }
    
    int start = (centerIndex - maxLen) / 2;
    return s.substr(start, maxLen);
}

