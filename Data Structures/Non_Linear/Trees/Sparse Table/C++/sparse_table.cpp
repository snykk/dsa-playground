#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
using namespace std;

class SparseTable {
    int n;
    int log_n;
    vector<int> arr;
    vector<vector<int>> table;
    string query_type;

public:
    SparseTable(vector<int>& arr, string query_type = "min") {
        this->n = arr.size();
        this->arr = arr;
        this->query_type = query_type;
        
        // Calculate log2(n) for table size
        this->log_n = floor(log2(n)) + 1;
        
        // Build sparse table
        // table[i][j] = min/max of range starting at i with length 2^j
        table.resize(n, vector<int>(log_n));
        
        // Initialize first column (length 1)
        for (int i = 0; i < n; i++) {
            table[i][0] = arr[i];
        }
        
        // Fill table using dynamic programming
        for (int j = 1; j < log_n; j++) {
            for (int i = 0; i < n - (1 << j) + 1; i++) {
                if (query_type == "min") {
                    table[i][j] = min(
                        table[i][j - 1],
                        table[i + (1 << (j - 1))][j - 1]
                    );
                } else { // max
                    table[i][j] = max(
                        table[i][j - 1],
                        table[i + (1 << (j - 1))][j - 1]
                    );
                }
            }
        }
    }

    int query(int left, int right) {
        if (left > right) swap(left, right);
        
        // Find largest power of 2 that fits in range length
        int length = right - left + 1;
        int k = floor(log2(length));
        
        // Query two overlapping ranges of length 2^k
        if (query_type == "min") {
            return min(
                table[left][k],
                table[right - (1 << k) + 1][k]
            );
        } else { // max
            return max(
                table[left][k],
                table[right - (1 << k) + 1][k]
            );
        }
    }

    int get(int index) {
        return arr[index];
    }
};

