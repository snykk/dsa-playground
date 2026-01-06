/**
 * Fast I/O Techniques for Competitive Programming (C++)
 * 
 * This file demonstrates various techniques to speed up input/output
 * operations which can be crucial for time-sensitive problems.
 */

#include <bits/stdc++.h>
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
 * Faster than cin for large inputs
 */
inline int readInt() {
    int x = 0, f = 1;
    char c = getchar();
    while (c < '0' || c > '9') {
        if (c == '-') f = -1;
        c = getchar();
    }
    while (c >= '0' && c <= '9') {
        x = x * 10 + c - '0';
        c = getchar();
    }
    return x * f;
}

/**
 * Fast long long reader
 */
inline long long readLong() {
    long long x = 0, f = 1;
    char c = getchar();
    while (c < '0' || c > '9') {
        if (c == '-') f = -1;
        c = getchar();
    }
    while (c >= '0' && c <= '9') {
        x = x * 10 + c - '0';
        c = getchar();
    }
    return x * f;
}

// Custom Fast Integer Write

/**
 * Ultra-fast integer writer using putchar()
 */
inline void writeInt(int x) {
    if (x < 0) {
        putchar('-');
        x = -x;
    }
    if (x > 9) writeInt(x / 10);
    putchar(x % 10 + '0');
}

/**
 * Fast long long writer
 */
inline void writeLong(long long x) {
    if (x < 0) {
        putchar('-');
        x = -x;
    }
    if (x > 9) writeLong(x / 10);
    putchar(x % 10 + '0');
}

// Buffered I/O

/**
 * Buffered input class for even faster reading
 */
class FastInput {
    static const int BUFFER_SIZE = 1 << 20;  // 1 MB buffer
    char buffer[BUFFER_SIZE];
    int pos = 0, len = 0;
    
    inline char nextChar() {
        if (pos == len) {
            len = fread(buffer, 1, BUFFER_SIZE, stdin);
            pos = 0;
        }
        return pos < len ? buffer[pos++] : EOF;
    }
    
public:
    inline int readInt() {
        int x = 0, f = 1;
        char c = nextChar();
        while (c < '0' || c > '9') {
            if (c == '-') f = -1;
            c = nextChar();
        }
        while (c >= '0' && c <= '9') {
            x = x * 10 + c - '0';
            c = nextChar();
        }
        return x * f;
    }
    
    inline long long readLong() {
        long long x = 0, f = 1;
        char c = nextChar();
        while (c < '0' || c > '9') {
            if (c == '-') f = -1;
            c = nextChar();
        }
        while (c >= '0' && c <= '9') {
            x = x * 10 + c - '0';
            c = nextChar();
        }
        return x * f;
    }
    
    inline string readString() {
        string s;
        char c = nextChar();
        while (c <= ' ') c = nextChar();
        while (c > ' ') {
            s += c;
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
    char buffer[BUFFER_SIZE];
    int pos = 0;
    
    inline void flushBuffer() {
        fwrite(buffer, 1, pos, stdout);
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
    
    inline void writeInt(int x) {
        if (x < 0) {
            writeChar('-');
            x = -x;
        }
        char tmp[12];
        int len = 0;
        do {
            tmp[len++] = x % 10 + '0';
            x /= 10;
        } while (x);
        while (len--) writeChar(tmp[len]);
    }
    
    inline void writeLong(long long x) {
        if (x < 0) {
            writeChar('-');
            x = -x;
        }
        char tmp[20];
        int len = 0;
        do {
            tmp[len++] = x % 10 + '0';
            x /= 10;
        } while (x);
        while (len--) writeChar(tmp[len]);
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

int main() {
    // Choose one method based on problem requirements
    
    // For most problems:
    fastIO();
    
    // Your solution here...
    
    return 0;
}

