/**
 * Collision Handling Implementation (C++)
 * 
 * Demonstrates Chaining and Open Addressing
 */

#include <vector>
#include <list>

// Chaining implementation
template<typename K, typename V>
class HashTableChaining {
private:
    std::vector<std::list<std::pair<K, V>>> buckets;
    size_t capacity;
    
public:
    HashTableChaining(size_t cap = 16) : capacity(cap) {
        buckets.resize(capacity);
    }
    
    void put(const K& key, const V& value) {
        size_t index = std::hash<K>{}(key) % capacity;
        auto& bucket = buckets[index];
        
        for (auto& pair : bucket) {
            if (pair.first == key) {
                pair.second = value;
                return;
            }
        }
        bucket.emplace_back(key, value);
    }
    
    V* get(const K& key) {
        size_t index = std::hash<K>{}(key) % capacity;
        auto& bucket = buckets[index];
        
        for (auto& pair : bucket) {
            if (pair.first == key) {
                return &pair.second;
            }
        }
        return nullptr;
    }
};

// Open Addressing with Linear Probing
template<typename K, typename V>
class HashTableOpenAddressing {
private:
    std::vector<std::pair<K, V>*> buckets;
    size_t capacity;
    static constexpr K DELETED_KEY = K{};
    
public:
    HashTableOpenAddressing(size_t cap = 16) : capacity(cap) {
        buckets.resize(capacity, nullptr);
    }
    
    void put(const K& key, const V& value) {
        size_t index = std::hash<K>{}(key) % capacity;
        
        while (buckets[index] != nullptr && buckets[index]->first != key) {
            index = (index + 1) % capacity;
        }
        
        if (buckets[index] == nullptr) {
            buckets[index] = new std::pair<K, V>(key, value);
        } else {
            buckets[index]->second = value;
        }
    }
    
    V* get(const K& key) {
        size_t index = std::hash<K>{}(key) % capacity;
        
        while (buckets[index] != nullptr) {
            if (buckets[index]->first == key) {
                return &buckets[index]->second;
            }
            index = (index + 1) % capacity;
        }
        return nullptr;
    }
};

