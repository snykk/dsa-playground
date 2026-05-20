// Reed-Solomon error correction over GF(2^8).
// Systematic encode + Berlekamp-Massey decode + Forney + Chien search.
// Uses primitive element alpha = 3 (true primitive of GF(2^8) under 0x11B).

#ifndef REED_SOLOMON_H
#define REED_SOLOMON_H

#include "../../Galois_Field/C++/galois_field.h"

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
    // Construct RS(n, k) code. alpha defaults to 3 (primitive of GF(2^8) under Rijndael).
    ReedSolomon(int n, int k, uint8_t alpha = 3)
        : n_(n), k_(k), alpha_(alpha), t_((n - k) / 2) {
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

    // Decode and return the k-byte message portion. Throws DecodeError if more
    // than t errors are present.
    std::vector<uint8_t> decode(const std::vector<uint8_t>& received) const {
        if (static_cast<int>(received.size()) != n_) {
            throw std::invalid_argument("received wrong length");
        }
        const auto& gf = gf256::shared();
        auto syndromes = computeSyndromes(received, gf);
        bool all_zero = true;
        for (uint8_t s : syndromes) if (s != 0) { all_zero = false; break; }
        if (all_zero) {
            return std::vector<uint8_t>(received.end() - k_, received.end());
        }
        auto err_locator = berlekampMassey(syndromes, gf);
        auto positions = findErrorPositions(err_locator, gf);
        if (positions.empty() ||
            static_cast<int>(positions.size()) != static_cast<int>(err_locator.size()) - 1) {
            throw DecodeError("error locations could not be determined");
        }
        auto magnitudes = forney(syndromes, err_locator, positions, gf);
        std::vector<uint8_t> corrected = received;
        for (size_t i = 0; i < positions.size(); ++i) {
            corrected[positions[i]] ^= magnitudes[i];
        }
        // Verify: all syndromes of corrected codeword must be zero.
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
    std::vector<uint8_t> generator_;

    std::vector<uint8_t> buildGenerator() const {
        const auto& gf = gf256::shared();
        std::vector<uint8_t> g = {1};
        for (int i = 0; i < n_ - k_; ++i) {
            std::vector<uint8_t> factor = {gf.pow(alpha_, i), 1};  // (alpha^i + x)
            g = gf.polyMul(g, factor);
        }
        return g;
    }

    std::vector<uint8_t> computeSyndromes(const std::vector<uint8_t>& r,
                                          const gf256::GF256& gf) const {
        std::vector<uint8_t> out;
        out.reserve(n_ - k_);
        for (int i = 0; i < n_ - k_; ++i) {
            out.push_back(gf.polyEval(r, gf.pow(alpha_, i)));
        }
        return out;
    }

    // Berlekamp-Massey (classical iterative form, low-degree-first storage).
    std::vector<uint8_t> berlekampMassey(const std::vector<uint8_t>& syndromes,
                                         const gf256::GF256& gf) const {
        std::vector<uint8_t> lam = {1};
        std::vector<uint8_t> prev = {1};
        int L = 0;
        int m = 1;
        uint8_t b = 1;
        for (size_t n = 0; n < syndromes.size(); ++n) {
            uint8_t delta = syndromes[n];
            for (int i = 1; i <= L; ++i) {
                if (i < static_cast<int>(lam.size()) && lam[i] != 0) {
                    delta ^= gf.mul(lam[i], syndromes[n - i]);
                }
            }
            if (delta == 0) { ++m; continue; }
            // shift = (delta / b) * x^m * prev
            uint8_t scale = gf.div(delta, b);
            std::vector<uint8_t> shift(m, 0);
            for (uint8_t c : prev) shift.push_back(gf.mul(c, scale));
            size_t length = std::max(lam.size(), shift.size());
            std::vector<uint8_t> new_lam = lam;
            new_lam.resize(length, 0);
            for (size_t i = 0; i < shift.size(); ++i) new_lam[i] ^= shift[i];
            if (2 * L <= static_cast<int>(n)) {
                std::vector<uint8_t> t_poly = lam;
                lam = new_lam;
                L = static_cast<int>(n) + 1 - L;
                prev = t_poly;
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

    std::vector<int> findErrorPositions(const std::vector<uint8_t>& err_locator,
                                        const gf256::GF256& gf) const {
        std::vector<int> positions;
        for (int i = 0; i < n_; ++i) {
            uint8_t x_inv = gf.pow(alpha_, gf256::FIELD_ORDER - i);
            if (gf.polyEval(err_locator, x_inv) == 0) positions.push_back(i);
        }
        return positions;
    }

    std::vector<uint8_t> forney(const std::vector<uint8_t>& syndromes,
                                const std::vector<uint8_t>& err_locator,
                                const std::vector<int>& positions,
                                const gf256::GF256& gf) const {
        std::vector<uint8_t> product = gf.polyMul(syndromes, err_locator);
        int truncate = n_ - k_;
        std::vector<uint8_t> omega(product.begin(),
                                   product.begin() + std::min(truncate,
                                                              static_cast<int>(product.size())));
        // Formal derivative: only odd-index terms survive (characteristic 2).
        std::vector<uint8_t> lam_prime;
        for (size_t i = 1; i < err_locator.size(); ++i) {
            lam_prime.push_back((i % 2 == 1) ? err_locator[i] : 0);
        }
        std::vector<uint8_t> mags;
        mags.reserve(positions.size());
        for (int pos : positions) {
            uint8_t x_inv = gf.pow(alpha_, gf256::FIELD_ORDER - pos);
            uint8_t x_pos = gf.pow(alpha_, pos);
            uint8_t num = gf.polyEval(omega, x_inv);
            uint8_t den = gf.polyEval(lam_prime, x_inv);
            if (den == 0) throw DecodeError("Forney denominator is zero");
            mags.push_back(gf.mul(x_pos, gf.div(num, den)));
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
