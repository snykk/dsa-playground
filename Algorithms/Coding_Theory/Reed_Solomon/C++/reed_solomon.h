// Reed-Solomon error correction over GF(2^8).
// Systematic encode + Berlekamp-Massey decode + Forney + Chien search, with
// combined error + erasure decoding (e + 2v <= n - k) and a configurable first
// consecutive root (fcr). Uses primitive element alpha = 3 (the true primitive
// of GF(2^8) under 0x11B; alpha = 2 has order 51 there).

#ifndef REED_SOLOMON_H
#define REED_SOLOMON_H

#include "../../Galois_Field/C++/galois_field.h"

#include <algorithm>
#include <cstdint>
#include <stdexcept>
#include <vector>

namespace reed_solomon {

class DecodeError : public std::runtime_error {
 public:
    using std::runtime_error::runtime_error;
};

class ReedSolomon {
 public:
    // Construct an RS(n, k) code. alpha defaults to 3 (primitive under Rijndael
    // 0x11B). fcr is the first consecutive root: the generator's roots are
    // alpha^fcr .. alpha^(fcr + n - k - 1). Encoder and decoder must agree on it.
    ReedSolomon(int n, int k, uint8_t alpha = 3, int fcr = 0)
        : n_(n), k_(k), alpha_(alpha), t_((n - k) / 2), fcr_(fcr) {
        if (!(0 < k && k < n)) {
            throw std::invalid_argument("need 0 < k < n");
        }
        if (n > 255) {
            throw std::invalid_argument("n must be <= 255 for GF(2^8)");
        }
        generator_ = buildGenerator();
    }

    int n() const { return n_; }
    int k() const { return k_; }
    int t() const { return t_; }
    int fcr() const { return fcr_; }
    uint8_t alpha() const { return alpha_; }

    // Systematic encode: codeword = [parity ... message ...]
    std::vector<uint8_t> encode(const std::vector<uint8_t>& message) const {
        if (static_cast<int>(message.size()) != k_) {
            throw std::invalid_argument("message wrong length");
        }
        const auto& gf = gf256::shared();
        int parity_len = n_ - k_;
        // dividend = [0]*parity_len + message (low-degree-first)
        std::vector<uint8_t> dividend(parity_len, 0);
        dividend.insert(dividend.end(), message.begin(), message.end());
        auto [quot, rem] = polyDivmod(dividend, generator_, gf);
        (void)quot;
        // Pad remainder to parity_len.
        while (static_cast<int>(rem.size()) < parity_len) rem.push_back(0);
        std::vector<uint8_t> codeword;
        codeword.reserve(n_);
        codeword.insert(codeword.end(), rem.begin(), rem.begin() + parity_len);
        codeword.insert(codeword.end(), message.begin(), message.end());
        return codeword;
    }

    // Decode and return the k-byte message portion.
    //
    // erasures lists positions known to be wrong (duplicates are ignored). Each
    // erasure costs one parity byte instead of two, so decoding succeeds when
    // e + 2v <= n - k (e erasures, v errors at unknown positions).
    //
    // Throws std::invalid_argument on malformed input and DecodeError when the
    // damage exceeds the correction budget.
    std::vector<uint8_t> decode(const std::vector<uint8_t>& received,
                                const std::vector<int>& erasures = {}) const {
        if (static_cast<int>(received.size()) != n_) {
            throw std::invalid_argument("received wrong length");
        }
        std::vector<int> erased = erasures;
        std::sort(erased.begin(), erased.end());
        erased.erase(std::unique(erased.begin(), erased.end()), erased.end());
        for (int p : erased) {
            if (p < 0 || p >= n_) {
                throw std::invalid_argument("erasure position out of range");
            }
        }
        const int e = static_cast<int>(erased.size());
        if (e > n_ - k_) {
            throw DecodeError("too many erasures");
        }

        const auto& gf = gf256::shared();

        // Step 1: Syndromes. All zero and nothing declared erased -> clean.
        auto syndromes = computeSyndromes(received, gf);
        bool all_zero = std::all_of(syndromes.begin(), syndromes.end(),
                                    [](uint8_t s) { return s == 0; });
        if (all_zero && e == 0) {
            return std::vector<uint8_t>(received.end() - k_, received.end());
        }

        // Step 2: Erasure locator Gamma(x) = prod (1 + alpha^p x), low-degree-first.
        std::vector<uint8_t> gamma = {1};
        for (int p : erased) {
            gamma = gf.polyMul(gamma, {1, gf.pow(alpha_, p)});
        }

        // Step 3: Berlekamp-Massey seeded with Gamma(x) returns the combined
        // locator Phi(x) = Lambda(x) * Gamma(x) for known + unknown positions.
        auto locator = berlekampMassey(syndromes, gamma, e, gf);

        // Step 4: Chien search. A locator of degree d must have exactly d roots
        // inside the codeword; anything else means the budget was exceeded.
        auto positions = findErrorPositions(locator, gf);
        if (static_cast<int>(positions.size()) != static_cast<int>(locator.size()) - 1) {
            throw DecodeError("error locations could not be determined");
        }

        // Step 5: Forney magnitudes, then apply the corrections.
        auto magnitudes = forney(syndromes, locator, positions, gf);
        std::vector<uint8_t> corrected = received;
        for (size_t i = 0; i < positions.size(); ++i) {
            corrected[positions[i]] ^= magnitudes[i];
        }

        // Step 6: Verify -- all syndromes of the corrected codeword must vanish.
        auto verify = computeSyndromes(corrected, gf);
        for (uint8_t s : verify) {
            if (s != 0) throw DecodeError("decode failed: too many errors");
        }
        return std::vector<uint8_t>(corrected.end() - k_, corrected.end());
    }

 private:
    int n_, k_;
    uint8_t alpha_;
    int t_;
    int fcr_;
    std::vector<uint8_t> generator_;

    // Reduce an exponent mod 255. Every element's order divides 255, so
    // alpha^x depends only on x mod 255; reducing keeps products small. fcr is
    // reduced before anything is added to it, so even INT_MAX cannot overflow.
    static int expMod(int x) {
        return ((x % gf256::FIELD_ORDER) + gf256::FIELD_ORDER) % gf256::FIELD_ORDER;
    }

    std::vector<uint8_t> buildGenerator() const {
        const auto& gf = gf256::shared();
        std::vector<uint8_t> g = {1};
        for (int i = 0; i < n_ - k_; ++i) {
            // (x - alpha^(fcr+i)) = (alpha^(fcr+i) + x) in characteristic 2.
            std::vector<uint8_t> factor = {gf.pow(alpha_, expMod(expMod(fcr_) + i)), 1};
            g = gf.polyMul(g, factor);
        }
        return g;
    }

    std::vector<uint8_t> computeSyndromes(const std::vector<uint8_t>& r,
                                          const gf256::GF256& gf) const {
        std::vector<uint8_t> out;
        out.reserve(n_ - k_);
        for (int i = 0; i < n_ - k_; ++i) {
            out.push_back(gf.polyEval(r, gf.pow(alpha_, expMod(expMod(fcr_) + i))));
        }
        return out;
    }

    // Berlekamp-Massey (classical L-tracking form, low-degree-first storage).
    //
    // Seeded with the erasure locator Gamma(x) of degree e (just {1} when there
    // are no erasures), it starts at syndrome index e and returns the combined
    // locator Phi(x) = Lambda(x) * Gamma(x). The length-change test 2L <= r + e
    // is the classical 2L <= r shifted by the e roots Gamma already supplies.
    std::vector<uint8_t> berlekampMassey(const std::vector<uint8_t>& syndromes,
                                         const std::vector<uint8_t>& erasure_locator,
                                         int erase_count,
                                         const gf256::GF256& gf) const {
        std::vector<uint8_t> lam = erasure_locator;
        std::vector<uint8_t> prev = erasure_locator;
        int L = erase_count;
        int m = 1;
        uint8_t b = 1;
        for (int r = erase_count; r < static_cast<int>(syndromes.size()); ++r) {
            uint8_t delta = syndromes[r];
            for (int i = 1; i <= L; ++i) {
                if (i < static_cast<int>(lam.size()) && lam[i] != 0) {
                    delta ^= gf.mul(lam[i], syndromes[r - i]);
                }
            }
            if (delta == 0) { ++m; continue; }
            // shift = (delta / b) * x^m * prev
            uint8_t scale = gf.div(delta, b);
            std::vector<uint8_t> shift(m, 0);
            for (uint8_t c : prev) shift.push_back(gf.mul(c, scale));
            std::vector<uint8_t> new_lam = lam;
            new_lam.resize(std::max(lam.size(), shift.size()), 0);
            for (size_t i = 0; i < shift.size(); ++i) new_lam[i] ^= shift[i];
            if (2 * L <= r + erase_count) {
                prev = lam;
                lam = new_lam;
                L = r + 1 + erase_count - L;
                b = delta;
                m = 1;
            } else {
                lam = new_lam;
                ++m;
            }
        }
        while (lam.size() > 1 && lam.back() == 0) lam.pop_back();
        return lam;
    }

    std::vector<int> findErrorPositions(const std::vector<uint8_t>& locator,
                                        const gf256::GF256& gf) const {
        std::vector<int> positions;
        for (int i = 0; i < n_; ++i) {
            uint8_t x_inv = gf.pow(alpha_, gf256::FIELD_ORDER - i);
            if (gf.polyEval(locator, x_inv) == 0) positions.push_back(i);
        }
        return positions;
    }

    // Forney: e_j = X_j^(1 - fcr) * Omega(X_j^-1) / Lambda'(X_j^-1), X_j = alpha^pos.
    // The textbook formula's leading minus sign vanishes in characteristic 2.
    std::vector<uint8_t> forney(const std::vector<uint8_t>& syndromes,
                                const std::vector<uint8_t>& locator,
                                const std::vector<int>& positions,
                                const gf256::GF256& gf) const {
        std::vector<uint8_t> product = gf.polyMul(syndromes, locator);
        int truncate = n_ - k_;
        std::vector<uint8_t> omega(product.begin(),
                                   product.begin() + std::min(truncate,
                                                              static_cast<int>(product.size())));
        // Formal derivative: only odd-index terms survive (characteristic 2).
        std::vector<uint8_t> lam_prime;
        for (size_t i = 1; i < locator.size(); ++i) {
            lam_prime.push_back((i % 2 == 1) ? locator[i] : 0);
        }
        const int fcr_term = expMod(1 - expMod(fcr_));
        std::vector<uint8_t> mags;
        mags.reserve(positions.size());
        for (int pos : positions) {
            uint8_t x_inv = gf.pow(alpha_, gf256::FIELD_ORDER - pos);
            uint8_t num = gf.polyEval(omega, x_inv);
            uint8_t den = gf.polyEval(lam_prime, x_inv);
            if (den == 0) throw DecodeError("Forney denominator is zero");
            // X_j^(1 - fcr): X_j when fcr = 0, 1 when fcr = 1.
            uint8_t x_factor = gf.pow(alpha_, expMod(pos * fcr_term));
            mags.push_back(gf.mul(x_factor, gf.div(num, den)));
        }
        return mags;
    }

    static std::pair<std::vector<uint8_t>, std::vector<uint8_t>>
    polyDivmod(const std::vector<uint8_t>& dividend,
               const std::vector<uint8_t>& divisor,
               const gf256::GF256& gf) {
        if (divisor.empty()) throw std::invalid_argument("divide by zero polynomial");
        if (dividend.size() < divisor.size()) {
            return {{}, dividend};
        }
        std::vector<uint8_t> out = dividend;
        uint8_t normalizer = divisor.back();
        for (int i = static_cast<int>(dividend.size()) - static_cast<int>(divisor.size());
             i >= 0; --i) {
            uint8_t coef = gf.div(out[i + static_cast<int>(divisor.size()) - 1], normalizer);
            if (coef != 0) {
                for (size_t j = 0; j < divisor.size() - 1; ++j) {
                    if (divisor[j] != 0) {
                        out[i + j] ^= gf.mul(divisor[j], coef);
                    }
                }
            }
            out[i + static_cast<int>(divisor.size()) - 1] = coef;
        }
        int sep = static_cast<int>(divisor.size()) - 1;
        std::vector<uint8_t> quotient(out.begin() + sep, out.end());
        std::vector<uint8_t> remainder(out.begin(), out.begin() + sep);
        return {quotient, remainder};
    }
};

}  // namespace reed_solomon

#endif  // REED_SOLOMON_H
