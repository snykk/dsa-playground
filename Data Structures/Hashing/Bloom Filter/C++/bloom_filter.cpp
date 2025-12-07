/**
 * Bloom Filter Implementation (C++)
 * 
 * Probabilistic data structure for membership testing
 */

#include <vector>
#include <bitset>
#include <functional>
#include <cmath>

class BloomFilter {
private:
    std::vector<bool> bits;
    size_t num_bits;
    size_t num_hashes;
    size_t capacity;
    
    size_t hash1(const std::string& item, size_t i) {
        std::hash<std::string> hasher;
        return (hasher(item) + i * hasher(item + std::to_string(i))) % num_bits;
    }
    
public:
    BloomFilter(size_t cap, double error_rate = 0.01) : capacity(cap) {
        num_bits = static_cast<size_t>(-cap * log(error_rate) / (log(2) * log(2)));
        num_hashes = static_cast<size_t>(num_bits * log(2) / cap);
        bits.resize(num_bits, false);
    }
    
    void add(const std::string& item) {
        for (size_t i = 0; i < num_hashes; ++i) {
            size_t index = hash1(item, i);
            bits[index] = true;
        }
    }
    
    bool contains(const std::string& item) {
        for (size_t i = 0; i < num_hashes; ++i) {
            size_t index = hash1(item, i);
            if (!bits[index]) {
                return false;
            }
        }
        return true;
    }
};

