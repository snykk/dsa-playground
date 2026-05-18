/**
 * Fast Fourier Transform (FFT) Implementation (C++)
 * 
 * The Fast Fourier Transform is an efficient algorithm for computing the
 * Discrete Fourier Transform (DFT) and its inverse.
 */

#include <vector>
#include <complex>
#include <cmath>
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

typedef std::complex<double> Complex;
typedef std::vector<Complex> ComplexVector;

/**
 * Compute Fast Fourier Transform using Cooley-Tukey algorithm
 * Time Complexity: O(n log n)
 */
ComplexVector fft(const ComplexVector& a, bool inverse = false) {
    int n = a.size();
    
    // Base case
    if (n == 1) {
        return a;
    }
    
    // Ensure n is power of 2 (pad with zeros if needed)
    int next_power = 1;
    while (next_power < n) {
        next_power <<= 1;
    }
    
    ComplexVector padded = a;
    if (next_power > n) {
        padded.resize(next_power, Complex(0, 0));
        n = next_power;
    }
    
    // Divide: split into even and odd indices
    ComplexVector even, odd;
    for (int i = 0; i < n; i += 2) {
        even.push_back(padded[i]);
    }
    for (int i = 1; i < n; i += 2) {
        odd.push_back(padded[i]);
    }
    
    ComplexVector even_fft = fft(even, inverse);
    ComplexVector odd_fft = fft(odd, inverse);
    
    // Combine
    ComplexVector result(n);
    double sign = inverse ? -1.0 : 1.0;
    
    for (int k = 0; k < n / 2; k++) {
        Complex t = std::exp(Complex(0, sign * 2.0 * M_PI * k / n)) * odd_fft[k];
        result[k] = even_fft[k] + t;
        result[k + n / 2] = even_fft[k] - t;
    }
    
    if (inverse) {
        for (int i = 0; i < n; i++) {
            result[i] /= 2;
        }
    }
    
    return result;
}

/**
 * Compute Inverse Fast Fourier Transform
 * Time Complexity: O(n log n)
 */
ComplexVector ifft(const ComplexVector& a) {
    return fft(a, true);
}

/**
 * Multiply two polynomials using FFT
 * Time Complexity: O(n log n)
 */
std::vector<int> multiplyPolynomials(const std::vector<int>& p, const std::vector<int>& q) {
    // Pad polynomials to same length (power of 2)
    int n = 1;
    while (n < static_cast<int>(p.size() + q.size() - 1)) {
        n <<= 1;
    }
    
    std::vector<int> p_padded = p;
    std::vector<int> q_padded = q;
    p_padded.resize(n, 0);
    q_padded.resize(n, 0);
    
    // Convert to complex
    ComplexVector p_complex, q_complex;
    for (int val : p_padded) {
        p_complex.push_back(Complex(val, 0));
    }
    for (int val : q_padded) {
        q_complex.push_back(Complex(val, 0));
    }
    
    // Compute FFT
    ComplexVector p_fft = fft(p_complex);
    ComplexVector q_fft = fft(q_complex);
    
    // Multiply pointwise
    ComplexVector product_fft(n);
    for (int i = 0; i < n; i++) {
        product_fft[i] = p_fft[i] * q_fft[i];
    }
    
    // Compute inverse FFT
    ComplexVector product = ifft(product_fft);
    
    // Round to integers (for integer coefficients)
    std::vector<int> result;
    int result_size = p.size() + q.size() - 1;
    for (int i = 0; i < result_size; i++) {
        result.push_back(static_cast<int>(std::round(product[i].real())));
    }
    
    return result;
}

/**
 * Compute convolution of two sequences using FFT
 * Time Complexity: O(n log n)
 */
std::vector<int> convolve(const std::vector<int>& a, const std::vector<int>& b) {
    return multiplyPolynomials(a, b);
}

// Example usage (uncomment to use)
/*
#include <iostream>
#include <iomanip>

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    std::vector<int> signal = {1, 2, 3, 4};
    ComplexVector signal_complex;
    for (int val : signal) {
        signal_complex.push_back(Complex(val, 0));
    }
    
    ComplexVector fft_result = fft(signal_complex);
    std::cout << "FFT result:" << std::endl;
    for (const Complex& x : fft_result) {
        std::cout << std::fixed << std::setprecision(2) 
                  << x.real() << "+" << x.imag() << "j" << std::endl;
    }
    
    return 0;
}
#endif
#endif
*/
