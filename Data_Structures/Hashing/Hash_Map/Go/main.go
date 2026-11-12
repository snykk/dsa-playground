package main

import "fmt"

// KeyValue represents a key-value pair
type KeyValue struct {
	Key   interface{}
	Value interface{}
}

// HashTable represents a hash table with chaining
type HashTable struct {
	buckets             [][]KeyValue
	capacity            int
	size                int
	loadFactorThreshold float64
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
		h := k % ht.capacity
		if h < 0 {
			h += ht.capacity
		}
		return h
	case string:
		hashValue := 0
		for _, char := range k {
			hashValue = (hashValue*31 + int(char)) % ht.capacity
		}
		return hashValue
	default:
		// Any other key type (int64, float64, bool, ...) is hashed through its
		// printed form: type name plus value. It used to return 0 for all of
		// them, which put every such key in bucket 0.
		hashValue := 0
		for _, char := range fmt.Sprintf("%T:%v", key, key) {
			hashValue = (hashValue*31 + int(char)) % ht.capacity
		}
		return hashValue
	}
}

// Put inserts or updates a key-value pair
func (ht *HashTable) Put(key, value interface{}) {
	index := ht.hash(key)
	bucket := ht.buckets[index]

	for i, kv := range bucket {
		if kv.Key == key {
			bucket[i].Value = value
			return
		}
	}

	ht.buckets[index] = append(bucket, KeyValue{Key: key, Value: value})
	ht.size++

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

// Contains checks if key exists
func (ht *HashTable) Contains(key interface{}) bool {
	_, found := ht.Get(key)
	return found
}

// HashMap extends HashTable with additional features
type HashMap struct {
	*HashTable
}

// NewHashMap creates a new HashMap
func NewHashMap(capacity int) *HashMap {
	return &HashMap{HashTable: NewHashTable(capacity)}
}

// GetOrDefault returns value or default if key doesn't exist
func (hm *HashMap) GetOrDefault(key interface{}, defaultValue interface{}) interface{} {
	value, found := hm.Get(key)
	if found {
		return value
	}
	return defaultValue
}

// PutIfAbsent puts value only if key doesn't exist
func (hm *HashMap) PutIfAbsent(key, value interface{}) bool {
	if !hm.Contains(key) {
		hm.Put(key, value)
		return true
	}
	return false
}
