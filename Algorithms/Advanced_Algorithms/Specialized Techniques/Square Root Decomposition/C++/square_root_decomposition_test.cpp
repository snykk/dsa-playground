#include <cassert>
#include <iostream>
#include <vector>
#include "square_root_decomposition.cpp"

void testQuery() {
    vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    SqrtDecomposition sd(arr);
    int sum = 0;
    for (int i = 0; i <= 9; i++) {
        sum += arr[i];
    }
    assert(sd.query(0, 9) == sum);
}

void testUpdate() {
    vector<int> arr = {1, 2, 3, 4, 5};
    SqrtDecomposition sd(arr);
    sd.update(2, 10);
    assert(sd.query(0, 4) == 1 + 2 + 10 + 4 + 5);
}

void testEmptyInput() {
    vector<int> arr;
    SqrtDecomposition sd(arr);  // must not divide by zero
}

void testPartialLastBlock() {
    vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    SqrtDecomposition sd(arr);
    assert(sd.query(8, 9) == 19);
    assert(sd.query(3, 9) == 49);
    assert(sd.query(5, 5) == 6);
}

int main() {
    testQuery();
    testUpdate();
    testEmptyInput();
    testPartialLastBlock();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

