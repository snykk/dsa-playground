// Package main implements an O(1) LFU (Least Frequently Used) cache.
//
// Internals:
//
//	keyToEntry : map[int]*entry          - O(1) key lookup
//	freqLists  : map[int]*list.List      - per-frequency DLL, MRU at front
//	minFreq    : int                     - smallest non-empty freq
package main

import (
	"container/list"
	"fmt"
)

type entry struct {
	key, value, freq int
	node             *list.Element // pointer into the per-freq DLL
}

// LFUCache is a fixed-capacity cache evicting the least-frequently-used
// item first, with LRU tiebreak.
type LFUCache struct {
	capacity   int
	size       int
	minFreq    int
	keyToEntry map[int]*entry
	freqLists  map[int]*list.List
}

// NewLFUCache constructs a cache with the given positive capacity.
// Capacity 0 is allowed and turns Get/Put into no-ops.
func NewLFUCache(capacity int) *LFUCache {
	if capacity < 0 {
		capacity = 0
	}
	return &LFUCache{
		capacity:   capacity,
		keyToEntry: make(map[int]*entry),
		freqLists:  make(map[int]*list.List),
	}
}

// Get returns the value for key, or -1 if absent. It is O(1).
func (c *LFUCache) Get(key int) int {
	if c.capacity == 0 {
		return -1
	}
	e, ok := c.keyToEntry[key]
	if !ok {
		return -1
	}
	c.promote(e)
	return e.value
}

// Put inserts or updates (key, value). It is O(1).
func (c *LFUCache) Put(key, value int) {
	if c.capacity == 0 {
		return
	}

	if e, ok := c.keyToEntry[key]; ok {
		e.value = value
		c.promote(e)
		return
	}

	if c.size >= c.capacity {
		c.evict()
	}

	lst := c.listFor(1)
	newEntry := &entry{key: key, value: value, freq: 1}
	newEntry.node = lst.PushFront(newEntry)
	c.keyToEntry[key] = newEntry
	c.minFreq = 1
	c.size++
}

func (c *LFUCache) promote(e *entry) {
	oldList := c.freqLists[e.freq]
	oldList.Remove(e.node)
	if oldList.Len() == 0 {
		delete(c.freqLists, e.freq)
		if c.minFreq == e.freq {
			c.minFreq = e.freq + 1
		}
	}
	e.freq++
	newList := c.listFor(e.freq)
	e.node = newList.PushFront(e)
}

func (c *LFUCache) evict() {
	lst := c.freqLists[c.minFreq]
	back := lst.Back()
	victim := back.Value.(*entry)
	lst.Remove(back)
	if lst.Len() == 0 {
		delete(c.freqLists, c.minFreq)
	}
	delete(c.keyToEntry, victim.key)
	c.size--
}

func (c *LFUCache) listFor(freq int) *list.List {
	lst, ok := c.freqLists[freq]
	if !ok {
		lst = list.New()
		c.freqLists[freq] = lst
	}
	return lst
}

func main() {
	cache := NewLFUCache(2)
	cache.Put(1, 1)
	cache.Put(2, 2)
	fmt.Println(cache.Get(1)) // 1
	cache.Put(3, 3)           // evicts 2
	fmt.Println(cache.Get(2)) // -1
	fmt.Println(cache.Get(3)) // 3
	cache.Put(4, 4)           // evicts 1
	fmt.Println(cache.Get(1)) // -1
	fmt.Println(cache.Get(3)) // 3
	fmt.Println(cache.Get(4)) // 4
}
