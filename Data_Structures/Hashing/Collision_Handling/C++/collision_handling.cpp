/**
 * Collision Handling Implementation (C++)
 * 
 * Demonstrates Chaining and Open Addressing (linear probing).
 * Neither table resizes and neither supports remove: capacity is fixed.
 */

#include <vector>
#include <list>
#include <string>
#include <utility>
#include <optional>
#include <functional>
#include <stdexcept>

// Chaining implementation
template<typename K, typename V>
class HashTableChaining {
private:
    std::vector<std::list<std::pair<K, V>>> buckets;
    size_t capacity;
    
public:
    HashTableChaining(size_t cap = 16) : capacity(cap) {
        if (cap == 0) throw std::invalid_argument("capacity must be positive");
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

    // Length of the longest chain (for tests and demos).
    size_t longestChain() const {
        size_t longest = 0;
        for (const auto& bucket : buckets) {
            if (bucket.size() > longest) longest = bucket.size();
        }
        return longest;
    }
};

// Open Addressing with Linear Probing
template<typename K, typename V>
class HashTableOpenAddressing {
private:
    // Slots are held by value: an empty optional is a free slot, so the
    // table owns nothing that needs a destructor and copies are deep.
    std::vector<std::optional<std::pair<K, V>>> buckets;
    size_t capacity;
    
public:
    HashTableOpenAddressing(size_t cap = 16) : capacity(cap) {
        if (cap == 0) throw std::invalid_argument("capacity must be positive");
        buckets.resize(capacity);
    }
    
    // Throws std::runtime_error if the key is new and every slot is taken.
    void put(const K& key, const V& value) {
        size_t index = std::hash<K>{}(key) % capacity;
        
        // Probe at most `capacity` slots: on a full table the walk must end.
        for (size_t attempt = 0; attempt < capacity; ++attempt) {
            auto& slot = buckets[index];
            if (!slot.has_value()) {
                slot.emplace(key, value);
                return;
            }
            if (slot->first == key) {
                slot->second = value;
                return;
            }
            index = (index + 1) % capacity;
        }
        throw std::runtime_error("Hash table is full");
    }
    
    V* get(const K& key) {
        size_t index = std::hash<K>{}(key) % capacity;
        
        for (size_t attempt = 0; attempt < capacity; ++attempt) {
            auto& slot = buckets[index];
            if (!slot.has_value()) {
                return nullptr;
            }
            if (slot->first == key) {
                return &slot->second;
            }
            index = (index + 1) % capacity;
        }
        return nullptr;  // walked the whole table without finding the key
    }
};
