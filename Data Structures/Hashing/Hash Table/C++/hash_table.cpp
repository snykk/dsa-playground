/**
 * Hash Table Implementation (C++)
 * 
 * A data structure that implements an associative array,
 * mapping keys to values using a hash function.
 */

#include <iostream>
#include <vector>
#include <list>
#include <string>
#include <functional>

template<typename K, typename V>
class HashTable {
private:
    struct KeyValue {
        K key;
        V value;
        KeyValue(const K& k, const V& v) : key(k), value(v) {}
    };
    
    std::vector<std::list<KeyValue>> buckets;
    size_t capacity;
    size_t size;
    double load_factor_threshold;
    std::hash<K> hasher;
    
    size_t hash(const K& key) {
        return hasher(key) % capacity;
    }
    
    void resize() {
        std::vector<std::list<KeyValue>> old_buckets = buckets;
        capacity *= 2;
        buckets.clear();
        buckets.resize(capacity);
        size = 0;
        
        for (auto& bucket : old_buckets) {
            for (auto& kv : bucket) {
                put(kv.key, kv.value);
            }
        }
    }
    
public:
    HashTable(size_t cap = 16) 
        : capacity(cap), size(0), load_factor_threshold(0.75) {
        buckets.resize(capacity);
    }
    
    void put(const K& key, const V& value) {
        size_t index = hash(key);
        auto& bucket = buckets[index];
        
        // Check if key exists
        for (auto& kv : bucket) {
            if (kv.key == key) {
                kv.value = value;
                return;
            }
        }
        
        // Add new key-value pair
        bucket.emplace_back(key, value);
        size++;
        
        // Check if resize is needed
        if ((double)size / capacity > load_factor_threshold) {
            resize();
        }
    }
    
    V* get(const K& key) {
        size_t index = hash(key);
        auto& bucket = buckets[index];
        
        for (auto& kv : bucket) {
            if (kv.key == key) {
                return &kv.value;
            }
        }
        return nullptr;
    }
    
    bool remove(const K& key) {
        size_t index = hash(key);
        auto& bucket = buckets[index];
        
        for (auto it = bucket.begin(); it != bucket.end(); ++it) {
            if (it->key == key) {
                bucket.erase(it);
                size--;
                return true;
            }
        }
        return false;
    }
    
    bool contains(const K& key) {
        return get(key) != nullptr;
    }
    
    size_t getSize() const {
        return size;
    }
    
    bool isEmpty() const {
        return size == 0;
    }
    
    void clear() {
        for (auto& bucket : buckets) {
            bucket.clear();
        }
        size = 0;
    }
};

// Specialization for string keys
template<>
size_t HashTable<std::string, std::string>::hash(const std::string& key) {
    size_t hash_value = 0;
    for (char c : key) {
        hash_value = (hash_value * 31 + c) % capacity;
    }
    return hash_value;
}

