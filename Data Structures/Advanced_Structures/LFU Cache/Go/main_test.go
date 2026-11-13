package main

import "testing"

func TestMissReturnsMinusOne(t *testing.T) {
	c := NewLFUCache(2)
	if got := c.Get(1); got != -1 {
		t.Errorf("Get on empty cache: got %d, want -1", got)
	}
}

func TestBasicPutGet(t *testing.T) {
	c := NewLFUCache(2)
	c.Put(1, 10)
	c.Put(2, 20)
	if got := c.Get(1); got != 10 {
		t.Errorf("Get(1) = %d, want 10", got)
	}
	if got := c.Get(2); got != 20 {
		t.Errorf("Get(2) = %d, want 20", got)
	}
}

func TestEvictionLeastFrequentFirst(t *testing.T) {
	c := NewLFUCache(2)
	c.Put(1, 10)
	c.Put(2, 20)
	c.Get(1)     // freq(1)=2, freq(2)=1
	c.Put(3, 30) // evicts 2
	if got := c.Get(2); got != -1 {
		t.Errorf("expected 2 evicted, got %d", got)
	}
	if got := c.Get(1); got != 10 {
		t.Errorf("Get(1) = %d, want 10", got)
	}
	if got := c.Get(3); got != 30 {
		t.Errorf("Get(3) = %d, want 30", got)
	}
}

func TestEvictionTieBrokenByLRU(t *testing.T) {
	c := NewLFUCache(2)
	c.Put(1, 10)
	c.Put(2, 20)
	c.Put(3, 30) // both freq=1, 1 is LRU -> evict 1
	if got := c.Get(1); got != -1 {
		t.Errorf("expected 1 evicted, got %d", got)
	}
	if got := c.Get(2); got != 20 {
		t.Errorf("Get(2) = %d, want 20", got)
	}
}

func TestUpdateValueDoesNotEvict(t *testing.T) {
	c := NewLFUCache(2)
	c.Put(1, 10)
	c.Put(2, 20)
	c.Put(1, 100)
	if got := c.Get(1); got != 100 {
		t.Errorf("Get(1) = %d, want 100", got)
	}
	if got := c.Get(2); got != 20 {
		t.Errorf("Get(2) = %d, want 20", got)
	}
}

func TestUpdatePromotesFrequency(t *testing.T) {
	c := NewLFUCache(2)
	c.Put(1, 10)
	c.Put(2, 20)
	c.Put(1, 100) // freq(1)=2, freq(2)=1
	c.Put(3, 30)  // evicts 2
	if got := c.Get(2); got != -1 {
		t.Errorf("expected 2 evicted, got %d", got)
	}
	if got := c.Get(1); got != 100 {
		t.Errorf("Get(1) = %d, want 100", got)
	}
}

func TestCapacityZero(t *testing.T) {
	c := NewLFUCache(0)
	c.Put(1, 10)
	if got := c.Get(1); got != -1 {
		t.Errorf("zero-capacity Get = %d, want -1", got)
	}
}

func TestCapacityOne(t *testing.T) {
	c := NewLFUCache(1)
	c.Put(1, 10)
	if got := c.Get(1); got != 10 {
		t.Errorf("Get(1) = %d, want 10", got)
	}
	c.Put(2, 20)
	if got := c.Get(1); got != -1 {
		t.Errorf("expected 1 evicted, got %d", got)
	}
}

func TestLeetCodeOfficialTrace(t *testing.T) {
	c := NewLFUCache(2)
	c.Put(1, 1)
	c.Put(2, 2)
	if got := c.Get(1); got != 1 {
		t.Errorf("Get(1) = %d, want 1", got)
	}
	c.Put(3, 3) // evicts 2
	if got := c.Get(2); got != -1 {
		t.Errorf("expected 2 evicted, got %d", got)
	}
	if got := c.Get(3); got != 3 {
		t.Errorf("Get(3) = %d, want 3", got)
	}
	c.Put(4, 4) // evicts 1
	if got := c.Get(1); got != -1 {
		t.Errorf("expected 1 evicted, got %d", got)
	}
	if got := c.Get(3); got != 3 {
		t.Errorf("Get(3) = %d, want 3", got)
	}
	if got := c.Get(4); got != 4 {
		t.Errorf("Get(4) = %d, want 4", got)
	}
}
