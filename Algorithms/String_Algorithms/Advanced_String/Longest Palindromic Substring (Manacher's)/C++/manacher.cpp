/**
 * Manacher's Algorithm Implementation (C++)
 */
#include <string>
#include <vector>
#include <algorithm>

std::string manacher(const std::string& s) {
    if (s.empty()) return "";
    
    std::string transformed = "^#";
    for (char c : s) {
        transformed += c;
        transformed += '#';
    }
    transformed += '$';
    
    int n = transformed.length();
    std::vector<int> p(n, 0);
    int center = 0, right = 0;
    
    for (int i = 1; i < n - 1; i++) {
        int mirror = 2 * center - i;
        if (i < right) {
            p[i] = std::min(right - i, p[mirror]);
        }
        
        while (transformed[i + p[i] + 1] == transformed[i - p[i] - 1]) {
            p[i]++;
        }
        
        if (i + p[i] > right) {
            center = i;
            right = i + p[i];
        }
    }
    
    int maxLen = 0, centerIndex = 0;
    for (int i = 1; i < n - 1; i++) {
        if (p[i] > maxLen) {
            maxLen = p[i];
            centerIndex = i;
        }
    }
    
    int start = (centerIndex - maxLen) / 2;
    return s.substr(start, maxLen);
}

