package main

import "fmt"

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

// hash computes the bucket index for a key. Negative ints are folded into
// range, and every other key type is hashed through its printed form (type
// name plus value), so int64, float64, bool and friends work too.
func (ht *HashTable) hash(key interface{}) int {
	switch k := key.(type) {
	case int:
		return ((k % ht.capacity) + ht.capacity) % ht.capacity
	case string:
		return hashString(k, ht.capacity)
	default:
		return hashString(fmt.Sprintf("%T:%v", key, key), ht.capacity)
	}
}

func hashString(s string, capacity int) int {
	hashValue := 0
	for _, char := range s {
		hashValue = (hashValue*31 + int(char)) % capacity
	}
	return hashValue
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

// GetOrDefault returns the value for key, or defaultValue if the key is absent.
func (ht *HashTable) GetOrDefault(key, defaultValue interface{}) interface{} {
	if value, found := ht.Get(key); found {
		return value
	}
	return defaultValue
}

// PutIfAbsent stores value only if key is absent and reports whether it did.
func (ht *HashTable) PutIfAbsent(key, value interface{}) bool {
	if ht.Contains(key) {
		return false
	}
	ht.Put(key, value)
	return true
}

// Items returns every key-value pair in bucket order.
func (ht *HashTable) Items() []KeyValue {
	items := make([]KeyValue, 0, ht.size)
	for _, bucket := range ht.buckets {
		items = append(items, bucket...)
	}
	return items
}

// Update copies every pair of other into the table, overwriting existing keys.
func (ht *HashTable) Update(other *HashTable) {
	for _, kv := range other.Items() {
		ht.Put(kv.Key, kv.Value)
	}
}

// Copy returns an independent table with the same capacity and pairs.
func (ht *HashTable) Copy() *HashTable {
	clone := NewHashTable(ht.capacity)
	clone.Update(ht)
	return clone
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
