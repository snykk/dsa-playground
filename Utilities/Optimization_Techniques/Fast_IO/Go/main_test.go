package main

import (
	"bufio"
	"bytes"
	"strconv"
	"strings"
	"testing"
)

func TestReadInt(t *testing.T) {
	input := bytes.NewBufferString("42\n")
	reader = bufio.NewReader(input)
	result := readInt()
	if result != 42 {
		t.Errorf("Expected 42, got %d", result)
	}
}

func TestReadInts(t *testing.T) {
	input := bytes.NewBufferString("1 2 3 4 5\n")
	reader = bufio.NewReader(input)
	result := readInts(5)
	expected := []int{1, 2, 3, 4, 5}
	for i, v := range expected {
		if result[i] != v {
			t.Errorf("Expected %d, got %d", v, result[i])
		}
	}
}

func TestBufferedInputTokens(t *testing.T) {
	bi := NewBufferedInputFrom(strings.NewReader("3\n10 20\n30\n"))
	if bi.NextInt() != 3 || bi.NextInt() != 10 || bi.NextInt() != 20 || bi.NextInt() != 30 {
		t.Error("unexpected tokens")
	}
	if bi.Next() != "" {
		t.Error("expected an empty token at the end of input")
	}
	if bi.Err() != nil {
		t.Errorf("unexpected error %v", bi.Err())
	}
}

func TestBufferedInputLongLine(t *testing.T) {
	// One line of 100,000 integers (about 600 KB) used to produce no tokens
	// because bufio.Scanner stops at 64 KiB per line.
	const n = 100000
	var sb strings.Builder
	want := 0
	for i := 0; i < n; i++ {
		sb.WriteString(strconv.Itoa(i))
		sb.WriteByte(' ')
		want += i
	}
	bi := NewBufferedInputFrom(strings.NewReader(sb.String()))
	got := 0
	for i := 0; i < n; i++ {
		got += bi.NextInt()
	}
	if got != want {
		t.Errorf("sum = %d, expected %d", got, want)
	}
	if bi.Err() != nil {
		t.Errorf("unexpected error %v", bi.Err())
	}
}

func TestBufferedInputReportsBadToken(t *testing.T) {
	bi := NewBufferedInputFrom(strings.NewReader("12 abc"))
	if bi.NextInt() != 12 || bi.Err() != nil {
		t.Fatal("first token should parse cleanly")
	}
	if bi.NextInt() != 0 {
		t.Error("a bad token yields 0")
	}
	if bi.Err() == nil {
		t.Error("the parse error must be recorded, not ignored")
	}
}

func TestBufferedInputTokenTooLong(t *testing.T) {
	bi := NewBufferedInputFrom(strings.NewReader("1 " + strings.Repeat("9", 2<<20)))
	if bi.Err() == nil {
		t.Error("a token over the 1 MiB limit must be reported by Err")
	}
}

func TestReadIntEndOfInput(t *testing.T) {
	reader = bufio.NewReader(strings.NewReader(""))
	if readInt() != 0 {
		t.Error("readInt at end of input should return 0")
	}
}
