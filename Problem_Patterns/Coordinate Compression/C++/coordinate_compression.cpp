#include <iostream>
#include <vector>
#include <map>
#include <set>
#include <algorithm>

using namespace std;

map<int, int> compressCoordinates(const vector<int>& coords) {
    set<int> uniqueCoords(coords.begin(), coords.end());
    vector<int> sortedCoords(uniqueCoords.begin(), uniqueCoords.end());
    map<int, int> mapping;
    for (int i = 0; i < sortedCoords.size(); i++) {
        mapping[sortedCoords[i]] = i;
    }
    return mapping;
}

vector<int> decompressCoordinates(const map<int, int>& mapping) {
    map<int, int> reverseMapping;
    for (const auto& pair : mapping) {
        reverseMapping[pair.second] = pair.first;
    }
    vector<int> result;
    for (int i = 0; i < reverseMapping.size(); i++) {
        result.push_back(reverseMapping[i]);
    }
    return result;
}

pair<map<int, int>, map<int, int>> compress2DCoordinates(const vector<pair<int, int>>& points) {
    vector<int> xCoords, yCoords;
    for (const auto& p : points) {
        xCoords.push_back(p.first);
        yCoords.push_back(p.second);
    }
    return {compressCoordinates(xCoords), compressCoordinates(yCoords)};
}

#ifndef TESTING
int main() {
    vector<int> coords = {1000, 5, 200, 1000, 5, 50};
    auto mapping = compressCoordinates(coords);
    cout << "Compressed mapping size: " << mapping.size() << endl;
    
    auto decompressed = decompressCoordinates(mapping);
    cout << "Decompressed: ";
    for (int c : decompressed) cout << c << " ";
    cout << endl;
    return 0;
}
#endif

