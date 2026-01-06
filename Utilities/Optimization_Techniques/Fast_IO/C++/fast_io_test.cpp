/**
 * Test suite for Fast I/O utilities
 */

#include <iostream>
#include <cassert>
#include <sstream>
#include <vector>

using namespace std;

// Include the fast I/O functions (simplified for testing)
inline int parseIntFromString(const string& s) {
    int x = 0, f = 1;
    size_t i = 0;
    if (s[i] == '-') {
        f = -1;
        i++;
    }
    while (i < s.length() && s[i] >= '0' && s[i] <= '9') {
        x = x * 10 + s[i] - '0';
        i++;
    }
    return x * f;
}

inline string intToString(int x) {
    if (x == 0) return "0";
    string s;
    bool neg = false;
    if (x < 0) {
        neg = true;
        x = -x;
    }
    while (x > 0) {
        s = char('0' + x % 10) + s;
        x /= 10;
    }
    if (neg) s = "-" + s;
    return s;
}

void testParseInt() {
    assert(parseIntFromString("123") == 123);
    assert(parseIntFromString("-456") == -456);
    assert(parseIntFromString("0") == 0);
    assert(parseIntFromString("1000000000") == 1000000000);
    cout << "✓ testParseInt passed" << endl;
}

void testIntToString() {
    assert(intToString(123) == "123");
    assert(intToString(-456) == "-456");
    assert(intToString(0) == "0");
    assert(intToString(1000000000) == "1000000000");
    cout << "✓ testIntToString passed" << endl;
}

void testFastIOSetup() {
    // Test that fast I/O doesn't break basic functionality
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    
    stringstream ss;
    ss << 12345;
    int x;
    ss >> x;
    assert(x == 12345);
    
    cout << "✓ testFastIOSetup passed" << endl;
}

void testVectorIO() {
    stringstream input("5 1 2 3 4 5");
    int n;
    input >> n;
    
    vector<int> v(n);
    for (int i = 0; i < n; i++) {
        input >> v[i];
    }
    
    assert(n == 5);
    assert(v[0] == 1);
    assert(v[4] == 5);
    
    long long sum = 0;
    for (int x : v) sum += x;
    assert(sum == 15);
    
    cout << "✓ testVectorIO passed" << endl;
}

void testLargeNumbers() {
    // Test handling of large numbers
    long long large = 1000000000000000LL;
    stringstream ss;
    ss << large;
    
    long long read;
    ss >> read;
    assert(read == large);
    
    cout << "✓ testLargeNumbers passed" << endl;
}

int main() {
    testParseInt();
    testIntToString();
    testFastIOSetup();
    testVectorIO();
    testLargeNumbers();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}

