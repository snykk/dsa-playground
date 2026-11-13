package main

import "fmt"

// DynamicArray represents a dynamic array with amortized O(1) append
type DynamicArray struct {
	capacity int
	size     int
	data     []int
	copies   int // total element copies made by all resizes
}

// NewDynamicArray creates a new dynamic array
func NewDynamicArray(initialCapacity int) *DynamicArray {
	return &DynamicArray{
		capacity: initialCapacity,
		size:     0,
		data:     make([]int, initialCapacity),
	}
}

// Resize doubles the capacity
func (da *DynamicArray) resize() {
	oldCapacity := da.capacity
	da.capacity = max(1, da.capacity*2)
	newData := make([]int, da.capacity)

	for i := 0; i < oldCapacity; i++ {
		newData[i] = da.data[i]
	}
	da.copies += oldCapacity

	da.data = newData
}

// Append adds a value (amortized O(1))
func (da *DynamicArray) Append(value int) {
	if da.size >= da.capacity {
		da.resize() // O(n) operation
	}
	da.data[da.size] = value
	da.size++
}

// Get retrieves a value at index
func (da *DynamicArray) Get(index int) int {
	if index >= 0 && index < da.size {
		return da.data[index]
	}
	panic("Index out of range")
}

// BinaryCounter represents a binary counter with amortized O(1) increment
type BinaryCounter struct {
	bits  []int
	nBits int
	flips int // total bit flips made by all increments
}

// NewBinaryCounter creates a new binary counter
func NewBinaryCounter(nBits int) *BinaryCounter {
	return &BinaryCounter{
		bits:  make([]int, nBits),
		nBits: nBits,
	}
}

// Increment increments the counter (amortized O(1))
func (bc *BinaryCounter) Increment() {
	i := 0
	for i < bc.nBits && bc.bits[i] == 1 {
		bc.bits[i] = 0
		bc.flips++
		i++
	}
	if i < bc.nBits {
		bc.bits[i] = 1
		bc.flips++
	}
}

// GetValue returns the decimal value
func (bc *BinaryCounter) GetValue() int {
	value := 0
	for i, bit := range bc.bits {
		value += bit * (1 << i)
	}
	return value
}

func DemonstrateAmortizedAnalysis() {
	fmt.Println("=== Amortized Analysis Examples ===")
	fmt.Println()

	// Dynamic Array
	fmt.Println("Dynamic Array (Amortized O(1) append):")
	arr := NewDynamicArray(2)
	for i := 0; i < 10; i++ {
		arr.Append(i)
		fmt.Printf("  Append %d: size=%d, capacity=%d\n", i, arr.size, arr.capacity)
	}
	fmt.Println()
	fmt.Println("Amortized cost: O(1) per append")
	fmt.Println()

	// Binary Counter
	fmt.Println("Binary Counter (Amortized O(1) increment):")
	counter := NewBinaryCounter(4)
	for i := 0; i < 10; i++ {
		counter.Increment()
		fmt.Printf("  Increment %d: value=%d\n", i+1, counter.GetValue())
	}
	fmt.Println()
	fmt.Println("Amortized cost: O(1) per increment")
	fmt.Println()

	fmt.Println("Key Insight: Expensive operations are 'paid for' by cheap ones")
}

func main() {
	DemonstrateAmortizedAnalysis()
}
