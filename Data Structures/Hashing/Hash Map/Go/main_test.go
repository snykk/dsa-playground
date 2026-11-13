package main

import (
	"testing"
)

func TestGetOrDefault(t *testing.T) {
	hm := NewHashMap(16)
	hm.Put("apple", 5)

	value := hm.GetOrDefault("apple", 0)
	if value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}

	value = hm.GetOrDefault("nonexistent", 0)
	if value != 0 {
		t.Errorf("Expected 0, got %v", value)
	}
}

func TestPutIfAbsent(t *testing.T) {
	hm := NewHashMap(16)

	if !hm.PutIfAbsent("apple", 5) {
		t.Error("Expected put to succeed")
	}

	if hm.PutIfAbsent("apple", 10) {
		t.Error("Expected put to fail")
	}

	value, _ := hm.Get("apple")
	if value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}
}

func TestOtherKeyTypesSpreadAcrossBuckets(t *testing.T) {
	// The default hash case used to return 0, so every float64 key sat in bucket 0.
	hm := NewHashMap(16)
	for i := 0; i < 1000; i++ {
		hm.Put(float64(i)+0.5, i)
	}
	longest := 0
	for _, bucket := range hm.buckets {
		if len(bucket) > longest {
			longest = len(bucket)
		}
	}
	if longest > 20 {
		t.Errorf("longest bucket holds %d of 1000 float64 keys", longest)
	}
	for i := 0; i < 1000; i++ {
		if v, ok := hm.Get(float64(i) + 0.5); !ok || v != i {
			t.Fatalf("Get(%v) = %v, %v", float64(i)+0.5, v, ok)
		}
	}
}

func TestNegativeIntKeys(t *testing.T) {
	hm := NewHashMap(8)
	hm.Put(-1, "a")
	hm.Put(-9, "b")
	if v := hm.GetOrDefault(-1, ""); v != "a" {
		t.Errorf("Get(-1) = %v", v)
	}
	if v := hm.GetOrDefault(-9, ""); v != "b" {
		t.Errorf("Get(-9) = %v", v)
	}
}
