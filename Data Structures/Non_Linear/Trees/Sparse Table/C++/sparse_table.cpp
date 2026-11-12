#include <iostream>
#include <vector>
#include <algorithm>
#include <stdexcept>
#include <string>
using namespace std;

class SparseTable {
    int n;
    int log_n;
    vector<int> arr;
    vector<vector<int>> table;
    string query_type;

    // floor(log2(x)) for x >= 1, using integers only.
    static int floorLog2(int x) {
        int k = 0;
        while ((x >>= 1) > 0) k++;
        return k;
    }

public:
    // Throws std::invalid_argument unless query_type is "min" or "max".
    // An empty array is allowed; every query on it throws std::out_of_range.
    SparseTable(const vector<int>& arr, string query_type = "min") {
        if (query_type != "min" && query_type != "max") {
            throw invalid_argument("query_type must be \"min\" or \"max\"");
        }
        this->n = (int)arr.size();
        this->arr = arr;
        this->query_type = query_type;
        
        // Number of levels: floor(log2(n)) + 1 (0 for an empty array)
        this->log_n = n == 0 ? 0 : floorLog2(n) + 1;
        
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

    // Swapped bounds (left > right) are reordered. Throws std::out_of_range
    // if an index is outside [0, n).
    int query(int left, int right) const {
        if (left > right) swap(left, right);
        if (left < 0 || right >= n) {
            throw out_of_range("SparseTable: range out of bounds");
        }

        // Largest k with 2^k <= length
        int length = right - left + 1;
        int k = floorLog2(length);
        
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

    int get(int index) const {
        if (index < 0 || index >= n) {
            throw out_of_range("SparseTable: index out of range");
        }
        return arr[index];
    }
};

