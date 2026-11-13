#include <iostream>
#include <cassert>
using namespace std;

int main() {
    int matrix[3][3] = {
        {1,2,3},
        {4,5,6},
        {7,8,9}
    };

    // Access tests
    assert(matrix[0][0] == 1);
    assert(matrix[1][2] == 6);
    assert(matrix[2][1] == 8);

    // Flatten test
    int flat[9];
    for(int i=0;i<3;i++)
        for(int j=0;j<3;j++)
            flat[i*3 + j] = matrix[i][j];

    int expected[9] = {1,2,3,4,5,6,7,8,9};
    for(int i=0;i<9;i++)
        assert(flat[i] == expected[i]);

    cout << "Multi-dimensional array tests passed!" << endl;
    return 0;
}
