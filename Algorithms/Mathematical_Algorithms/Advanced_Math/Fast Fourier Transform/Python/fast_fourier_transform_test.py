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


if __name__ == '__main__':
    unittest.main()
