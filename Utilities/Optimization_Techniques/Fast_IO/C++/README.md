# Fast I/O (C++)

C++ implementation of fast input/output techniques.

## Methods

### Basic Fast I/O
- `fastIO()` - Standard fast I/O setup

### Custom Fast Read
- `readInt()` - Ultra-fast integer read using getchar()
- `readLong()` - Fast long long read

### Custom Fast Write
- `writeInt(x)` - Ultra-fast integer write using putchar()
- `writeLong(x)` - Fast long long write

### Buffered I/O
- `FastInput` - Buffered input class
- `FastOutput` - Buffered output class

## Usage

```cpp
fastIO();
int n = readInt();
vector<int> a(n);
for (int i = 0; i < n; i++) {
    a[i] = readInt();
}
```

