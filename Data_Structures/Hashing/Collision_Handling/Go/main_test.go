package main

import (
	"testing"
)

func TestChaining(t *testing.T) {
	table := NewHashTableChaining(16)
	table.Put("apple", 5)
	table.Put("banana", 10)

	value, found := table.Get("apple")
	if !found || value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}
}

func TestOpenAddressing(t *testing.T) {
	table := NewHashTableOpenAddressing(16)
	table.Put("apple", 5)
	table.Put("banana", 10)

	value, found := table.Get("apple")
	if !found || value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}
}

func TestChainingCollisions(t *testing.T) {
	// Integer keys that are multiples of the capacity share bucket 0.
	table := NewHashTableChaining(8)
	for k := 0; k < 32; k += 8 {
		table.Put(k, k*10)
	}
	if got := len(table.buckets[0]); got != 4 {
		t.Fatalf("bucket 0 holds %d pairs, want 4", got)
	}
	for k := 0; k < 32; k += 8 {
		if v, ok := table.Get(k); !ok || v != k*10 {
			t.Errorf("Get(%d) = %v, %v", k, v, ok)
		}
	}
	table.Put(16, -1)
	if v, _ := table.Get(16); v != -1 {
		t.Errorf("update through the chain failed: %v", v)
	}
	if _, ok := table.Get(40); ok {
		t.Error("40 was never inserted")
	}
}

func TestOpenAddressingFullTable(t *testing.T) {
	// A full table used to hang Put (new key) and Get (missing key).
	table := NewHashTableOpenAddressing(4)
	for k := 0; k < 4; k++ {
		table.Put(k, k)
	}
	if _, ok := table.Get(100); ok {
		t.Error("100 was never inserted")
	}
	table.Put(2, 22) // updating an existing key still works
	if v, _ := table.Get(2); v != 22 {
		t.Errorf("Get(2) = %v, want 22", v)
	}
	defer func() {
		if recover() == nil {
			t.Error("Put of a new key into a full table should panic")
		}
	}()
	table.Put(100, 1)
}

func TestOpenAddressingWrapAround(t *testing.T) {
	table := NewHashTableOpenAddressing(4)
	// 3, 7, 11 and 15 all start at slot 3 and wrap around to 0, 1, 2.
	for _, k := range []int{3, 7, 11, 15} {
		table.Put(k, k)
	}
	for _, k := range []int{3, 7, 11, 15} {
		if v, ok := table.Get(k); !ok || v != k {
			t.Errorf("Get(%d) = %v, %v", k, v, ok)
		}
	}
}

func TestNegativeIntKeys(t *testing.T) {
	// k % capacity is negative for negative k and used to panic with index out of range.
	chain := NewHashTableChaining(8)
	open := NewHashTableOpenAddressing(8)
	for _, k := range []int{-1, -8, -13} {
		chain.Put(k, k)
		open.Put(k, k)
	}
	for _, k := range []int{-1, -8, -13} {
		if v, ok := chain.Get(k); !ok || v != k {
			t.Errorf("chaining Get(%d) = %v, %v", k, v, ok)
		}
		if v, ok := open.Get(k); !ok || v != k {
			t.Errorf("open addressing Get(%d) = %v, %v", k, v, ok)
		}
	}
}

func TestOtherKeyTypes(t *testing.T) {
	// The default case used to type-assert the key to uintptr and panic.
	chain := NewHashTableChaining(16)
	open := NewHashTableOpenAddressing(16)
	keys := []interface{}{int64(7), 2.5, true, 'x'}
	for i, k := range keys {
		chain.Put(k, i)
		open.Put(k, i)
	}
	for i, k := range keys {
		if v, ok := chain.Get(k); !ok || v != i {
			t.Errorf("chaining Get(%v) = %v, %v", k, v, ok)
		}
		if v, ok := open.Get(k); !ok || v != i {
			t.Errorf("open addressing Get(%v) = %v, %v", k, v, ok)
		}
	}
	// int64(7) and int(7) are different keys.
	if _, ok := chain.Get(7); ok {
		t.Error("int 7 is not int64 7")
	}
}

func TestNonPositiveCapacityDefaults(t *testing.T) {
	for _, c := range []int{0, -3} {
		chain := NewHashTableChaining(c)
		open := NewHashTableOpenAddressing(c)
		chain.Put(1, 1)
		open.Put(1, 1)
		if _, ok := chain.Get(1); !ok {
			t.Errorf("chaining capacity %d", c)
		}
		if _, ok := open.Get(1); !ok {
			t.Errorf("open addressing capacity %d", c)
		}
	}
}
