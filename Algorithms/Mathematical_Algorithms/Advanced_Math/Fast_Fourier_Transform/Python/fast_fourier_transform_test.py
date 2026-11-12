"""
Unit tests for Fast Fourier Transform
"""

import unittest
import cmath
from fast_fourier_transform import fft, ifft, multiply_polynomials, convolve


class TestFastFourierTransform(unittest.TestCase):
    
    def test_fft_simple(self):
        """Test simple FFT"""
        signal = [1, 2, 3, 4]
        signal_complex = [complex(x, 0) for x in signal]
        result = fft(signal_complex)
        
        # Result should have same length
        self.assertEqual(len(result), 4)
        # All values should be complex
        for x in result:
            self.assertIsInstance(x, complex)
    
    def test_fft_ifft_roundtrip(self):
        """Test that FFT and IFFT are inverses"""
        # Use power of 2 length for better accuracy
        signal = [1, 2, 3, 4, 5, 6, 7, 8]
        signal_complex = [complex(x, 0) for x in signal]
        
        fft_result = fft(signal_complex)
        ifft_result = ifft(fft_result)
        
        # Should recover original (within floating point error)
        for i in range(len(signal)):
            self.assertAlmostEqual(ifft_result[i].real, signal[i], places=9)
            self.assertAlmostEqual(ifft_result[i].imag, 0, places=9)
    
    def test_fft_power_of_two(self):
        """Test FFT with power of 2 length"""
        signal = [1, 2, 3, 4, 5, 6, 7, 8]
        signal_complex = [complex(x, 0) for x in signal]
        result = fft(signal_complex)
        
        self.assertEqual(len(result), 8)
    
    def test_fft_non_power_of_two(self):
        """Test FFT with non-power of 2 length (should pad)"""
        signal = [1, 2, 3]
        signal_complex = [complex(x, 0) for x in signal]
        result = fft(signal_complex)
        
        # Should be padded to next power of 2 (4)
        self.assertEqual(len(result), 4)
    
    def test_multiply_polynomials_simple(self):
        """Test polynomial multiplication"""
        p = [1, 2]  # 1 + 2x
        q = [3, 4]  # 3 + 4x
        product = multiply_polynomials(p, q)
        
        # (1 + 2x) * (3 + 4x) = 3 + 10x + 8x^2
        expected = [3, 10, 8]
        self.assertEqual(len(product), len(expected))
        for i in range(len(expected)):
            self.assertEqual(product[i], expected[i])
    
    def test_multiply_polynomials_larger(self):
        """Test polynomial multiplication with larger polynomials"""
        p = [1, 2, 3]  # 1 + 2x + 3x^2
        q = [4, 5]     # 4 + 5x
        product = multiply_polynomials(p, q)
        
        # (1 + 2x + 3x^2) * (4 + 5x) = 4 + 13x + 22x^2 + 15x^3
        expected = [4, 13, 22, 15]
        self.assertEqual(len(product), len(expected))
        for i in range(len(expected)):
            self.assertEqual(product[i], expected[i])
    
    def test_convolve(self):
        """Test convolution"""
        a = [1, 2, 3]
        b = [4, 5]
        result = convolve(a, b)
        
        # Convolution should be same as polynomial multiplication
        product = multiply_polynomials(a, b)
        self.assertEqual(result, product)
    
    def test_fft_identity(self):
        """Test FFT of identity signal"""
        signal = [1, 0, 0, 0]
        signal_complex = [complex(x, 0) for x in signal]
        result = fft(signal_complex)
        
        # FFT of [1,0,0,0] should be [1,1,1,1]
        for x in result:
            self.assertAlmostEqual(x.real, 1, places=10)
            self.assertAlmostEqual(x.imag, 0, places=10)

    def test_fft_matches_direct_dft(self):
        """Forward FFT uses the textbook sign: X[k] = sum a[j] e^(-2 pi i j k / n)"""
        signal = [1, 2, 3, 4, 5, 6, 7, 8]
        n = len(signal)
        expected = [sum(signal[j] * cmath.exp(-2j * cmath.pi * j * k / n)
                        for j in range(n)) for k in range(n)]
        result = fft([complex(x, 0) for x in signal])
        for got, want in zip(result, expected):
            self.assertAlmostEqual(got.real, want.real, places=9)
            self.assertAlmostEqual(got.imag, want.imag, places=9)

    def test_fft_known_values(self):
        """fft([1,2,3,4]) = [10, -2+2j, -2, -2-2j] (the numpy convention)"""
        result = fft([complex(x, 0) for x in [1, 2, 3, 4]])
        expected = [10, -2 + 2j, -2, -2 - 2j]
        for got, want in zip(result, expected):
            self.assertAlmostEqual(abs(got - want), 0, places=9)

    def test_ifft_non_power_of_two_rejected(self):
        """The inverse of a non-power-of-two spectrum is not defined here"""
        with self.assertRaises(ValueError):
            ifft([complex(1, 0), complex(2, 0), complex(3, 0)])

    def test_fft_empty(self):
        self.assertEqual(fft([]), [])
        self.assertEqual(ifft([]), [])

    def test_multiply_large_coefficients_exact(self):
        """Coefficients up to 1e6 at length 512 stay exact in double precision"""
        n = 512
        p = [(i * 7919 + 13) % 1000001 for i in range(n)]
        q = [(i * 104729 + 7) % 1000001 for i in range(n)]
        expected = [0] * (2 * n - 1)
        for i, a in enumerate(p):
            for j, b in enumerate(q):
                expected[i + j] += a * b
        self.assertEqual(multiply_polynomials(p, q), expected)


if __name__ == '__main__':
    unittest.main()
