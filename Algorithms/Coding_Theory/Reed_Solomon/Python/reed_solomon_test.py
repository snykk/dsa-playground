"""Unit tests for Reed-Solomon over GF(2^8)."""
import random
import unittest

from reed_solomon import DecodeError, ReedSolomon


class TestEncodeBasics(unittest.TestCase):
    def test_codeword_length(self):
        rs = ReedSolomon(n=15, k=11)
        msg = list(range(11))
        codeword = rs.encode(msg)
        self.assertEqual(len(codeword), 15)

    def test_systematic_layout(self):
        # The last k bytes of the codeword should equal the message.
        rs = ReedSolomon(n=15, k=11)
        msg = list(range(11))
        codeword = rs.encode(msg)
        self.assertEqual(codeword[-11:], msg)

    def test_invalid_params(self):
        with self.assertRaises(ValueError):
            ReedSolomon(n=10, k=10)
        with self.assertRaises(ValueError):
            ReedSolomon(n=5, k=10)
        with self.assertRaises(ValueError):
            ReedSolomon(n=300, k=200)

    def test_wrong_message_length(self):
        rs = ReedSolomon(n=15, k=11)
        with self.assertRaises(ValueError):
            rs.encode([1, 2, 3])


class TestRoundTripNoErrors(unittest.TestCase):
    def test_no_error_decode(self):
        rs = ReedSolomon(n=15, k=11)
        for trial in range(20):
            msg = [random.randint(0, 255) for _ in range(11)]
            codeword = rs.encode(msg)
            recovered = rs.decode(codeword)
            self.assertEqual(recovered, msg, msg=f"trial={trial}")


class TestErrorCorrection(unittest.TestCase):
    def test_one_error(self):
        rs = ReedSolomon(n=15, k=11)
        msg = list(range(11))
        codeword = rs.encode(msg)
        for pos in range(15):
            corrupted = list(codeword)
            corrupted[pos] ^= 0xAA
            self.assertEqual(rs.decode(corrupted), msg, msg=f"pos={pos}")

    def test_two_errors(self):
        rs = ReedSolomon(n=15, k=11)  # t = 2
        msg = list(range(11))
        codeword = rs.encode(msg)
        random.seed(42)
        for _ in range(20):
            positions = random.sample(range(15), 2)
            corrupted = list(codeword)
            for p in positions:
                corrupted[p] ^= random.randint(1, 255)
            self.assertEqual(rs.decode(corrupted), msg)

    def test_max_errors_voyager_code(self):
        # RS(255, 223) -- Voyager 2's outer code, corrects 16 byte errors.
        rs = ReedSolomon(n=255, k=223)
        msg = [random.randint(0, 255) for _ in range(223)]
        codeword = rs.encode(msg)
        random.seed(1234)
        positions = random.sample(range(255), 16)
        corrupted = list(codeword)
        for p in positions:
            corrupted[p] ^= random.randint(1, 255)
        self.assertEqual(rs.decode(corrupted), msg)

    def test_too_many_errors_detected(self):
        rs = ReedSolomon(n=15, k=11)   # t = 2; injecting 3 must fail
        msg = list(range(11))
        codeword = rs.encode(msg)
        random.seed(7)
        positions = random.sample(range(15), 3)
        corrupted = list(codeword)
        for p in positions:
            corrupted[p] ^= random.randint(1, 255)
        with self.assertRaises(DecodeError):
            rs.decode(corrupted)


class TestRandomStress(unittest.TestCase):
    def test_random_stress_15_11(self):
        rs = ReedSolomon(n=15, k=11)
        rng = random.Random(0)
        for trial in range(50):
            msg = [rng.randint(0, 255) for _ in range(11)]
            codeword = rs.encode(msg)
            n_errors = rng.randint(0, 2)
            positions = rng.sample(range(15), n_errors)
            corrupted = list(codeword)
            for p in positions:
                corrupted[p] ^= rng.randint(1, 255)
            self.assertEqual(rs.decode(corrupted), msg,
                             msg=f"trial={trial} errors={n_errors}")

    def test_random_stress_qr_like(self):
        # QR-code-like parameters: RS(26, 19) -> 3 correctable errors
        rs = ReedSolomon(n=26, k=19)
        rng = random.Random(123)
        for trial in range(20):
            msg = [rng.randint(0, 255) for _ in range(19)]
            codeword = rs.encode(msg)
            n_errors = rng.randint(0, 3)
            positions = rng.sample(range(26), n_errors)
            corrupted = list(codeword)
            for p in positions:
                corrupted[p] ^= rng.randint(1, 255)
            self.assertEqual(rs.decode(corrupted), msg)


class TestEdgeCases(unittest.TestCase):
    def test_all_zero_message(self):
        rs = ReedSolomon(n=15, k=11)
        msg = [0] * 11
        codeword = rs.encode(msg)
        self.assertEqual(rs.decode(codeword), msg)

    def test_all_ff_message(self):
        rs = ReedSolomon(n=15, k=11)
        msg = [0xFF] * 11
        codeword = rs.encode(msg)
        corrupted = list(codeword)
        corrupted[5] ^= 0x42
        self.assertEqual(rs.decode(corrupted), msg)

    def test_decode_wrong_length(self):
        rs = ReedSolomon(n=15, k=11)
        with self.assertRaises(ValueError):
            rs.decode([0] * 10)


if __name__ == "__main__":
    unittest.main()
