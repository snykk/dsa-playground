/**
 * Unit tests for Fast Fourier Transform
 */

#include <cassert>
#include <iostream>
#include <vector>
#include <complex>
#include <cmath>
#include <stdexcept>
#include "fast_fourier_transform.cpp"

const double EPS = 1e-9;

bool complexEqual(const Complex& a, const Complex& b) {
    return std::abs(a.real() - b.real()) < EPS && std::abs(a.imag() - b.imag()) < EPS;
}

void testFFTBasic() {
    ComplexVector signal = {Complex(1, 0), Complex(2, 0), Complex(3, 0), Complex(4, 0)};
    ComplexVector result = fft(signal);
    
    // FFT of [1,2,3,4] should have specific properties
    assert(result.size() == 4);
}

void testIFFT() {
    ComplexVector signal = {Complex(1, 0), Complex(2, 0), Complex(3, 0), Complex(4, 0)};
    ComplexVector fft_result = fft(signal);
    ComplexVector ifft_result = ifft(fft_result);
    
    // IFFT should recover original signal
    for (size_t i = 0; i < signal.size(); i++) {
        assert(std::abs(ifft_result[i].real() - signal[i].real()) < EPS);
        assert(std::abs(ifft_result[i].imag() - signal[i].imag()) < EPS);
    }
}

void testMultiplyPolynomials() {
    std::vector<int> p = {1, 2};  // 1 + 2x
    std::vector<int> q = {3, 4};  // 3 + 4x
    std::vector<long long> product = multiplyPolynomials(p, q);
    
    // (1 + 2x) * (3 + 4x) = 3 + 10x + 8x^2
    assert(product.size() == 3);
    assert(product[0] == 3);
    assert(product[1] == 10);
    assert(product[2] == 8);
}

void testMultiplyPolynomialsLarger() {
    std::vector<int> p = {1, 2, 3};  // 1 + 2x + 3x^2
    std::vector<int> q = {4, 5};     // 4 + 5x
    std::vector<long long> product = multiplyPolynomials(p, q);
    
    // (1 + 2x + 3x^2) * (4 + 5x) = 4 + 13x + 22x^2 + 15x^3
    assert(product.size() == 4);
    assert(product[0] == 4);
    assert(product[1] == 13);
    assert(product[2] == 22);
    assert(product[3] == 15);
}

void testConvolve() {
    std::vector<int> a = {1, 2, 3};
    std::vector<int> b = {4, 5};
    std::vector<long long> result = convolve(a, b);
    
    // Convolution should be same as polynomial multiplication
    std::vector<long long> product = multiplyPolynomials(a, b);
    assert(result.size() == product.size());
    for (size_t i = 0; i < result.size(); i++) {
        assert(result[i] == product[i]);
    }
}

void testFFTIdentity() {
    ComplexVector signal = {Complex(1, 0), Complex(0, 0), Complex(0, 0), Complex(0, 0)};
    ComplexVector result = fft(signal);
    
    // FFT of [1,0,0,0] should be [1,1,1,1]
    for (const Complex& x : result) {
        assert(std::abs(x.real() - 1.0) < EPS);
        assert(std::abs(x.imag()) < EPS);
    }
}

void testFFTKnownValues() {
    // Textbook convention: X[k] = sum a[j] e^(-2 pi i j k / n)
    ComplexVector signal = {Complex(1, 0), Complex(2, 0), Complex(3, 0), Complex(4, 0)};
    ComplexVector result = fft(signal);
    ComplexVector expected = {Complex(10, 0), Complex(-2, 2), Complex(-2, 0), Complex(-2, -2)};
    for (size_t i = 0; i < expected.size(); i++) {
        assert(complexEqual(result[i], expected[i]));
    }
}

void testFFTMatchesDirectDFT() {
    ComplexVector signal;
    for (int i = 1; i <= 8; i++) signal.push_back(Complex(i, 0));
    ComplexVector result = fft(signal);
    const int n = 8;
    for (int k = 0; k < n; k++) {
        Complex sum(0, 0);
        for (int j = 0; j < n; j++) {
            sum += signal[j] * std::exp(Complex(0, -2.0 * M_PI * j * k / n));
        }
        assert(complexEqual(result[k], sum));
    }
}

void testInverseNonPowerOfTwoThrows() {
    ComplexVector spectrum = {Complex(1, 0), Complex(2, 0), Complex(3, 0)};
    bool threw = false;
    try {
        ifft(spectrum);
    } catch (const std::invalid_argument&) {
        threw = true;
    }
    assert(threw);
}

void testEmptyInput() {
    assert(fft(ComplexVector()).empty());
    assert(ifft(ComplexVector()).empty());
}

void testMultiplyLargeCoefficients() {
    // 1e5 * 1e5 = 1e10 does not fit in int; the result must not overflow.
    std::vector<int> p = {100000, 100000};
    std::vector<int> q = {100000, 100000};
    std::vector<long long> product = multiplyPolynomials(p, q);
    assert(product.size() == 3);
    assert(product[0] == 10000000000LL);
    assert(product[1] == 20000000000LL);
    assert(product[2] == 10000000000LL);
}

int main() {
    testFFTKnownValues();
    testFFTMatchesDirectDFT();
    testInverseNonPowerOfTwoThrows();
    testEmptyInput();
    testMultiplyLargeCoefficients();
    testFFTBasic();
    testIFFT();
    testMultiplyPolynomials();
    testMultiplyPolynomialsLarger();
    testConvolve();
    testFFTIdentity();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

