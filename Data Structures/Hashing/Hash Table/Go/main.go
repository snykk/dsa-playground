package main

// HashTable represents a hash table with chaining
type HashTable struct {
	buckets             [][]KeyValue
	capacity            int
	size                int
	loadFactorThreshold float64
}

// KeyValue represents a key-value pair
type KeyValue struct {
	Key   interface{}
	Value interface{}
}

// NewHashTable creates a new hash table with given capacity
func NewHashTable(capacity int) *HashTable {
	if capacity <= 0 {
		capacity = 16
	}
	return &HashTable{
		buckets:             make([][]KeyValue, capacity),
		capacity:            capacity,
		size:                0,
		loadFactorThreshold: 0.75,
	}
}

// hash computes hash value for a key
func (ht *HashTable) hash(key interface{}) int {
	switch k := key.(type) {
	case int:
		return k % ht.capacity
	case string:
		hashValue := 0
		for _, char := range k {
			hashValue = (hashValue*31 + int(char)) % ht.capacity
		}
		return hashValue
	default:
		// Use type assertion to get hash code
		return int(uintptr(interface{}(key).(uintptr))) % ht.capacity
	}
}

// Put inserts or updates a key-value pair
func (ht *HashTable) Put(key, value interface{}) {
	index := ht.hash(key)
	bucket := ht.buckets[index]

	// Check if key exists
	for i, kv := range bucket {
		if kv.Key == key {
			bucket[i].Value = value
			return
		}
	}

	// Add new key-value pair
	ht.buckets[index] = append(bucket, KeyValue{Key: key, Value: value})
	ht.size++

	// Check if resize is needed
	if float64(ht.size)/float64(ht.capacity) > ht.loadFactorThreshold {
		ht.resize()
	}
}

// resize doubles the capacity and rehashes all entries
func (ht *HashTable) resize() {
	oldBuckets := ht.buckets
	ht.capacity *= 2
	ht.buckets = make([][]KeyValue, ht.capacity)
	ht.size = 0

	for _, bucket := range oldBuckets {
		for _, kv := range bucket {
			ht.Put(kv.Key, kv.Value)
		}
	}
}

// Get retrieves value for a key
func (ht *HashTable) Get(key interface{}) (interface{}, bool) {
	index := ht.hash(key)
	bucket := ht.buckets[index]

	for _, kv := range bucket {
		if kv.Key == key {
			return kv.Value, true
		}
	}
	return nil, false
}

// Remove removes a key-value pair
func (ht *HashTable) Remove(key interface{}) bool {
	index := ht.hash(key)
	bucket := ht.buckets[index]

	for i, kv := range bucket {
		if kv.Key == key {
			ht.buckets[index] = append(bucket[:i], bucket[i+1:]...)
			ht.size--
			return true
		}
	}
	return false
}

// Contains checks if key exists
func (ht *HashTable) Contains(key interface{}) bool {
	_, found := ht.Get(key)
	return found
}

// Size returns the number of key-value pairs
func (ht *HashTable) Size() int {
	return ht.size
}

// IsEmpty checks if hash table is empty
func (ht *HashTable) IsEmpty() bool {
	return ht.size == 0
}

// Clear removes all entries
func (ht *HashTable) Clear() {
	ht.buckets = make([][]KeyValue, ht.capacity)
	ht.size = 0
}
