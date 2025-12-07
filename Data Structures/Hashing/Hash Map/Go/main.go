package main

import "hashtable"

// HashMap extends HashTable with additional features
type HashMap struct {
	*hashtable.HashTable
}

// NewHashMap creates a new HashMap
func NewHashMap(capacity int) *HashMap {
	return &HashMap{HashTable: hashtable.NewHashTable(capacity)}
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

