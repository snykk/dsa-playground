class DynamicArray:
    """Growable array: capacity doubles when full and halves when a quarter full.

    Supports len(), a[k] (0 <= k < len, no negative indexes), append() and pop().
    """
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
        self._A[self._n - 1] = None  # drop the reference so the object can be freed
        self._n -= 1
        if 0 < self._n <= self._capacity // 4:
            self._resize(self._capacity // 2)
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
