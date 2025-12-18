/**
 * Longest Common Substring Implementation (C++)
 */
#include <string>
#include <vector>
#include <algorithm>

std::string longestCommonSubstring(const std::string& s1, const std::string& s2) {
    int m = s1.length(), n = s2.length();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));
    
    int maxLen = 0, endI = 0;
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
                if (dp[i][j] > maxLen) {
                    maxLen = dp[i][j];
                    endI = i;
                }
            }
        }
    }
    
    return maxLen > 0 ? s1.substr(endI - maxLen, maxLen) : "";
}

