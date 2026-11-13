/**
 * Test suite for Fast I/O utilities
 */

#include <iostream>
#include <cassert>
#include <climits>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <unistd.h>

#ifndef IS_TEST_BUILD
#define IS_TEST_BUILD
#endif
#include "fast_io.cpp"

using namespace std;

// ---- helpers for the tests of the real readers and writers ----------------

// Points stdin at a temporary file holding `text`.
static void setStdin(const string& text) {
    const char* path = "fast_io_test_input.tmp";
    ofstream(path, ios::binary) << text;
    assert(freopen(path, "r", stdin) != nullptr);
}

// Runs f with the C stdout redirected to a temporary file; returns the bytes.
template <typename F>
static string captureStdout(F f) {
    const char* path = "fast_io_test_output.tmp";
    fflush(stdout);
    int saved = dup(fileno(stdout));
    FILE* out = fopen(path, "w");
    dup2(fileno(out), fileno(stdout));
    f();
    fflush(stdout);
    dup2(saved, fileno(stdout));
    close(saved);
    fclose(out);
    ifstream in(path, ios::binary);
    stringstream ss;
    ss << in.rdbuf();
    return ss.str();
}

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
    cout << "ok testParseInt passed" << endl;
}

void testIntToString() {
    assert(intToString(123) == "123");
    assert(intToString(-456) == "-456");
    assert(intToString(0) == "0");
    assert(intToString(1000000000) == "1000000000");
    cout << "ok testIntToString passed" << endl;
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
    
    cout << "ok testFastIOSetup passed" << endl;
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
    
    cout << "ok testVectorIO passed" << endl;
}

void testLargeNumbers() {
    // Test handling of large numbers
    long long large = 1000000000000000LL;
    stringstream ss;
    ss << large;
    
    long long read;
    ss >> read;
    assert(read == large);
    
    cout << "ok testLargeNumbers passed" << endl;
}

// ---- tests of the real code in fast_io.cpp --------------------------------

void testReadIntBasic() {
    setStdin("12 -34 5678\n");
    assert(readInt() == 12);
    assert(readInt() == -34);
    assert(readInt() == 5678);
    cout << "ok testReadIntBasic passed" << endl;
}

void testReadIntEndOfInput() {
    // Used to loop forever: EOF stored in a char never passes the digit test.
    setStdin("");
    assert(readInt() == 0);
    setStdin("   \n  ");
    assert(readInt() == 0);
    setStdin("");
    assert(readLong() == 0);
    setStdin("7");  // number that ends exactly at EOF
    assert(readInt() == 7);
    assert(readInt() == 0);
    cout << "ok testReadIntEndOfInput passed" << endl;
}

void testReadLong() {
    setStdin("9999999999 -9223372036854775807\n");
    assert(readLong() == 9999999999LL);
    assert(readLong() == -9223372036854775807LL);
    cout << "ok testReadLong passed" << endl;
}

void testFastInputTokens() {
    setStdin("42 -7 hello 9999999999\n");
    FastInput fin;
    assert(fin.readInt() == 42);
    assert(fin.readInt() == -7);
    assert(fin.readString() == "hello");
    assert(fin.readLong() == 9999999999LL);
    cout << "ok testFastInputTokens passed" << endl;
}

void testFastInputEndOfInput() {
    setStdin("");
    FastInput a;
    assert(a.readInt() == 0);
    setStdin("");
    FastInput b;
    assert(b.readLong() == 0);
    setStdin("   ");
    FastInput c;
    assert(c.readString() == "");
    cout << "ok testFastInputEndOfInput passed" << endl;
}

void testFastInputAcrossBuffer() {
    // About 2.4 MB of input: more than the 1 MB buffer, so refills happen mid-number.
    const int n = 300000;
    string text;
    long long expected = 0;
    for (int i = 0; i < n; i++) {
        int v = static_cast<int>((static_cast<long long>(i) * 7919) % 1000003 - 500000);
        text += to_string(v) + (i % 10 == 9 ? "\n" : " ");
        expected += v;
    }
    setStdin(text);
    FastInput fin;
    long long sum = 0;
    for (int i = 0; i < n; i++) sum += fin.readInt();
    assert(sum == expected);
    assert(fin.readInt() == 0);
    cout << "ok testFastInputAcrossBuffer passed" << endl;
}

void testWriteMinimumValues() {
    // Negating INT_MIN / LLONG_MIN is undefined behaviour; the magnitude is unsigned.
    string out = captureStdout([] {
        writeInt(INT_MIN); putchar(' ');
        writeLong(LLONG_MIN); putchar(' ');
        writeInt(0); putchar(' ');
        writeInt(-1); putchar(' ');
        writeLong(1234567890123LL);
    });
    assert(out == "-2147483648 -9223372036854775808 0 -1 1234567890123");
    cout << "ok testWriteMinimumValues passed" << endl;
}

void testFastOutput() {
    string out = captureStdout([] {
        FastOutput fout;
        fout.writeInt(INT_MIN); fout.writeChar(' ');
        fout.writeLong(LLONG_MIN); fout.writeChar(' ');
        fout.writeInt(0); fout.writeChar(' ');
        fout.writeString("abc");
        fout.newLine();
        fout.flush();
    });
    assert(out == "-2147483648 -9223372036854775808 0 abc\n");
    cout << "ok testFastOutput passed" << endl;
}

int main() {
    testReadIntBasic();
    testReadIntEndOfInput();
    testReadLong();
    testFastInputTokens();
    testFastInputEndOfInput();
    testFastInputAcrossBuffer();
    testWriteMinimumValues();
    testFastOutput();
    remove("fast_io_test_input.tmp");
    remove("fast_io_test_output.tmp");

    testParseInt();
    testIntToString();
    testFastIOSetup();
    testVectorIO();
    testLargeNumbers();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}

