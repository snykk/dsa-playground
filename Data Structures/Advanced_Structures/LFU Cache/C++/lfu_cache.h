// LFU (Least Frequently Used) Cache — O(1) get and put.
//
// Internals:
//   key -> iterator into a per-frequency std::list<pair<key, value>>
//   freq -> list with MRU at front, LRU at back
//   min_freq tracks the smallest non-empty frequency

#ifndef LFU_CACHE_H
#define LFU_CACHE_H

#include <list>
#include <stdexcept>
#include <unordered_map>

class LFUCache {
 public:
    explicit LFUCache(int capacity) : capacity_(capacity), size_(0), min_freq_(0) {
        if (capacity < 0) {
            throw std::invalid_argument("capacity must be non-negative");
        }
    }

    int get(int key) {
        if (capacity_ == 0) return -1;
        auto it = key_to_entry_.find(key);
        if (it == key_to_entry_.end()) return -1;
        int value = it->second.list_it->second;
        promote(key);
        return value;
    }

    void put(int key, int value) {
        if (capacity_ == 0) return;

        auto it = key_to_entry_.find(key);
        if (it != key_to_entry_.end()) {
            it->second.list_it->second = value;
            promote(key);
            return;
        }

        if (size_ >= capacity_) {
            auto& lru_list = freq_lists_[min_freq_];
            int evict_key = lru_list.back().first;
            lru_list.pop_back();
            key_to_entry_.erase(evict_key);
            if (lru_list.empty()) freq_lists_.erase(min_freq_);
            --size_;
        }

        freq_lists_[1].push_front({key, value});
        key_to_entry_[key] = {1, freq_lists_[1].begin()};
        min_freq_ = 1;
        ++size_;
    }

 private:
    struct Entry {
        int freq;
        std::list<std::pair<int, int>>::iterator list_it;
    };

    void promote(int key) {
        Entry& entry = key_to_entry_[key];
        int freq = entry.freq;
        int value = entry.list_it->second;

        auto& old_list = freq_lists_[freq];
        old_list.erase(entry.list_it);
        if (old_list.empty()) {
            freq_lists_.erase(freq);
            if (min_freq_ == freq) ++min_freq_;
        }

        freq_lists_[freq + 1].push_front({key, value});
        entry.freq = freq + 1;
        entry.list_it = freq_lists_[freq + 1].begin();
    }

    int capacity_;
    int size_;
    int min_freq_;
    std::unordered_map<int, Entry> key_to_entry_;
    std::unordered_map<int, std::list<std::pair<int, int>>> freq_lists_;
};

#endif  // LFU_CACHE_H
