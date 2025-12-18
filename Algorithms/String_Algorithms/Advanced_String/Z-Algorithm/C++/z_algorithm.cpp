/**
 * Z-Algorithm Implementation (C++)
 */
#include <vector>
#include <string>

std::vector<int> buildZArray(const std::string& s) {
    int n = s.length();
    std::vector<int> z(n, 0);
    int l = 0, r = 0;
    
    for (int i = 1; i < n; i++) {
        if (i <= r) {
            z[i] = std::min(r - i + 1, z[i - l]);
        }
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {
            z[i]++;
        }
        if (i + z[i] - 1 > r) {
            l = i;
            r = i + z[i] - 1;
        }
    }
    return z;
}

std::vector<int> zAlgorithmSearch(const std::string& text, const std::string& pattern) {
    if (pattern.empty() || text.empty() || pattern.length() > text.length()) {
        return {};
    }
    
    std::string combined = pattern + "$" + text;
    auto z = buildZArray(combined);
    std::vector<int> result;
    int m = pattern.length();
    
    for (size_t i = m + 1; i < combined.length(); i++) {
        if (z[i] == m) {
            result.push_back(i - m - 1);
        }
    }
    return result;
}

