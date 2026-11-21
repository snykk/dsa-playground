// Galois Field GF(2^8) arithmetic -- header-only.
//
// Uses the Rijndael / AES irreducible polynomial x^8 + x^4 + x^3 + x + 1
// (0x11B) and the primitive element 0x03 by default. Log/antilog tables
// give O(1) multiply / divide / inverse / power.

#ifndef GALOIS_FIELD_H
#define GALOIS_FIELD_H

#include <array>
#include <cstdint>
#include <stdexcept>
#include <vector>

namespace gf256 {

inline constexpr int FIELD_SIZE  = 256;
inline constexpr int FIELD_ORDER = 255;
inline constexpr int DEFAULT_POLY      = 0x11B;
inline constexpr int DEFAULT_GENERATOR = 0x03;

// Polynomial multiplication in GF(2^8) without tables -- used at init only.
inline int slowMultiply(int a, int b, int poly = DEFAULT_POLY) {
    int result = 0;
    while (a && b) {
        if (b & 1) result ^= a;
        b >>= 1;
        a <<= 1;
        if (a & 0x100) a ^= poly;
    }
    return result;
}

class GF256 {
 public:
    GF256(int poly = DEFAULT_POLY, int generator = DEFAULT_GENERATOR) {
        int acc = 1;
        for (int i = 0; i < FIELD_ORDER; ++i) {
            expTable_[i] = static_cast<uint8_t>(acc);
            logTable_[acc] = static_cast<uint8_t>(i);
            acc = slowMultiply(acc, generator, poly);
        }
        // Doubled exp table avoids "% 255" on every multiply.
        for (int i = FIELD_ORDER; i < 2 * FIELD_ORDER; ++i) {
            expTable_[i] = expTable_[i - FIELD_ORDER];
        }
    }

    static inline uint8_t add(uint8_t a, uint8_t b) noexcept { return a ^ b; }
    static inline uint8_t sub(uint8_t a, uint8_t b) noexcept { return a ^ b; }

    inline uint8_t mul(uint8_t a, uint8_t b) const {
        if (a == 0 || b == 0) return 0;
        return expTable_[logTable_[a] + logTable_[b]];
    }

    inline uint8_t div(uint8_t a, uint8_t b) const {
        if (b == 0) throw std::domain_error("division by zero in GF(2^8)");
        if (a == 0) return 0;
        int diff = logTable_[a] - logTable_[b];
        if (diff < 0) diff += FIELD_ORDER;
        return expTable_[diff];
    }

    inline uint8_t inv(uint8_t b) const {
        if (b == 0) throw std::domain_error("0 has no inverse");
        return expTable_[FIELD_ORDER - logTable_[b]];
    }

    inline uint8_t pow(uint8_t a, int n) const {
        if (a == 0) {
            if (n == 0) throw std::domain_error("0^0 is undefined");
            return 0;
        }
        // Reduce n first: log[a] * n would overflow int for large n.
        int e = (static_cast<int>(logTable_[a]) * (n % FIELD_ORDER)) % FIELD_ORDER;
        if (e < 0) e += FIELD_ORDER;
        return expTable_[e];
    }

    // -- Polynomial helpers (low-degree-first) --------------------------

    std::vector<uint8_t> polyAdd(const std::vector<uint8_t>& p,
                                 const std::vector<uint8_t>& q) const {
        const std::vector<uint8_t>& longer = p.size() >= q.size() ? p : q;
        const std::vector<uint8_t>& shorter = p.size() >= q.size() ? q : p;
        std::vector<uint8_t> r = longer;
        for (size_t i = 0; i < shorter.size(); ++i) r[i] ^= shorter[i];
        return r;
    }

    std::vector<uint8_t> polyScale(const std::vector<uint8_t>& p, uint8_t k) const {
        std::vector<uint8_t> r(p.size());
        for (size_t i = 0; i < p.size(); ++i) r[i] = mul(p[i], k);
        return r;
    }

    std::vector<uint8_t> polyMul(const std::vector<uint8_t>& p,
                                 const std::vector<uint8_t>& q) const {
        if (p.empty() || q.empty()) return {};
        std::vector<uint8_t> r(p.size() + q.size() - 1, 0);
        for (size_t i = 0; i < p.size(); ++i) {
            if (p[i] == 0) continue;
            for (size_t j = 0; j < q.size(); ++j) {
                r[i + j] ^= mul(p[i], q[j]);
            }
        }
        return r;
    }

    uint8_t polyEval(const std::vector<uint8_t>& p, uint8_t x) const {
        if (p.empty()) return 0;
        uint8_t y = p.back();
        for (int i = static_cast<int>(p.size()) - 2; i >= 0; --i) {
            y = static_cast<uint8_t>(mul(y, x) ^ p[i]);
        }
        return y;
    }

 private:
    std::array<uint8_t, 2 * FIELD_ORDER> expTable_{};
    std::array<uint8_t, FIELD_SIZE> logTable_{};
};

// Module-style singleton accessor.
inline const GF256& shared() {
    static const GF256 instance;
    return instance;
}

}  // namespace gf256

#endif  // GALOIS_FIELD_H
