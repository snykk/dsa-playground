package main

type MinHeap struct {
	heap []int
}

func NewMinHeap() *MinHeap {
	return &MinHeap{heap: []int{}}
}

func NewMinHeapFromArray(arr []int) *MinHeap {
	heap := &MinHeap{heap: make([]int, len(arr))}
	copy(heap.heap, arr)
	heap.buildHeap()
	return heap
}

func (h *MinHeap) parent(index int) int {
	return (index - 1) / 2
}

func (h *MinHeap) leftChild(index int) int {
	return 2*index + 1
}

func (h *MinHeap) rightChild(index int) int {
	return 2*index + 2
}

func (h *MinHeap) swap(i, j int) {
	h.heap[i], h.heap[j] = h.heap[j], h.heap[i]
}

func (h *MinHeap) heapifyUp(index int) {
	for index > 0 {
		parent := h.parent(index)
		if h.heap[parent] <= h.heap[index] {
			break
		}
		h.swap(parent, index)
		index = parent
	}
}

func (h *MinHeap) heapifyDown(index int) {
	for {
		smallest := index
		left := h.leftChild(index)
		right := h.rightChild(index)

		if left < len(h.heap) && h.heap[left] < h.heap[smallest] {
			smallest = left
		}
		if right < len(h.heap) && h.heap[right] < h.heap[smallest] {
			smallest = right
		}

		if smallest == index {
			break
		}

		h.swap(index, smallest)
		index = smallest
	}
}

func (h *MinHeap) buildHeap() {
	n := len(h.heap)
	for i := n/2 - 1; i >= 0; i-- {
		h.heapifyDown(i)
	}
}

func (h *MinHeap) Insert(value int) {
	h.heap = append(h.heap, value)
	h.heapifyUp(len(h.heap) - 1)
}

func (h *MinHeap) ExtractMin() int {
	if h.IsEmpty() {
		panic("Heap is empty")
	}
	if len(h.heap) == 1 {
		minVal := h.heap[0]
		h.heap = h.heap[:0]
		return minVal
	}
	minVal := h.heap[0]
	h.heap[0] = h.heap[len(h.heap)-1]
	h.heap = h.heap[:len(h.heap)-1]
	h.heapifyDown(0)
	return minVal
}

func (h *MinHeap) Peek() int {
	if h.IsEmpty() {
		panic("Heap is empty")
	}
	return h.heap[0]
}

func (h *MinHeap) IsEmpty() bool {
	return len(h.heap) == 0
}

func (h *MinHeap) Size() int {
	return len(h.heap)
}

func (h *MinHeap) Clear() {
	h.heap = []int{}
}

func main() {
	heap := NewMinHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Insert(7)
	println("Peek:", heap.Peek()) // 3
}

