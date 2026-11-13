#include <iostream>
#include <vector>
#include <map>
#include <cassert>
#include "coordinate_compression.cpp"

using namespace std;

void testCompress() {
    vector<int> coords = {1000, 5, 200, 1000, 5, 50};
    auto mapping = compressCoordinates(coords);
    assert(mapping.size() == 4);
    assert((mapping == map<int, int>{{5, 0}, {50, 1}, {200, 2}, {1000, 3}}));
    vector<int> ranks;
    for (int c : coords) ranks.push_back(mapping[c]);
    assert((ranks == vector<int>{3, 0, 2, 3, 0, 1}));
    cout << "testCompress passed" << endl;
}

void testDecompress() {
    vector<int> coords = {1000, 5, 200, 50};
    auto mapping = compressCoordinates(coords);
    auto decompressed = decompressCoordinates(mapping);
    assert(decompressed.size() == 4);
    assert((decompressed == vector<int>{5, 50, 200, 1000}));
    cout << "testDecompress passed" << endl;
}

void testNegativeAndEmpty() {
    assert(compressCoordinates({}).empty());
    assert(decompressCoordinates({}).empty());
    auto mapping = compressCoordinates({7, -3, 0, -3});
    assert((mapping == map<int, int>{{-3, 0}, {0, 1}, {7, 2}}));
    cout << "testNegativeAndEmpty passed" << endl;
}

void testCompress2D() {
    vector<pair<int, int>> points = {{1000, 500}, {5, 10}, {200, 300}, {5, 500}};
    auto maps = compress2DCoordinates(points);
    assert((maps.first == map<int, int>{{5, 0}, {200, 1}, {1000, 2}}));
    assert((maps.second == map<int, int>{{10, 0}, {300, 1}, {500, 2}}));
    cout << "testCompress2D passed" << endl;
}

int main() {
    testCompress();
    testDecompress();
    testNegativeAndEmpty();
    testCompress2D();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

