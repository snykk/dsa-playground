package main

import (
	"testing"
)

func TestPutAndGet(t *testing.T) {
	table := NewHashTable(16)
	table.Put("apple", 5)
	table.Put("banana", 10)

	value, found := table.Get("apple")
	if !found || value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}

	value, found = table.Get("banana")
	if !found || value != 10 {
		t.Errorf("Expected 10, got %v", value)
	}
}

func TestUpdate(t *testing.T) {
	table := NewHashTable(16)
	table.Put("apple", 5)
	table.Put("apple", 10)

	value, found := table.Get("apple")
	if !found || value != 10 {
		t.Errorf("Expected 10, got %v", value)
	}

	if table.Size() != 1 {
		t.Errorf("Expected size 1, got %d", table.Size())
	}
}

func TestRemove(t *testing.T) {
	table := NewHashTable(16)
	table.Put("apple", 5)
	table.Put("banana", 10)

	if !table.Remove("apple") {
		t.Error("Expected remove to succeed")
	}

	_, found := table.Get("apple")
	if found {
		t.Error("Expected key to be removed")
	}

	if table.Size() != 1 {
		t.Errorf("Expected size 1, got %d", table.Size())
	}
}

func TestContains(t *testing.T) {
	table := NewHashTable(16)
	table.Put("apple", 5)

	if !table.Contains("apple") {
		t.Error("Expected to contain 'apple'")
	}

	if table.Contains("banana") {
		t.Error("Expected not to contain 'banana'")
	}
}

func TestEmptyTable(t *testing.T) {
	table := NewHashTable(16)
	if !table.IsEmpty() {
		t.Error("Expected table to be empty")
	}

	_, found := table.Get("key")
	if found {
		t.Error("Expected key not to be found")
	}
}

func TestChainLongerThanOne(t *testing.T) {
	// ints that are multiples of the capacity share bucket 0 (no resize below 12 of 16)
	table := NewHashTable(16)
	for k := 0; k < 64; k += 16 {
		table.Put(k, k*10)
	}
	if got := len(table.buckets[0]); got != 4 {
		t.Fatalf("bucket 0 holds %d pairs, want 4", got)
	}
	if v, _ := table.Get(32); v != 320 {
		t.Errorf("Get(32) = %v, want 320", v)
	}
	if !table.Remove(16) {
		t.Error("Remove(16) should succeed")
	}
	if v, _ := table.Get(48); v != 480 {
		t.Errorf("Get(48) = %v, want 480", v)
	}
	if table.Size() != 3 {
		t.Errorf("Size = %d, want 3", table.Size())
	}
}

func TestResizeKeepsEntries(t *testing.T) {
	table := NewHashTable(4)
	for k := 0; k < 100; k++ {
		table.Put(k, k)
	}
	if table.capacity <= 4 {
		t.Errorf("capacity %d did not grow", table.capacity)
	}
	for k := 0; k < 100; k++ {
		if v, ok := table.Get(k); !ok || v != k {
			t.Fatalf("Get(%d) = %v, %v", k, v, ok)
		}
	}
	if table.Size() != 100 {
		t.Errorf("Size = %d, want 100", table.Size())
	}
}

func TestNegativeIntKeys(t *testing.T) {
	// k % capacity is negative for negative k and used to panic with index out of range.
	table := NewHashTable(8)
	for _, k := range []int{-1, -8, -13} {
		table.Put(k, k)
	}
	for _, k := range []int{-1, -8, -13} {
		if v, ok := table.Get(k); !ok || v != k {
			t.Errorf("Get(%d) = %v, %v", k, v, ok)
		}
	}
}

func TestOtherKeyTypes(t *testing.T) {
	// The default case used to type-assert the key to uintptr and panic.
	table := NewHashTable(16)
	keys := []interface{}{int64(7), 2.5, true, 'x'}
	for i, k := range keys {
		table.Put(k, i)
	}
	for i, k := range keys {
		if v, ok := table.Get(k); !ok || v != i {
			t.Errorf("Get(%v) = %v, %v", k, v, ok)
		}
	}
	if table.Contains(7) {
		t.Error("int 7 is not int64 7")
	}
}
