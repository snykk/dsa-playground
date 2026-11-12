#include <iostream>
using namespace std;

int main() {
    int matrix[3][3] = {
        {1,2,3},
        {4,5,6},
        {7,8,9}
    };

    cout << "2D Matrix:" << endl;
    for(int i=0; i<3; i++){
        for(int j=0; j<3; j++)
            cout << matrix[i][j] << " ";
        cout << endl;
    }

    // Access element
    cout << "Element at (1,2): " << matrix[1][2] << endl;

    // Flattened 1D access example
    int flat[9];
    for(int i=0; i<3; i++)
        for(int j=0; j<3; j++)
            flat[i*3 + j] = matrix[i][j];

    cout << "Flattened matrix: ";
    for(int i=0; i<9; i++) cout << flat[i] << " ";
    cout << endl;

    return 0;
}
