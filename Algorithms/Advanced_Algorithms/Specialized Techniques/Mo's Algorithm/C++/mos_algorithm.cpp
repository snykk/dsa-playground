#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <unordered_map>

using namespace std;

class MoSAlgorithm {
private:
    vector<int> arr;
    int n;
    int blockSize;
    
    int getBlock(int index) {
        return index / blockSize;
    }
    
public:
    MoSAlgorithm(const vector<int>& arr) : arr(arr) {
        n = arr.size();
        blockSize = sqrt(n);
    }
    
    int add(int currentAns, int value, unordered_map<int, int>& freq) {
        freq[value]++;
        if (freq[value] == 1) {
            return currentAns + 1;
        }
        return currentAns;
    }
    
    int remove(int currentAns, int value, unordered_map<int, int>& freq) {
        freq[value]--;
        if (freq[value] == 0) {
            freq.erase(value);
            return currentAns - 1;
        }
        return currentAns;
    }
    
    vector<int> processQueries(const vector<pair<int, int>>& queries) {
        vector<pair<int, pair<int, int>>> sortedQueries;
        for (int i = 0; i < queries.size(); i++) {
            sortedQueries.push_back({i, queries[i]});
        }
        
        sort(sortedQueries.begin(), sortedQueries.end(),
             [this](const pair<int, pair<int, int>>& a, const pair<int, pair<int, int>>& b) {
                 int blockA = getBlock(a.second.first);
                 int blockB = getBlock(b.second.first);
                 if (blockA != blockB) {
                     return blockA < blockB;
                 }
                 return a.second.second < b.second.second;
             });
        
        vector<int> answers(queries.size());
        int currentL = 0;
        int currentR = -1;
        int currentAns = 0;
        unordered_map<int, int> freq;
        
        for (const auto& query : sortedQueries) {
            int queryIdx = query.first;
            int l = query.second.first;
            int r = query.second.second;
            
            while (currentL > l) {
                currentL--;
                currentAns = add(currentAns, arr[currentL], freq);
            }
            
            while (currentR < r) {
                currentR++;
                currentAns = add(currentAns, arr[currentR], freq);
            }
            
            while (currentL < l) {
                currentAns = remove(currentAns, arr[currentL], freq);
                currentL++;
            }
            
            while (currentR > r) {
                currentAns = remove(currentAns, arr[currentR], freq);
                currentR--;
            }
            
            answers[queryIdx] = currentAns;
        }
        
        return answers;
    }
};

vector<int> countDistinctInRanges(const vector<int>& arr, const vector<pair<int, int>>& queries) {
    MoSAlgorithm mo(arr);
    return mo.processQueries(queries);
}

#ifndef TESTING
int main() {
    cout << "Mo's Algorithm Examples:" << endl;
    cout << endl;
    
    vector<int> arr = {1, 1, 2, 1, 3, 4, 3, 3, 4};
    vector<pair<int, int>> queries = {{0, 4}, {1, 3}, {2, 6}, {0, 8}};
    
    cout << "Array: ";
    for (int val : arr) {
        cout << val << " ";
    }
    cout << endl;
    
    cout << "Queries: ";
    for (const auto& q : queries) {
        cout << "[" << q.first << ", " << q.second << "] ";
    }
    cout << endl << endl;
    
    vector<int> results = countDistinctInRanges(arr, queries);
    cout << "Distinct counts for each query:" << endl;
    for (int i = 0; i < queries.size(); i++) {
        cout << "  Range [" << queries[i].first << ", " << queries[i].second 
             << "]: " << results[i] << " distinct elements" << endl;
    }
    
    return 0;
}
#endif
