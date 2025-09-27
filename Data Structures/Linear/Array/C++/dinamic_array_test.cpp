#include <iostream>
#include <vector>
#include <cassert>
using namespace std;

int main() {
    vector<int> arr = {0,1,2,3,4};

    // Test size
    assert(arr.size() == 5);

    // Test access
    assert(arr[0] == 0 && arr[4] == 4);

    // Test pop
    int val = arr.back();
    arr.pop_back();
    assert(val == 4 && arr.size() == 4);

    cout << "Dynamic array tests passed!" << endl;
    return 0;
}
