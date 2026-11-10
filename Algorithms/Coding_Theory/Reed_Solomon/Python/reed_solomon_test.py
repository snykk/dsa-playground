"""Unit tests for Reed-Solomon over GF(2^8)."""
import random
import unittest

from reed_solomon import GF, DecodeError, ReedSolomon


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

    def test_accepts_bytes_and_tuples(self):
        rs = ReedSolomon(n=15, k=11)
        codeword = rs.encode(b"Hello DSA!!")
        self.assertEqual(rs.decode(tuple(codeword)), list(b"Hello DSA!!"))


class TestErasures(unittest.TestCase):
    def test_erasures_only_use_full_parity_budget(self):
        # n - k = 4 parity bytes: 4 known-bad positions are recoverable,
        # twice the t = 2 limit for errors at unknown positions.
        rs = ReedSolomon(n=15, k=11)
        msg = list(range(11))
        corrupted = rs.encode(msg)
        erasures = [0, 5, 9, 14]
        for p in erasures:
            corrupted[p] = 0
        self.assertEqual(rs.decode(corrupted, erasures=erasures), msg)

    def test_same_damage_needs_erasure_info(self):
        # RS(7, 5) has t = 1, so two wrong bytes are uncorrectable unless
        # the decoder is told where they are.
        rs = ReedSolomon(n=7, k=5)
        msg = [2, 3, 5, 7, 11]
        corrupted = rs.encode(msg)
        corrupted[2] = 0
        corrupted[5] = 0
        with self.assertRaises(DecodeError):
            rs.decode(corrupted)
        self.assertEqual(rs.decode(corrupted, erasures=[2, 5]), msg)

    def test_mixed_erasures_and_errors(self):
        # RS(15, 7): 8 parity bytes, budget e + 2v <= 8 -> 4 erasures + 2 errors.
        rs = ReedSolomon(n=15, k=7)
        msg = [ord(c) for c in "ABCDEFG"]
        corrupted = rs.encode(msg)
        erasures = [0, 1, 2, 3]
        for p in erasures:
            corrupted[p] = 0xFF
        corrupted[7] ^= 0xAA
        corrupted[11] ^= 0x55
        self.assertEqual(rs.decode(corrupted, erasures=erasures), msg)

    def test_random_errors_and_erasures_within_budget(self):
        rng = random.Random(2024)
        for n, k in [(15, 7), (26, 16), (255, 223)]:
            rs = ReedSolomon(n=n, k=k)
            for trial in range(30):
                msg = [rng.randint(0, 255) for _ in range(k)]
                corrupted = rs.encode(msg)
                e = rng.randint(0, n - k)
                v = rng.randint(0, (n - k - e) // 2)
                positions = rng.sample(range(n), e + v)
                erasures, errors = positions[:e], positions[e:]
                for p in erasures:
                    corrupted[p] = rng.randint(0, 255)
                for p in errors:
                    corrupted[p] ^= rng.randint(1, 255)
                self.assertEqual(rs.decode(corrupted, erasures=erasures), msg,
                                 msg=f"RS({n},{k}) trial={trial} e={e} v={v}")

    def test_erased_but_intact_bytes_are_fine(self):
        # Flagging a position that happens to be correct costs budget but is safe.
        rs = ReedSolomon(n=15, k=11)
        msg = list(range(11))
        self.assertEqual(rs.decode(rs.encode(msg), erasures=[1, 4]), msg)

    def test_duplicate_erasures_are_deduplicated(self):
        rs = ReedSolomon(n=15, k=11)
        msg = list(range(11))
        corrupted = rs.encode(msg)
        corrupted[6] ^= 0x10
        self.assertEqual(rs.decode(corrupted, erasures=[6, 6, 6]), msg)

    def test_erasure_position_out_of_range(self):
        rs = ReedSolomon(n=15, k=11)
        codeword = rs.encode(list(range(11)))
        with self.assertRaises(ValueError):
            rs.decode(codeword, erasures=[15])
        with self.assertRaises(ValueError):
            rs.decode(codeword, erasures=[-1])

    def test_too_many_erasures(self):
        rs = ReedSolomon(n=15, k=11)
        codeword = rs.encode(list(range(11)))
        with self.assertRaises(DecodeError):
            rs.decode(codeword, erasures=[0, 1, 2, 3, 4])

    def test_beyond_budget_with_erasures_detected(self):
        # RS(15, 7): 4 erasures + 3 errors costs 4 + 2*3 = 10 > 8 parity bytes.
        rs = ReedSolomon(n=15, k=7)
        corrupted = rs.encode(list(range(7)))
        erasures = [0, 1, 2, 3]
        for p in erasures:
            corrupted[p] ^= 0x5A
        for p in (6, 9, 12):
            corrupted[p] ^= 0xC3
        with self.assertRaises(DecodeError):
            rs.decode(corrupted, erasures=erasures)


class TestFirstConsecutiveRoot(unittest.TestCase):
    def test_codeword_vanishes_at_generator_roots(self):
        # Every codeword is a multiple of g(x), so it evaluates to zero at each
        # root alpha^(fcr + i) of g(x).
        for fcr in (0, 1, 5, 112):
            rs = ReedSolomon(n=15, k=9, fcr=fcr)
            codeword = rs.encode(list(range(1, 10)))
            for i in range(rs.n - rs.k):
                root = GF.pow(rs.alpha, fcr + i)
                self.assertEqual(GF.poly_eval(codeword, root), 0, msg=f"fcr={fcr} i={i}")

    def test_round_trip_with_errors_and_erasures_for_each_fcr(self):
        rng = random.Random(77)
        for fcr in (0, 1, 2, 112, 200):
            rs = ReedSolomon(n=26, k=16, fcr=fcr)
            for trial in range(20):
                msg = [rng.randint(0, 255) for _ in range(16)]
                corrupted = rs.encode(msg)
                e = rng.randint(0, 10)
                v = rng.randint(0, (10 - e) // 2)
                positions = rng.sample(range(26), e + v)
                for p in positions:
                    corrupted[p] ^= rng.randint(1, 255)
                self.assertEqual(rs.decode(corrupted, erasures=positions[:e]), msg,
                                 msg=f"fcr={fcr} trial={trial} e={e} v={v}")

    def test_encoder_and_decoder_must_agree_on_fcr(self):
        # A clean fcr=1 codeword is NOT a codeword of the fcr=0 code: it does not
        # vanish at alpha^0, so the fcr=0 decoder sees "errors" it cannot fix.
        msg = list(range(11))
        codeword = ReedSolomon(n=15, k=11, fcr=1).encode(msg)
        with self.assertRaises(DecodeError):
            ReedSolomon(n=15, k=11, fcr=0).decode(codeword)


if __name__ == "__main__":
    unittest.main()
