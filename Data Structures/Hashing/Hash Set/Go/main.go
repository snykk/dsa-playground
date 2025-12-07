package main

// HashSet represents a hash set
type HashSet struct {
	buckets [][]interface{}
	capacity int
	size     int
}

// NewHashSet creates a new hash set
func NewHashSet(capacity int) *HashSet {
	if capacity <= 0 {
		capacity = 16
	}
	return &HashSet{
		buckets:  make([][]interface{}, capacity),
		capacity: capacity,
		size:     0,
	}
}

func (hs *HashSet) hash(key interface{}) int {
	switch k := key.(type) {
	case int:
		return k % hs.capacity
	case string:
		hashValue := 0
		for _, char := range k {
			hashValue = (hashValue*31 + int(char)) % hs.capacity
		}
		return hashValue
	default:
		return int(uintptr(interface{}(key).(uintptr))) % hs.capacity
	}
}

// Add adds an element to the set
func (hs *HashSet) Add(key interface{}) bool {
	index := hs.hash(key)
	bucket := hs.buckets[index]

	for _, k := range bucket {
		if k == key {
			return false
		}
	}

	hs.buckets[index] = append(bucket, key)
	hs.size++
	return true
}

// Remove removes an element from the set
func (hs *HashSet) Remove(key interface{}) bool {
	index := hs.hash(key)
	bucket := hs.buckets[index]

	for i, k := range bucket {
		if k == key {
			hs.buckets[index] = append(bucket[:i], bucket[i+1:]...)
			hs.size--
			return true
		}
	}
	return false
}

// Contains checks if element exists
func (hs *HashSet) Contains(key interface{}) bool {
	index := hs.hash(key)
	bucket := hs.buckets[index]

	for _, k := range bucket {
		if k == key {
			return true
		}
	}
	return false
}

// Size returns the number of elements
func (hs *HashSet) Size() int {
	return hs.size
}

// IsEmpty checks if set is empty
func (hs *HashSet) IsEmpty() bool {
	return hs.size == 0
}

