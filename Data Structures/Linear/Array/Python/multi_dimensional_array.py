# Python/Linear/Array/multi_dimensional_array.py
def main():
    # 2D array (3x3 matrix)
    matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ]
    print("2D Matrix:")
    for row in matrix:
        print(row)

    # Access element
    print("Element at (1,2):", matrix[1][2])

    # Flattened access example
    rows, cols = 3, 3
    flat = [matrix[i][j] for i in range(rows) for j in range(cols)]
    print("Flattened matrix:", flat)

if __name__ == "__main__":
    main()
