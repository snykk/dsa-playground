package main

import (
	"bytes"
	"errors"
	"math/rand"
	"testing"
)

func mustNewRS(t *testing.T, n, k int) *ReedSolomon {
	rs, err := NewReedSolomon(n, k, 3)
	if err != nil {
		t.Fatalf("NewReedSolomon(%d, %d): %v", n, k, err)
	}
	return rs
}

func TestEncodeLength(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	msg := []byte{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	cw, err := rs.Encode(msg)
	if err != nil {
		t.Fatal(err)
	}
	if len(cw) != 15 {
		t.Errorf("codeword length = %d, want 15", len(cw))
	}
}

func TestSystematicLayout(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	msg := []byte{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11}
	cw, _ := rs.Encode(msg)
	if !bytes.Equal(cw[4:], msg) {
		t.Errorf("last k bytes %v != message %v", cw[4:], msg)
	}
}

func TestInvalidParams(t *testing.T) {
	for _, c := range []struct{ n, k int }{{10, 10}, {5, 10}, {300, 200}} {
		if _, err := NewReedSolomon(c.n, c.k, 3); err == nil {
			t.Errorf("NewReedSolomon(%d, %d) should error", c.n, c.k)
		}
	}
}

func TestWrongMessageLength(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	if _, err := rs.Encode([]byte{1, 2, 3}); err == nil {
		t.Error("Encode with wrong length should error")
	}
}

func TestRoundTripNoErrors(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	rng := rand.New(rand.NewSource(42))
	for trial := 0; trial < 10; trial++ {
		msg := make([]byte, 11)
		for i := range msg {
			msg[i] = byte(rng.Intn(256))
		}
		cw, _ := rs.Encode(msg)
		recovered, err := rs.Decode(cw)
		if err != nil {
			t.Fatalf("trial %d: %v", trial, err)
		}
		if !bytes.Equal(recovered, msg) {
			t.Errorf("trial %d: got %v, want %v", trial, recovered, msg)
		}
	}
}

func TestOneError(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	msg := []byte{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	cw, _ := rs.Encode(msg)
	for pos := 0; pos < 15; pos++ {
		corrupted := append([]byte(nil), cw...)
		corrupted[pos] ^= 0xAA
		recovered, err := rs.Decode(corrupted)
		if err != nil {
			t.Fatalf("pos=%d: %v", pos, err)
		}
		if !bytes.Equal(recovered, msg) {
			t.Errorf("pos=%d: got %v, want %v", pos, recovered, msg)
		}
	}
}

func TestTwoErrors(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	msg := []byte{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	cw, _ := rs.Encode(msg)
	rng := rand.New(rand.NewSource(42))
	for trial := 0; trial < 20; trial++ {
		positions := rng.Perm(15)[:2]
		corrupted := append([]byte(nil), cw...)
		for _, p := range positions {
			flip := byte(1 + rng.Intn(255))
			corrupted[p] ^= flip
		}
		recovered, err := rs.Decode(corrupted)
		if err != nil {
			t.Fatalf("trial %d: %v", trial, err)
		}
		if !bytes.Equal(recovered, msg) {
			t.Errorf("trial %d: got %v, want %v", trial, recovered, msg)
		}
	}
}

func TestVoyagerRS255_223(t *testing.T) {
	rs := mustNewRS(t, 255, 223)
	rng := rand.New(rand.NewSource(123))
	msg := make([]byte, 223)
	for i := range msg {
		msg[i] = byte(rng.Intn(256))
	}
	cw, _ := rs.Encode(msg)
	positions := rng.Perm(255)[:16]
	corrupted := append([]byte(nil), cw...)
	for _, p := range positions {
		corrupted[p] ^= byte(1 + rng.Intn(255))
	}
	recovered, err := rs.Decode(corrupted)
	if err != nil {
		t.Fatalf("decode: %v", err)
	}
	if !bytes.Equal(recovered, msg) {
		t.Error("recovered message does not match original")
	}
}

func TestTooManyErrorsDetected(t *testing.T) {
	rs := mustNewRS(t, 15, 11) // t = 2; injecting 3 must fail
	msg := []byte{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	cw, _ := rs.Encode(msg)
	corrupted := append([]byte(nil), cw...)
	corrupted[1] ^= 0x11
	corrupted[5] ^= 0x22
	corrupted[10] ^= 0x33
	_, err := rs.Decode(corrupted)
	if !errors.Is(err, ErrDecode) {
		t.Errorf("got %v, want ErrDecode", err)
	}
}

func TestQRLikeRandomStress(t *testing.T) {
	rs := mustNewRS(t, 26, 19) // QR-code-like, t = 3
	rng := rand.New(rand.NewSource(7))
	for trial := 0; trial < 20; trial++ {
		msg := make([]byte, 19)
		for i := range msg {
			msg[i] = byte(rng.Intn(256))
		}
		cw, _ := rs.Encode(msg)
		nErrors := rng.Intn(4) // 0..3
		positions := rng.Perm(26)[:nErrors]
		corrupted := append([]byte(nil), cw...)
		for _, p := range positions {
			corrupted[p] ^= byte(1 + rng.Intn(255))
		}
		recovered, err := rs.Decode(corrupted)
		if err != nil {
			t.Fatalf("trial %d errors=%d: %v", trial, nErrors, err)
		}
		if !bytes.Equal(recovered, msg) {
			t.Errorf("trial %d: got %v, want %v", trial, recovered, msg)
		}
	}
}

func TestAllZeroMessage(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	msg := make([]byte, 11)
	cw, _ := rs.Encode(msg)
	recovered, err := rs.Decode(cw)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(recovered, msg) {
		t.Errorf("got %v, want all-zero", recovered)
	}
}

func TestDecodeWrongLength(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	if _, err := rs.Decode(make([]byte, 10)); err == nil {
		t.Error("Decode with wrong length should error")
	}
}

// Shared cross-language fixture (same bytes in the Python and C++ tests and in
// the topic README's step-by-step trace).
func TestKnownCodewordRS7_5(t *testing.T) {
	rs := mustNewRS(t, 7, 5)
	cw, _ := rs.Encode([]byte{2, 3, 5, 7, 11})
	want := []byte{87, 95, 2, 3, 5, 7, 11}
	if !bytes.Equal(cw, want) {
		t.Errorf("codeword = %v, want %v", cw, want)
	}
}

func rangeBytes(count, start int) []byte {
	out := make([]byte, count)
	for i := range out {
		out[i] = byte(start + i)
	}
	return out
}

func decodeOK(t *testing.T, rs *ReedSolomon, received []byte, erasures []int, want []byte) {
	t.Helper()
	got, err := rs.DecodeWithErasures(received, erasures)
	if err != nil {
		t.Fatalf("DecodeWithErasures(erasures=%v): %v", erasures, err)
	}
	if !bytes.Equal(got, want) {
		t.Fatalf("DecodeWithErasures(erasures=%v) = %v, want %v", erasures, got, want)
	}
}

func TestErasuresOnlyUseFullParityBudget(t *testing.T) {
	// n - k = 4 parity bytes: 4 known-bad positions are recoverable, twice
	// the t = 2 limit for errors at unknown positions.
	rs := mustNewRS(t, 15, 11)
	msg := rangeBytes(11, 0)
	corrupted, _ := rs.Encode(msg)
	erasures := []int{0, 5, 9, 14}
	for _, p := range erasures {
		corrupted[p] = 0
	}
	decodeOK(t, rs, corrupted, erasures, msg)
}

func TestSameDamageNeedsErasureInfo(t *testing.T) {
	// RS(7, 5) has t = 1: two wrong bytes are fixable only if their positions are known.
	rs := mustNewRS(t, 7, 5)
	msg := []byte{2, 3, 5, 7, 11}
	corrupted, _ := rs.Encode(msg)
	corrupted[2] = 0
	corrupted[5] = 0
	if _, err := rs.Decode(corrupted); !errors.Is(err, ErrDecode) {
		t.Errorf("Decode without erasures: got %v, want ErrDecode", err)
	}
	decodeOK(t, rs, corrupted, []int{2, 5}, msg)
}

func TestMixedErasuresAndErrors(t *testing.T) {
	// RS(15, 7): 8 parity bytes, budget e + 2v <= 8 -> 4 erasures + 2 errors.
	rs := mustNewRS(t, 15, 7)
	msg := []byte("ABCDEFG")
	corrupted, _ := rs.Encode(msg)
	erasures := []int{0, 1, 2, 3}
	for _, p := range erasures {
		corrupted[p] = 0xFF
	}
	corrupted[7] ^= 0xAA
	corrupted[11] ^= 0x55
	decodeOK(t, rs, corrupted, erasures, msg)
}

func TestRandomErrorsAndErasuresWithinBudget(t *testing.T) {
	rng := rand.New(rand.NewSource(2024))
	for _, c := range []struct{ n, k int }{{15, 7}, {26, 16}, {255, 223}} {
		rs := mustNewRS(t, c.n, c.k)
		for trial := 0; trial < 30; trial++ {
			msg := make([]byte, c.k)
			for i := range msg {
				msg[i] = byte(rng.Intn(256))
			}
			corrupted, _ := rs.Encode(msg)
			e := rng.Intn(c.n - c.k + 1)
			v := rng.Intn((c.n-c.k-e)/2 + 1)
			positions := rng.Perm(c.n)[:e+v]
			erasures := positions[:e]
			for _, p := range erasures {
				corrupted[p] = byte(rng.Intn(256))
			}
			for _, p := range positions[e:] {
				corrupted[p] ^= byte(1 + rng.Intn(255))
			}
			decodeOK(t, rs, corrupted, erasures, msg)
		}
	}
}

func TestErasedButIntactBytesAreFine(t *testing.T) {
	// Flagging a position that happens to be correct costs budget but is safe.
	rs := mustNewRS(t, 15, 11)
	msg := rangeBytes(11, 0)
	cw, _ := rs.Encode(msg)
	decodeOK(t, rs, cw, []int{1, 4}, msg)
}

func TestDuplicateErasuresAreDeduplicated(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	msg := rangeBytes(11, 0)
	corrupted, _ := rs.Encode(msg)
	corrupted[6] ^= 0x10
	decodeOK(t, rs, corrupted, []int{6, 6, 6}, msg)
}

func TestErasurePositionOutOfRange(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	cw, _ := rs.Encode(rangeBytes(11, 0))
	for _, bad := range []int{15, -1} {
		_, err := rs.DecodeWithErasures(cw, []int{bad})
		if err == nil || errors.Is(err, ErrDecode) {
			t.Errorf("erasure %d: got %v, want a non-ErrDecode input error", bad, err)
		}
	}
}

func TestTooManyErasures(t *testing.T) {
	rs := mustNewRS(t, 15, 11)
	cw, _ := rs.Encode(rangeBytes(11, 0))
	if _, err := rs.DecodeWithErasures(cw, []int{0, 1, 2, 3, 4}); !errors.Is(err, ErrDecode) {
		t.Errorf("got %v, want ErrDecode", err)
	}
}

func TestBeyondBudgetWithErasuresDetected(t *testing.T) {
	// RS(15, 7): 4 erasures + 3 errors costs 4 + 2*3 = 10 > 8 parity bytes.
	rs := mustNewRS(t, 15, 7)
	corrupted, _ := rs.Encode(rangeBytes(7, 0))
	erasures := []int{0, 1, 2, 3}
	for _, p := range erasures {
		corrupted[p] ^= 0x5A
	}
	for _, p := range []int{6, 9, 12} {
		corrupted[p] ^= 0xC3
	}
	if _, err := rs.DecodeWithErasures(corrupted, erasures); !errors.Is(err, ErrDecode) {
		t.Errorf("got %v, want ErrDecode", err)
	}
}

func mustNewRSWithFCR(t *testing.T, n, k, fcr int) *ReedSolomon {
	t.Helper()
	rs, err := NewReedSolomonWithFCR(n, k, 3, fcr)
	if err != nil {
		t.Fatalf("NewReedSolomonWithFCR(%d, %d, 3, %d): %v", n, k, fcr, err)
	}
	return rs
}

func TestCodewordVanishesAtGeneratorRoots(t *testing.T) {
	// Every codeword is a multiple of g(x), so it is zero at each root alpha^(fcr+i).
	for _, fcr := range []int{0, 1, 5, 112} {
		rs := mustNewRSWithFCR(t, 15, 9, fcr)
		cw, _ := rs.Encode(rangeBytes(9, 1))
		for i := 0; i < rs.N()-rs.K(); i++ {
			if v := polyEval(cw, gfPow(rs.Alpha(), fcr+i)); v != 0 {
				t.Errorf("fcr=%d i=%d: codeword(alpha^(fcr+i)) = %d, want 0", fcr, i, v)
			}
		}
	}
}

func TestRoundTripWithErrorsAndErasuresForEachFCR(t *testing.T) {
	rng := rand.New(rand.NewSource(77))
	for _, fcr := range []int{0, 1, 2, 112, 200} {
		rs := mustNewRSWithFCR(t, 26, 16, fcr)
		for trial := 0; trial < 20; trial++ {
			msg := make([]byte, 16)
			for i := range msg {
				msg[i] = byte(rng.Intn(256))
			}
			corrupted, _ := rs.Encode(msg)
			e := rng.Intn(11)
			v := rng.Intn((10-e)/2 + 1)
			positions := rng.Perm(26)[:e+v]
			for _, p := range positions {
				corrupted[p] ^= byte(1 + rng.Intn(255))
			}
			decodeOK(t, rs, corrupted, positions[:e], msg)
		}
	}
}

func TestEncoderAndDecoderMustAgreeOnFCR(t *testing.T) {
	// A clean fcr=1 codeword is NOT a codeword of the fcr=0 code.
	cw, _ := mustNewRSWithFCR(t, 15, 11, 1).Encode(rangeBytes(11, 0))
	if _, err := mustNewRSWithFCR(t, 15, 11, 0).Decode(cw); !errors.Is(err, ErrDecode) {
		t.Errorf("got %v, want ErrDecode", err)
	}
}
