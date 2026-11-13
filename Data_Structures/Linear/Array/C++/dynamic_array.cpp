#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {1, 2, 3};
    arr.push_back(4);             // Append
    arr.insert(arr.begin()+1, 10); // Insert at index 1
    arr.erase(arr.begin()+2);     // Remove element at index 2

    cout << "Dynamic Array: ";
    for(int x : arr) cout << x << " ";
    cout << endl;

    cout << "Size: " << arr.size() << ", Capacity: " << arr.capacity() << endl;
    return 0;
}
