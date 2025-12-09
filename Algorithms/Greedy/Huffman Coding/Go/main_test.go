package main

import "testing"

func TestHuffmanEncode(t *testing.T) {
	text := "hello"
	codes := HuffmanEncode(text)
	// Basic test - just check it returns something
	if codes == nil {
		t.Error("Expected non-nil codes")
	}
}

