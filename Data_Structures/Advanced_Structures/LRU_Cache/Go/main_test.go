package main

import "testing"

func TestBasicGetPut(t *testing.T) {
	cache := NewLRUCache(2)
	cache.Put(1, 10)
	cache.Put(2, 20)
	if v := cache.Get(1); v != 10 {
		t.Errorf("Expected get(1)=10, got %d", v)
	}
	if v := cache.Get(2); v != 20 {
		t.Errorf("Expected get(2)=20, got %d", v)
	}
}

func TestGetNonexistentKey(t *testing.T) {
	cache := NewLRUCache(2)
	if v := cache.Get(99); v != -1 {
		t.Errorf("Expected -1 for missing key, got %d", v)
	}
	cache.Put(1, 10)
	if v := cache.Get(5); v != -1 {
		t.Errorf("Expected -1 for missing key, got %d", v)
	}
}

func TestEvictsLRU(t *testing.T) {
	cache := NewLRUCache(2)
	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Put(3, 30) // evicts key 1
	if v := cache.Get(1); v != -1 {
		t.Errorf("Expected key 1 evicted, got %d", v)
	}
	if v := cache.Get(2); v != 20 {
		t.Errorf("Expected get(2)=20, got %d", v)
	}
	if v := cache.Get(3); v != 30 {
		t.Errorf("Expected get(3)=30, got %d", v)
	}
}

func TestMultipleEvictions(t *testing.T) {
	cache := NewLRUCache(2)
	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Put(3, 30) // evicts key 1
	cache.Put(4, 40) // evicts key 2
	if v := cache.Get(1); v != -1 {
		t.Errorf("Expected key 1 evicted, got %d", v)
	}
	if v := cache.Get(2); v != -1 {
		t.Errorf("Expected key 2 evicted, got %d", v)
	}
	if v := cache.Get(3); v != 30 {
		t.Errorf("Expected get(3)=30, got %d", v)
	}
	if v := cache.Get(4); v != 40 {
		t.Errorf("Expected get(4)=40, got %d", v)
	}
}

func TestEvictionRespectsAccessOrder(t *testing.T) {
	cache := NewLRUCache(2)
	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Get(1)     // 1 is now most recently used
	cache.Put(3, 30) // evicts key 2, not key 1
	if v := cache.Get(1); v != 10 {
		t.Errorf("Expected get(1)=10, got %d", v)
	}
	if v := cache.Get(2); v != -1 {
		t.Errorf("Expected key 2 evicted, got %d", v)
	}
	if v := cache.Get(3); v != 30 {
		t.Errorf("Expected get(3)=30, got %d", v)
	}
}

func TestUpdateExistingKey(t *testing.T) {
	cache := NewLRUCache(2)
	cache.Put(1, 10)
	cache.Put(1, 100)
	if v := cache.Get(1); v != 100 {
		t.Errorf("Expected updated value 100, got %d", v)
	}
}

func TestUpdateMovesToFront(t *testing.T) {
	cache := NewLRUCache(2)
	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Put(1, 100) // updates key 1, moves to front
	cache.Put(3, 30)  // evicts key 2, not key 1
	if v := cache.Get(1); v != 100 {
		t.Errorf("Expected get(1)=100, got %d", v)
	}
	if v := cache.Get(2); v != -1 {
		t.Errorf("Expected key 2 evicted, got %d", v)
	}
	if v := cache.Get(3); v != 30 {
		t.Errorf("Expected get(3)=30, got %d", v)
	}
}

func TestUpdateDoesNotChangeSize(t *testing.T) {
	cache := NewLRUCache(2)
	cache.Put(1, 10)
	cache.Put(2, 20)
	if s := cache.Size(); s != 2 {
		t.Errorf("Expected size 2, got %d", s)
	}
	cache.Put(1, 100)
	if s := cache.Size(); s != 2 {
		t.Errorf("Expected size 2 after update, got %d", s)
	}
}

func TestGetMovesToFront(t *testing.T) {
	cache := NewLRUCache(3)
	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Put(3, 30)
	cache.Get(1)     // 1 is now most recently used
	cache.Put(4, 40) // evicts key 2
	if v := cache.Get(1); v != 10 {
		t.Errorf("Expected get(1)=10, got %d", v)
	}
	if v := cache.Get(2); v != -1 {
		t.Errorf("Expected key 2 evicted, got %d", v)
	}
}

func TestGetReordersCorrectly(t *testing.T) {
	cache := NewLRUCache(3)
	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Put(3, 30)
	cache.Get(1)     // order: 1, 3, 2
	cache.Get(2)     // order: 2, 1, 3
	cache.Put(4, 40) // evicts key 3
	if v := cache.Get(3); v != -1 {
		t.Errorf("Expected key 3 evicted, got %d", v)
	}
	if v := cache.Get(1); v != 10 {
		t.Errorf("Expected get(1)=10, got %d", v)
	}
	if v := cache.Get(2); v != 20 {
		t.Errorf("Expected get(2)=20, got %d", v)
	}
	if v := cache.Get(4); v != 40 {
		t.Errorf("Expected get(4)=40, got %d", v)
	}
}

func TestCapacityOne(t *testing.T) {
	cache := NewLRUCache(1)
	cache.Put(1, 10)
	if v := cache.Get(1); v != 10 {
		t.Errorf("Expected get(1)=10, got %d", v)
	}

	cache.Put(2, 20) // evicts key 1
	if v := cache.Get(1); v != -1 {
		t.Errorf("Expected key 1 evicted, got %d", v)
	}
	if v := cache.Get(2); v != 20 {
		t.Errorf("Expected get(2)=20, got %d", v)
	}

	cache.Put(2, 200)
	if v := cache.Get(2); v != 200 {
		t.Errorf("Expected updated value 200, got %d", v)
	}
	if s := cache.Size(); s != 1 {
		t.Errorf("Expected size 1, got %d", s)
	}
}

func TestSizeGrows(t *testing.T) {
	cache := NewLRUCache(3)
	if s := cache.Size(); s != 0 {
		t.Errorf("Expected size 0, got %d", s)
	}
	cache.Put(1, 10)
	if s := cache.Size(); s != 1 {
		t.Errorf("Expected size 1, got %d", s)
	}
	cache.Put(2, 20)
	if s := cache.Size(); s != 2 {
		t.Errorf("Expected size 2, got %d", s)
	}
	cache.Put(3, 30)
	if s := cache.Size(); s != 3 {
		t.Errorf("Expected size 3, got %d", s)
	}
}

func TestSizeDoesNotExceedCapacity(t *testing.T) {
	cache := NewLRUCache(2)
	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Put(3, 30)
	if s := cache.Size(); s != 2 {
		t.Errorf("Expected size 2, got %d", s)
	}
}

func TestCapacityZeroAndNegativeStoreNothing(t *testing.T) {
	for _, capacity := range []int{0, -1} {
		cache := NewLRUCache(capacity)
		cache.Put(1, 10)
		if cache.Size() != 0 || cache.Get(1) != -1 {
			t.Errorf("capacity %d should store nothing", capacity)
		}
	}
}
