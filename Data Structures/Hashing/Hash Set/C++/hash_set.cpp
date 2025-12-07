/**
 * Hash Set Implementation (C++)
 * 
 * Stores unique elements using hash table
 */

#include <vector>
#include <list>
#include <functional>

template<typename K>
class HashSet {
private:
    std::vector<std::list<K>> buckets;
    size_t capacity;
    size_t size;
    double load_factor_threshold;
    std::hash<K> hasher;
    
    size_t hash(const K& key) {
        return hasher(key) % capacity;
    }
    
public:
    HashSet(size_t cap = 16) 
        : capacity(cap), size(0), load_factor_threshold(0.75) {
        buckets.resize(capacity);
    }
    
    bool add(const K& key) {
        size_t index = hash(key);
        auto& bucket = buckets[index];
        
        for (const K& k : bucket) {
            if (k == key) return false;
        }
        
        bucket.push_back(key);
        size++;
        return true;
    }
    
    bool remove(const K& key) {
        size_t index = hash(key);
        auto& bucket = buckets[index];
        
        for (auto it = bucket.begin(); it != bucket.end(); ++it) {
            if (*it == key) {
                bucket.erase(it);
                size--;
                return true;
            }
        }
        return false;
    }
    
    bool contains(const K& key) {
        size_t index = hash(key);
        auto& bucket = buckets[index];
        
        for (const K& k : bucket) {
            if (k == key) return true;
        }
        return false;
    }
    
    size_t getSize() const { return size; }
    bool isEmpty() const { return size == 0; }
    
    void clear() {
        for (auto& bucket : buckets) {
            bucket.clear();
        }
        size = 0;
    }
};

