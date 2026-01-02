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
    cout << "✓ testCompress passed" << endl;
}

void testDecompress() {
    vector<int> coords = {1000, 5, 200, 50};
    auto mapping = compressCoordinates(coords);
    auto decompressed = decompressCoordinates(mapping);
    assert(decompressed.size() == 4);
    cout << "✓ testDecompress passed" << endl;
}

int main() {
    testCompress();
    testDecompress();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

