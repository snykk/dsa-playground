package main

// HashTableChaining uses chaining for collision handling
type HashTableChaining struct {
	buckets  [][]KeyValue
	capacity int
}

type KeyValue struct {
	Key   interface{}
	Value interface{}
}

func NewHashTableChaining(capacity int) *HashTableChaining {
	return &HashTableChaining{
		buckets:  make([][]KeyValue, capacity),
		capacity: capacity,
	}
}

func (ht *HashTableChaining) hash(key interface{}) int {
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
		return int(uintptr(interface{}(key).(uintptr))) % ht.capacity
	}
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

func NewHashTableOpenAddressing(capacity int) *HashTableOpenAddressing {
	return &HashTableOpenAddressing{
		buckets:  make([]*KeyValue, capacity),
		capacity: capacity,
	}
}

func (ht *HashTableOpenAddressing) hash(key interface{}) int {
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
		return int(uintptr(interface{}(key).(uintptr))) % ht.capacity
	}
}

func (ht *HashTableOpenAddressing) Put(key, value interface{}) {
	index := ht.hash(key)

	for ht.buckets[index] != nil && ht.buckets[index].Key != key {
		index = (index + 1) % ht.capacity
	}

	if ht.buckets[index] == nil {
		ht.buckets[index] = &KeyValue{Key: key, Value: value}
	} else {
		ht.buckets[index].Value = value
	}
}

func (ht *HashTableOpenAddressing) Get(key interface{}) (interface{}, bool) {
	index := ht.hash(key)

	for ht.buckets[index] != nil {
		if ht.buckets[index].Key == key {
			return ht.buckets[index].Value, true
		}
		index = (index + 1) % ht.capacity
	}
	return nil, false
}

