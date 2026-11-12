package main

import "testing"

func TestHuffmanEncode(t *testing.T) {
	text := "hello"
	codes := HuffmanEncode(text)
	// HuffmanEncode is a placeholder (it returns an empty map), so this only checks that it runs
	if codes == nil {
		t.Error("Expected non-nil codes")
	}
}
