package main

type MaxHeap struct {
	heap []int
}

func NewMaxHeap() *MaxHeap {
	return &MaxHeap{heap: []int{}}
}

func NewMaxHeapFromArray(arr []int) *MaxHeap {
	heap := &MaxHeap{heap: make([]int, len(arr))}
	copy(heap.heap, arr)
	heap.buildHeap()
	return heap
}

func (h *MaxHeap) parent(index int) int {
	return (index - 1) / 2
}

func (h *MaxHeap) leftChild(index int) int {
	return 2*index + 1
}

func (h *MaxHeap) rightChild(index int) int {
	return 2*index + 2
}

func (h *MaxHeap) swap(i, j int) {
	h.heap[i], h.heap[j] = h.heap[j], h.heap[i]
}

func (h *MaxHeap) heapifyUp(index int) {
	for index > 0 {
		parent := h.parent(index)
		if h.heap[parent] >= h.heap[index] {
			break
		}
		h.swap(parent, index)
		index = parent
	}
}

func (h *MaxHeap) heapifyDown(index int) {
	for {
		largest := index
		left := h.leftChild(index)
		right := h.rightChild(index)

		if left < len(h.heap) && h.heap[left] > h.heap[largest] {
			largest = left
		}
		if right < len(h.heap) && h.heap[right] > h.heap[largest] {
			largest = right
		}

		if largest == index {
			break
		}

		h.swap(index, largest)
		index = largest
	}
}

func (h *MaxHeap) buildHeap() {
	n := len(h.heap)
	for i := n/2 - 1; i >= 0; i-- {
		h.heapifyDown(i)
	}
}

func (h *MaxHeap) Insert(value int) {
	h.heap = append(h.heap, value)
	h.heapifyUp(len(h.heap) - 1)
}

func (h *MaxHeap) ExtractMax() int {
	if h.IsEmpty() {
		panic("Heap is empty")
	}
	if len(h.heap) == 1 {
		maxVal := h.heap[0]
		h.heap = h.heap[:0]
		return maxVal
	}
	maxVal := h.heap[0]
	h.heap[0] = h.heap[len(h.heap)-1]
	h.heap = h.heap[:len(h.heap)-1]
	h.heapifyDown(0)
	return maxVal
}

func (h *MaxHeap) Peek() int {
	if h.IsEmpty() {
		panic("Heap is empty")
	}
	return h.heap[0]
}

func (h *MaxHeap) IsEmpty() bool {
	return len(h.heap) == 0
}

func (h *MaxHeap) Size() int {
	return len(h.heap)
}

func (h *MaxHeap) Clear() {
	h.heap = []int{}
}

func main() {
	heap := NewMaxHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Insert(7)
	println("Peek:", heap.Peek()) // 7
}

