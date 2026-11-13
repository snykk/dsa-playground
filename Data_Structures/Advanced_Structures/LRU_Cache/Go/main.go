// Package main implements an LRU (Least Recently Used) Cache data structure.
//
// The cache stores a fixed number of key-value pairs and evicts the least
// recently used entry when capacity is exceeded. It uses a hash map for O(1)
// key lookup and a doubly linked list for O(1) insertion, deletion, and
// reordering.
package main

import "fmt"

// node is an internal doubly linked list node.
type node struct {
	key   int
	value int
	prev  *node
	next  *node
}

// LRUCache is a fixed-capacity cache that evicts least recently used entries.
type LRUCache struct {
	capacity int
	cache    map[int]*node
	head     *node // sentinel head (most recently used side)
	tail     *node // sentinel tail (least recently used side)
}

// NewLRUCache creates an LRU cache with the given capacity.
// Time: O(1), Space: O(capacity)
func NewLRUCache(capacity int) *LRUCache {
	head := &node{}
	tail := &node{}
	head.next = tail
	tail.prev = head
	return &LRUCache{
		capacity: capacity,
		cache:    make(map[int]*node),
		head:     head,
		tail:     tail,
	}
}

// Get returns the value for key, or -1 if not present.
// Accessing a key marks it as the most recently used.
// Time: O(1)
func (c *LRUCache) Get(key int) int {
	n, ok := c.cache[key]
	if !ok {
		return -1
	}
	c.remove(n)
	c.addToFront(n)
	return n.value
}

// Put inserts or updates the key-value pair.
// If at capacity and inserting a new key, the LRU entry is evicted.
// Time: O(1)
func (c *LRUCache) Put(key, value int) {
	if n, ok := c.cache[key]; ok {
		n.value = value
		c.remove(n)
		c.addToFront(n)
		return
	}

	n := &node{key: key, value: value}
	c.cache[key] = n
	c.addToFront(n)

	if len(c.cache) > c.capacity {
		lru := c.tail.prev
		c.remove(lru)
		delete(c.cache, lru.key)
	}
}

// Size returns the current number of entries in the cache.
// Time: O(1)
func (c *LRUCache) Size() int {
	return len(c.cache)
}

// remove detaches a node from its current position in the doubly linked list.
func (c *LRUCache) remove(n *node) {
	n.prev.next = n.next
	n.next.prev = n.prev
}

// addToFront inserts a node right after the sentinel head (most recently used).
func (c *LRUCache) addToFront(n *node) {
	n.prev = c.head
	n.next = c.head.next
	c.head.next.prev = n
	c.head.next = n
}

func main() {
	cache := NewLRUCache(3)
	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Put(3, 30)
	fmt.Printf("get(1) = %d\n", cache.Get(1)) // 10
	cache.Put(4, 40)                          // evicts key 2
	fmt.Printf("get(2) = %d\n", cache.Get(2)) // -1
	fmt.Printf("get(3) = %d\n", cache.Get(3)) // 30
	fmt.Printf("size   = %d\n", cache.Size()) // 3
}
