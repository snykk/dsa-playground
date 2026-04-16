"""
Fast Fourier Transform (FFT) Implementation

The Fast Fourier Transform is an efficient algorithm for computing the
Discrete Fourier Transform (DFT) and its inverse.
"""

import math
import cmath


def _fft_recursive(a, inverse=False):
    """
    Internal recursive FFT (no normalization).
    """
    n = len(a)

    # Base case
    if n == 1:
        return a

    # Divide: split into even and odd indices
    even = _fft_recursive([a[i] for i in range(0, n, 2)], inverse)
    odd = _fft_recursive([a[i] for i in range(1, n, 2)], inverse)

    # Combine
    result = [0] * n
    sign = -1 if inverse else 1

    for k in range(n // 2):
        t = cmath.exp(sign * 2j * cmath.pi * k / n) * odd[k]
        result[k] = even[k] + t
        result[k + n // 2] = even[k] - t

    return result


def fft(a, inverse=False):
    """
    Compute Fast Fourier Transform using Cooley-Tukey algorithm

    Args:
        a: List of complex numbers (will be padded to power of 2 if needed)
        inverse: If True, compute inverse FFT

    Returns:
        List of complex numbers (FFT result)

    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    n = len(a)

    # Base case
    if n == 1:
        return a

    # Ensure n is power of 2 (pad with zeros if needed)
    original_n = n
    if n & (n - 1) != 0:
        # Find next power of 2
        next_power = 1
        while next_power < n:
            next_power <<= 1
        a = a + [0] * (next_power - n)
        n = next_power

    result = _fft_recursive(a, inverse)

    if inverse:
        result = [x / n for x in result]
        # Return only original length if padded
        if original_n < n:
            return result[:original_n]

    return result


def ifft(a):
    """
    Compute Inverse Fast Fourier Transform
    
    Args:
        a: List of complex numbers (FFT result)
        
    Returns:
        List of complex numbers (original signal)
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    # IFFT is FFT with inverse=True, which already handles normalization
    return fft(a, inverse=True)


def multiply_polynomials(p, q):
    """
    Multiply two polynomials using FFT
    
    Args:
        p: Coefficients of first polynomial
        q: Coefficients of second polynomial
        
    Returns:
        Coefficients of product polynomial
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    # Pad polynomials to same length (power of 2)
    n = 1
    while n < len(p) + len(q) - 1:
        n <<= 1
    
    p_padded = p + [0] * (n - len(p))
    q_padded = q + [0] * (n - len(q))
    
    # Convert to complex
    p_complex = [complex(x, 0) for x in p_padded]
    q_complex = [complex(x, 0) for x in q_padded]
    
    # Compute FFT
    p_fft = fft(p_complex)
    q_fft = fft(q_complex)
    
    # Multiply pointwise
    product_fft = [p_fft[i] * q_fft[i] for i in range(n)]
    
    # Compute inverse FFT
    product = ifft(product_fft)
    
    # Round to integers (for integer coefficients)
    return [round(x.real) for x in product[:len(p) + len(q) - 1]]


def convolve(a, b):
    """
    Compute convolution of two sequences using FFT
    
    Args:
        a: First sequence
        b: Second sequence
        
    Returns:
        Convolution result
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    return multiply_polynomials(a, b)


if __name__ == "__main__":
    # Example usage
    print("Fast Fourier Transform Examples:")
    
    # Example 1: Simple FFT
    signal = [1, 2, 3, 4]
    signal_complex = [complex(x, 0) for x in signal]
    fft_result = fft(signal_complex)
    print(f"Signal: {signal}")
    print(f"FFT: {[f'{x.real:.2f}+{x.imag:.2f}j' for x in fft_result]}")
    
    # Example 2: Inverse FFT
    ifft_result = ifft(fft_result)
    print(f"IFFT (recovered): {[round(x.real) for x in ifft_result]}")
    
    # Example 3: Polynomial multiplication
    print(f"\nPolynomial Multiplication:")
    p = [1, 2, 3]  # 1 + 2x + 3x^2
    q = [4, 5]     # 4 + 5x
    product = multiply_polynomials(p, q)
    print(f"({p}) * ({q}) = {product}")
    # Should be [4, 13, 22, 15] = 4 + 13x + 22x^2 + 15x^3
