#include <iostream>
using namespace std;

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    cout << "Static Array: ";
    for(int i = 0; i < 5; i++)
        cout << arr[i] << " ";
    cout << endl;

    // Access & Update
    cout << "Element at index 2: " << arr[2] << endl;
    arr[2] = 10;
    cout << "After update: ";
    for(int i = 0; i < 5; i++)
        cout << arr[i] << " ";
    cout << endl;

    return 0;
}
