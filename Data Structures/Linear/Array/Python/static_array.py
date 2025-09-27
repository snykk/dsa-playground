# Python/Linear/Array/static_array.py
import array

def main():
    # Static array of integers
    arr = array.array('i', [1, 2, 3, 4, 5])
    print("Initial array:", arr)

    # Access element
    print("Element at index 2:", arr[2])

    # Update element
    arr[2] = 10
    print("After update:", arr)

if __name__ == "__main__":
    main()
