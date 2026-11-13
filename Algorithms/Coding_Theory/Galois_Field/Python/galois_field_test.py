"""Unit tests for Galois Field GF(2^8)."""
import unittest

from galois_field import GF, GF256, _slow_multiply


class TestBasicOperations(unittest.TestCase):
    def test_add_is_xor(self):
        self.assertEqual(GF.add(0x53, 0xCA), 0x53 ^ 0xCA)

    def test_add_zero_is_identity(self):
        for a in range(256):
            self.assertEqual(GF.add(a, 0), a)

    def test_add_self_is_zero(self):
        # Characteristic 2: a + a = 0
        for a in range(256):
            self.assertEqual(GF.add(a, a), 0)

    def test_sub_equals_add(self):
        for a in (0, 1, 17, 0xCA, 0xFF):
            for b in (0, 1, 17, 0xCA, 0xFF):
                self.assertEqual(GF.sub(a, b), GF.add(a, b))

    def test_mul_by_zero(self):
        for a in range(256):
            self.assertEqual(GF.mul(a, 0), 0)
            self.assertEqual(GF.mul(0, a), 0)

    def test_mul_by_one(self):
        for a in range(256):
            self.assertEqual(GF.mul(a, 1), a)

    def test_aes_known_vector(self):
        # Classic Rijndael example: 0x53 * 0xCA = 0x01.
        self.assertEqual(GF.mul(0x53, 0xCA), 0x01)

    def test_mul_matches_slow(self):
        # Spot-check that the table-based mul matches the polynomial mul.
        for a in (0, 1, 2, 17, 0x53, 0xCA, 0xFF):
            for b in (0, 1, 2, 17, 0x53, 0xCA, 0xFF):
                self.assertEqual(GF.mul(a, b), _slow_multiply(a, b))

    def test_mul_commutative(self):
        for a in (1, 7, 0x53, 0xCA):
            for b in (1, 7, 0x53, 0xCA):
                self.assertEqual(GF.mul(a, b), GF.mul(b, a))

    def test_distributive_law(self):
        # a * (b + c) == a*b + a*c
        for a in (1, 7, 0x53):
            for b in (3, 0x80, 0xCA):
                for c in (5, 0x10, 0xFF):
                    lhs = GF.mul(a, GF.add(b, c))
                    rhs = GF.add(GF.mul(a, b), GF.mul(a, c))
                    self.assertEqual(lhs, rhs)


class TestInverseAndDivision(unittest.TestCase):
    def test_inv_zero_raises(self):
        with self.assertRaises(ZeroDivisionError):
            GF.inv(0)

    def test_every_nonzero_has_inverse(self):
        for a in range(1, 256):
            self.assertEqual(GF.mul(a, GF.inv(a)), 1, msg=f"a={a}")

    def test_aes_known_inverse(self):
        self.assertEqual(GF.inv(0x53), 0xCA)
        self.assertEqual(GF.inv(0xCA), 0x53)

    def test_div_by_zero_raises(self):
        with self.assertRaises(ZeroDivisionError):
            GF.div(1, 0)

    def test_div_zero_by_anything(self):
        for b in range(1, 256):
            self.assertEqual(GF.div(0, b), 0)

    def test_div_is_inverse_of_mul(self):
        for a in (1, 7, 0x53, 0xCA, 0xFF):
            for b in (1, 7, 0x53, 0xCA, 0xFF):
                self.assertEqual(GF.div(GF.mul(a, b), b), a)


class TestPower(unittest.TestCase):
    def test_pow_by_zero(self):
        for a in range(1, 256):
            self.assertEqual(GF.pow(a, 0), 1)

    def test_pow_by_one(self):
        for a in range(256):
            self.assertEqual(GF.pow(a, 1), a)

    def test_zero_to_zero_raises(self):
        with self.assertRaises(ValueError):
            GF.pow(0, 0)

    def test_fermat_little_analog(self):
        # In GF(2^8)*, every nonzero element raised to 255 equals 1.
        for a in range(1, 256):
            self.assertEqual(GF.pow(a, 255), 1, msg=f"a={a}")

    def test_pow_matches_repeated_mul(self):
        for a in (2, 3, 0x53, 0xCA):
            for n in (2, 3, 5, 10, 100):
                expected = 1
                for _ in range(n):
                    expected = GF.mul(expected, a)
                self.assertEqual(GF.pow(a, n), expected, msg=f"{a}^{n}")


class TestPolynomial(unittest.TestCase):
    def test_poly_add(self):
        self.assertEqual(GF.poly_add([1, 2, 3], [4, 5]), [1 ^ 4, 2 ^ 5, 3])

    def test_poly_scale(self):
        # Scale [1, 2, 3] by 0 -> all zero
        self.assertEqual(GF.poly_scale([1, 2, 3], 0), [0, 0, 0])
        # Scale by 1 -> unchanged
        self.assertEqual(GF.poly_scale([1, 2, 3], 1), [1, 2, 3])

    def test_poly_mul(self):
        # (x + 1)(x + 1) = x^2 + 1 in GF(2)[x] (middle terms XOR-cancel)
        # Stored low-degree-first: [1, 1] * [1, 1] = [1, 0, 1]
        self.assertEqual(GF.poly_mul([1, 1], [1, 1]), [1, 0, 1])

    def test_poly_eval_horner(self):
        # p(x) = 2 + 3x + 5x^2; p(2) = 2 ^ (3*2) ^ (5*(2*2)) under GF
        x = 2
        p = [2, 3, 5]
        expected = p[0] ^ GF.mul(p[1], x) ^ GF.mul(p[2], GF.mul(x, x))
        self.assertEqual(GF.poly_eval(p, x), expected)

    def test_poly_divmod_identity(self):
        # Pick a divisor and dividend; verify dividend == quotient*divisor + remainder
        divisor = [1, 1, 1]   # x^2 + x + 1
        for dividend in ([2, 0, 0, 1], [5, 7, 0, 1, 3], [0xCA, 0x53, 1, 1, 1, 0x80]):
            quotient, remainder = GF.poly_divmod(dividend, divisor)
            reconstructed = GF.poly_add(GF.poly_mul(quotient, divisor), remainder)
            # Trim trailing zeros for fair comparison.
            while reconstructed and reconstructed[-1] == 0:
                reconstructed.pop()
            expected = list(dividend)
            while expected and expected[-1] == 0:
                expected.pop()
            self.assertEqual(reconstructed, expected, msg=f"dividend={dividend}")


class TestCustomField(unittest.TestCase):
    def test_alternative_primitive_poly(self):
        # GF(2^8) with polynomial 0x11D (different generator) is still a field.
        custom = GF256(primitive_poly=0x11D, generator=0x02)
        for a in range(1, 256):
            self.assertEqual(custom.mul(a, custom.inv(a)), 1)


if __name__ == "__main__":
    unittest.main()
