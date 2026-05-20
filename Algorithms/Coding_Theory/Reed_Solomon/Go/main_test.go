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
