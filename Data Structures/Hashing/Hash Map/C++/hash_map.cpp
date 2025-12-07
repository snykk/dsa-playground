/**
 * Hash Map Implementation (C++)
 * 
 * Extended hash table with additional features
 */

#include "hash_table.cpp"
#include <map>
#include <iterator>

template<typename K, typename V>
class HashMap : public HashTable<K, V> {
public:
    using HashTable<K, V>::HashTable;
    
    V getOrDefault(const K& key, const V& defaultValue) {
        V* value = this->get(key);
        return value ? *value : defaultValue;
    }
    
    bool putIfAbsent(const K& key, const V& value) {
        if (!this->contains(key)) {
            this->put(key, value);
            return true;
        }
        return false;
    }
    
    void update(const std::map<K, V>& other) {
        for (const auto& pair : other) {
            this->put(pair.first, pair.second);
        }
    }
};

