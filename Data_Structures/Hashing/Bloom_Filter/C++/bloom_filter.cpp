/**
 * Bloom Filter Implementation (C++)
 * 
 * Probabilistic data structure for membership testing
 */

#include <vector>
#include <string>
#include <stdexcept>
#include <functional>
#include <cmath>

class BloomFilter {
private:
    std::vector<bool> bits;
    size_t num_bits;
    size_t num_hashes;
    
    size_t hash1(const std::string& item, size_t i) const {
        std::hash<std::string> hasher;
        return (hasher(item) + i * hasher(item + std::to_string(i))) % num_bits;
    }
    
public:
    BloomFilter(size_t cap, double error_rate = 0.01) {
        if (cap == 0) throw std::invalid_argument("capacity must be positive");
        if (!(error_rate > 0.0 && error_rate < 1.0)) {
            throw std::invalid_argument("error_rate must be strictly between 0 and 1");
        }
        // Round the bits up and keep at least one hash: truncating gave k = 0
        // for small filters, and contains() was then true for everything.
        num_bits = static_cast<size_t>(std::ceil(-(double)cap * std::log(error_rate) / (std::log(2) * std::log(2))));
        num_hashes = static_cast<size_t>(std::llround((double)num_bits * std::log(2) / (double)cap));
        if (num_hashes < 1) num_hashes = 1;
        bits.resize(num_bits, false);
    }
    
    size_t numBits() const { return num_bits; }
    size_t numHashes() const { return num_hashes; }

    void add(const std::string& item) {
        for (size_t i = 0; i < num_hashes; ++i) {
            size_t index = hash1(item, i);
            bits[index] = true;
        }
    }
    
    bool contains(const std::string& item) const {
        for (size_t i = 0; i < num_hashes; ++i) {
            size_t index = hash1(item, i);
            if (!bits[index]) {
                return false;
            }
        }
        return true;
    }
};

