#include <iostream>
#include <cassert>
using namespace std;

int main() {
    int arr[5] = {1,2,3,4,5};

    assert(arr[0] == 1);
    assert(arr[4] == 5);

    arr[2] = 10;
    assert(arr[2] == 10);

    cout << "Static array tests passed!" << endl;
    return 0;
}
