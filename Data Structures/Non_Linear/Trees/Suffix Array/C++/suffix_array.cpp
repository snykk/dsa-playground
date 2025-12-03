#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

class SuffixArray {
    string text;
    int n;
    vector<int> suffix_array;

    void buildSuffixArray() {
        vector<pair<string, int>> suffixes;
        for (int i = 0; i < n; i++) {
            suffixes.push_back({text.substr(i), i});
        }
        sort(suffixes.begin(), suffixes.end());
        suffix_array.clear();
        for (auto& p : suffixes) {
            suffix_array.push_back(p.second);
        }
    }

public:
    SuffixArray(const string& s) : text(s), n(s.length()) {
        buildSuffixArray();
    }

    vector<int> search(const string& pattern) {
        int left = 0, right = n - 1;
        int first_occurrence = -1;
        
        while (left <= right) {
            int mid = (left + right) / 2;
            int idx = suffix_array[mid];
            string suffix = text.substr(idx);
            
            if (suffix.find(pattern) == 0) {
                first_occurrence = mid;
                right = mid - 1;
            } else if (suffix < pattern) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        if (first_occurrence == -1) return {};
        
        left = first_occurrence;
        right = n - 1;
        int last_occurrence = first_occurrence;
        
        while (left <= right) {
            int mid = (left + right) / 2;
            int idx = suffix_array[mid];
            string suffix = text.substr(idx);
            
            if (suffix.find(pattern) == 0) {
                last_occurrence = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        vector<int> result;
        for (int i = first_occurrence; i <= last_occurrence; i++) {
            result.push_back(suffix_array[i]);
        }
        sort(result.begin(), result.end());
        return result;
    }
};

