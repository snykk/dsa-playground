package main

import "fmt"

// HashSet represents a hash set
type HashSet struct {
	buckets             [][]interface{}
	capacity            int
	size                int
	loadFactorThreshold float64
}

// NewHashSet creates a new hash set
func NewHashSet(capacity int) *HashSet {
	if capacity <= 0 {
		capacity = 16
	}
	return &HashSet{
		buckets:             make([][]interface{}, capacity),
		capacity:            capacity,
		size:                0,
		loadFactorThreshold: 0.75,
	}
}

// hash computes the bucket index. Negative ints are folded into range, strings
// are hashed directly, and every other key type is hashed through its printed
// form (type name plus value).
func (hs *HashSet) hash(key interface{}) int {
	switch k := key.(type) {
	case int:
		return ((k % hs.capacity) + hs.capacity) % hs.capacity
	case string:
		return hashString(k, hs.capacity)
	default:
		return hashString(fmt.Sprintf("%T:%v", key, key), hs.capacity)
	}
}

func hashString(s string, capacity int) int {
	hashValue := 0
	for _, char := range s {
		hashValue = (hashValue*31 + int(char)) % capacity
	}
	return hashValue
}

// resize doubles the number of buckets and moves every element to its new bucket.
func (hs *HashSet) resize() {
	old := hs.buckets
	hs.capacity *= 2
	hs.buckets = make([][]interface{}, hs.capacity)
	for _, bucket := range old {
		for _, k := range bucket {
			index := hs.hash(k)
			hs.buckets[index] = append(hs.buckets[index], k)
		}
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

	// Rehash into twice as many buckets when the load factor passes the threshold.
	if float64(hs.size)/float64(hs.capacity) > hs.loadFactorThreshold {
		hs.resize()
	}
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

// Clear removes all elements
func (hs *HashSet) Clear() {
	hs.buckets = make([][]interface{}, hs.capacity)
	hs.size = 0
}
