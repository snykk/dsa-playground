/**
 * Fast I/O Techniques for Competitive Programming (C++)
 * 
 * This file demonstrates various techniques to speed up input/output
 * operations which can be crucial for time-sensitive problems.
 */

#include <cstdio>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Basic Fast I/O

/**
 * Standard fast I/O setup
 * - Disables synchronization between C and C++ I/O
 * - Unties cin from cout for independent buffering
 */
void fastIO() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
}

// Custom Fast Integer Read

/**
 * Ultra-fast integer reader using getchar()
 * Faster than cin for large inputs.
 * The character is kept in an int so that EOF (-1) is never confused with a
 * data byte. At end of input readInt returns 0 instead of looping forever.
 */
inline int readInt() {
    int x = 0, f = 1;
    int c = getchar();
    while (c != EOF && (c < '0' || c > '9')) {
        if (c == '-') f = -1;
        c = getchar();
    }
    while (c >= '0' && c <= '9') {
        x = x * 10 + (c - '0');
        c = getchar();
    }
    return x * f;
}

/**
 * Fast long long reader (returns 0 at end of input)
 */
inline long long readLong() {
    long long x = 0, f = 1;
    int c = getchar();
    while (c != EOF && (c < '0' || c > '9')) {
        if (c == '-') f = -1;
        c = getchar();
    }
    while (c >= '0' && c <= '9') {
        x = x * 10 + (c - '0');
        c = getchar();
    }
    return x * f;
}

// Custom Fast Integer Write

/**
 * Writes the decimal digits of u with putchar().
 */
inline void writeUnsigned(unsigned long long u) {
    if (u > 9) writeUnsigned(u / 10);
    putchar(static_cast<int>(u % 10) + '0');
}

/**
 * Ultra-fast integer writer using putchar().
 * The magnitude is computed in unsigned arithmetic, so INT_MIN works
 * (negating INT_MIN as an int is undefined behaviour).
 */
inline void writeInt(int x) {
    unsigned long long u = static_cast<unsigned long long>(x);
    if (x < 0) {
        putchar('-');
        u = 0ULL - u;
    }
    writeUnsigned(u);
}

/**
 * Fast long long writer (works for LLONG_MIN)
 */
inline void writeLong(long long x) {
    unsigned long long u = static_cast<unsigned long long>(x);
    if (x < 0) {
        putchar('-');
        u = 0ULL - u;
    }
    writeUnsigned(u);
}

// Buffered I/O

/**
 * Buffered input class for even faster reading
 */
class FastInput {
    static const int BUFFER_SIZE = 1 << 20;  // 1 MB buffer
    // On the heap: two 1 MB arrays as locals would put 2 MB on the stack.
    vector<char> buffer = vector<char>(BUFFER_SIZE);
    int pos = 0, len = 0;

    // Returns the next byte (0..255) or EOF (-1); an int so the two never mix.
    inline int nextChar() {
        if (pos == len) {
            len = static_cast<int>(fread(buffer.data(), 1, BUFFER_SIZE, stdin));
            pos = 0;
        }
        return pos < len ? static_cast<unsigned char>(buffer[pos++]) : EOF;
    }

public:
    // At end of input the readers return 0 (readString returns "").
    inline int readInt() {
        int x = 0, f = 1;
        int c = nextChar();
        while (c != EOF && (c < '0' || c > '9')) {
            if (c == '-') f = -1;
            c = nextChar();
        }
        while (c >= '0' && c <= '9') {
            x = x * 10 + (c - '0');
            c = nextChar();
        }
        return x * f;
    }

    inline long long readLong() {
        long long x = 0, f = 1;
        int c = nextChar();
        while (c != EOF && (c < '0' || c > '9')) {
            if (c == '-') f = -1;
            c = nextChar();
        }
        while (c >= '0' && c <= '9') {
            x = x * 10 + (c - '0');
            c = nextChar();
        }
        return x * f;
    }

    inline string readString() {
        string s;
        int c = nextChar();
        while (c != EOF && c <= ' ') c = nextChar();
        while (c != EOF && c > ' ') {
            s += static_cast<char>(c);
            c = nextChar();
        }
        return s;
    }
};

/**
 * Buffered output class for faster writing
 */
class FastOutput {
    static const int BUFFER_SIZE = 1 << 20;  // 1 MB buffer
    vector<char> buffer = vector<char>(BUFFER_SIZE);  // heap, not stack
    int pos = 0;
    
    inline void flushBuffer() {
        fwrite(buffer.data(), 1, pos, stdout);
        pos = 0;
    }
    
public:
    ~FastOutput() {
        flushBuffer();
    }
    
    inline void writeChar(char c) {
        if (pos == BUFFER_SIZE) flushBuffer();
        buffer[pos++] = c;
    }
    
    inline void writeUnsigned(unsigned long long u) {
        char tmp[20];
        int len = 0;
        do {
            tmp[len++] = static_cast<char>(u % 10 + '0');
            u /= 10;
        } while (u);
        while (len--) writeChar(tmp[len]);
    }

    // Magnitudes are computed in unsigned arithmetic, so INT_MIN and
    // LLONG_MIN are written correctly.
    inline void writeInt(int x) {
        unsigned long long u = static_cast<unsigned long long>(x);
        if (x < 0) {
            writeChar('-');
            u = 0ULL - u;
        }
        writeUnsigned(u);
    }

    inline void writeLong(long long x) {
        unsigned long long u = static_cast<unsigned long long>(x);
        if (x < 0) {
            writeChar('-');
            u = 0ULL - u;
        }
        writeUnsigned(u);
    }

    inline void writeString(const string& s) {
        for (char c : s) writeChar(c);
    }
    
    inline void newLine() {
        writeChar('\n');
    }
    
    inline void flush() {
        flushBuffer();
    }
};

// Comparison Demo

/**
 * Demonstrates different I/O methods
 */
void demoFastIO() {
    // Method 1: Standard fast I/O (recommended for most cases)
    fastIO();
    
    int n;
    cin >> n;
    
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    
    long long sum = 0;
    for (int x : a) sum += x;
    
    cout << sum << "\n";
}

void demoGetcharPutchar() {
    // Method 2: getchar/putchar (faster for large inputs)
    int n = readInt();
    
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        a[i] = readInt();
    }
    
    long long sum = 0;
    for (int x : a) sum += x;
    
    writeLong(sum);
    putchar('\n');
}

void demoBufferedIO() {
    // Method 3: Buffered I/O (fastest for very large inputs)
    FastInput fin;
    FastOutput fout;
    
    int n = fin.readInt();
    
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        a[i] = fin.readInt();
    }
    
    long long sum = 0;
    for (int x : a) sum += x;
    
    fout.writeLong(sum);
    fout.newLine();
    fout.flush();
}

#ifndef IS_TEST_BUILD
int main() {
    // Choose one method based on problem requirements
    
    // For most problems:
    fastIO();
    
    // Your solution here...
    
    return 0;
}
#endif  // IS_TEST_BUILD
