/**
 * LRU (Least Recently Used) Cache (C++)
 *
 * Fixed-capacity cache that evicts the least recently used entry when full.
 * Uses an unordered_map for O(1) key lookup and a doubly linked list
 * (std::list) for O(1) insertion, deletion, and reordering.
 */

#include <unordered_map>
#include <list>
#include <utility>

class LRUCache {
private:
    int capacity;
    // Doubly linked list of (key, value) pairs.
    // Front = most recently used, Back = least recently used.
    std::list<std::pair<int, int>> dll;
    // Map from key to iterator into the doubly linked list.
    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> cache;

public:
    /**
     * Initialize the cache with a fixed capacity.
     * Time:  O(1)
     * Space: O(capacity)
     */
    LRUCache(int capacity) : capacity(capacity) {}

    /**
     * Return the value for key, or -1 if not present.
     * Accessing a key marks it as the most recently used.
     * Time: O(1)
     */
    int get(int key) {
        auto it = cache.find(key);
        if (it == cache.end()) {
            return -1;
        }

        // Move the accessed node to the front of the list.
        dll.splice(dll.begin(), dll, it->second);
        return it->second->second;
    }

    /**
     * Insert or update the key-value pair.
     * If at capacity and inserting a new key, the LRU entry is evicted.
     * Time: O(1)
     */
    void put(int key, int value) {
        auto it = cache.find(key);

        if (it != cache.end()) {
            // Key exists -- update value and move to front.
            it->second->second = value;
            dll.splice(dll.begin(), dll, it->second);
            return;
        }

        // Evict the LRU entry if at capacity.
        if ((int)cache.size() == capacity) {
            int lruKey = dll.back().first;
            dll.pop_back();
            cache.erase(lruKey);
        }

        // Insert new entry at the front.
        dll.emplace_front(key, value);
        cache[key] = dll.begin();
    }

    /**
     * Return the current number of entries in the cache.
     * Time: O(1)
     */
    int size() const {
        return (int)cache.size();
    }
};
