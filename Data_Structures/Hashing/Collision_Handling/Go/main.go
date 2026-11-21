package main

import "fmt"

// hashKey maps a key to a bucket index in [0, capacity). Negative ints are
// folded into range, strings are hashed directly, and every other key type is
// hashed through its printed form (type name plus value), so int64, float64,
// bool and friends work too.
func hashKey(key interface{}, capacity int) int {
	switch k := key.(type) {
	case int:
		return ((k % capacity) + capacity) % capacity
	case string:
		return hashString(k, capacity)
	default:
		return hashString(fmt.Sprintf("%T:%v", key, key), capacity)
	}
}

func hashString(s string, capacity int) int {
	hashValue := 0
	for _, char := range s {
		hashValue = (hashValue*31 + int(char)) % capacity
	}
	return hashValue
}

// HashTableChaining uses chaining for collision handling
type HashTableChaining struct {
	buckets  [][]KeyValue
	capacity int
}

type KeyValue struct {
	Key   interface{}
	Value interface{}
}

// NewHashTableChaining creates a table with the given number of buckets
// (a capacity of 0 or less becomes 16).
func NewHashTableChaining(capacity int) *HashTableChaining {
	if capacity <= 0 {
		capacity = 16
	}
	return &HashTableChaining{
		buckets:  make([][]KeyValue, capacity),
		capacity: capacity,
	}
}

func (ht *HashTableChaining) hash(key interface{}) int {
	return hashKey(key, ht.capacity)
}

func (ht *HashTableChaining) Put(key, value interface{}) {
	index := ht.hash(key)
	bucket := ht.buckets[index]

	for i, kv := range bucket {
		if kv.Key == key {
			bucket[i].Value = value
			return
		}
	}

	ht.buckets[index] = append(bucket, KeyValue{Key: key, Value: value})
}

func (ht *HashTableChaining) Get(key interface{}) (interface{}, bool) {
	index := ht.hash(key)
	bucket := ht.buckets[index]

	for _, kv := range bucket {
		if kv.Key == key {
			return kv.Value, true
		}
	}
	return nil, false
}

// HashTableOpenAddressing uses linear probing
type HashTableOpenAddressing struct {
	buckets  []*KeyValue
	capacity int
}

// NewHashTableOpenAddressing creates a table with the given number of slots
// (a capacity of 0 or less becomes 16).
func NewHashTableOpenAddressing(capacity int) *HashTableOpenAddressing {
	if capacity <= 0 {
		capacity = 16
	}
	return &HashTableOpenAddressing{
		buckets:  make([]*KeyValue, capacity),
		capacity: capacity,
	}
}

func (ht *HashTableOpenAddressing) hash(key interface{}) int {
	return hashKey(key, ht.capacity)
}

// Put inserts or updates a key. It panics if the key is new and every slot is taken.
func (ht *HashTableOpenAddressing) Put(key, value interface{}) {
	index := ht.hash(key)

	// Probe at most capacity slots: on a full table the walk must end.
	for attempt := 0; attempt < ht.capacity; attempt++ {
		if ht.buckets[index] == nil {
			ht.buckets[index] = &KeyValue{Key: key, Value: value}
			return
		}
		if ht.buckets[index].Key == key {
			ht.buckets[index].Value = value
			return
		}
		index = (index + 1) % ht.capacity
	}
	panic("hash table is full")
}

func (ht *HashTableOpenAddressing) Get(key interface{}) (interface{}, bool) {
	index := ht.hash(key)

	for attempt := 0; attempt < ht.capacity && ht.buckets[index] != nil; attempt++ {
		if ht.buckets[index].Key == key {
			return ht.buckets[index].Value, true
		}
		index = (index + 1) % ht.capacity
	}
	return nil, false
}
