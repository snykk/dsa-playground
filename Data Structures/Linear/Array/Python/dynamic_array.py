# Python/Linear/Array/dynamic_array.py
class DynamicArray:
    """Custom Dynamic Array (similar to Python list)"""
    def __init__(self):
        self._n = 0
        self._capacity = 1
        self._A = [None] * self._capacity

    def __len__(self):
        return self._n

    def __getitem__(self, k):
        if not 0 <= k < self._n:
            raise IndexError('Index out of range')
        return self._A[k]

    def append(self, value):
        if self._n == self._capacity:
            self._resize(2 * self._capacity)
        self._A[self._n] = value
        self._n += 1

    def pop(self):
        if self._n == 0:
            raise IndexError('Pop from empty array')
        val = self._A[self._n - 1]
        self._n -= 1
        return val

    def _resize(self, new_capacity):
        B = [None] * new_capacity
        for i in range(self._n):
            B[i] = self._A[i]
        self._A = B
        self._capacity = new_capacity

def main():
    arr = DynamicArray()
    for i in range(5):
        arr.append(i)
    print("Dynamic array size:", len(arr))
    print("Elements:", [arr[i] for i in range(len(arr))])

if __name__ == "__main__":
    main()
