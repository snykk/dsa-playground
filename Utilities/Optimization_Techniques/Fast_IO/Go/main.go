// Fast I/O Techniques for Competitive Programming (Go)

package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strconv"
)

var (
	reader = bufio.NewReader(os.Stdin)
	writer = bufio.NewWriter(os.Stdout)
)

// Fast integer read
func readInt() int {
	var x int
	fmt.Fscan(reader, &x)
	return x
}

func readInt64() int64 {
	var x int64
	fmt.Fscan(reader, &x)
	return x
}

func readString() string {
	var s string
	fmt.Fscan(reader, &s)
	return s
}

func readInts(n int) []int {
	a := make([]int, n)
	for i := 0; i < n; i++ {
		fmt.Fscan(reader, &a[i])
	}
	return a
}

// Fast output
func println(a ...interface{}) {
	fmt.Fprintln(writer, a...)
}

func printf(format string, a ...interface{}) {
	fmt.Fprintf(writer, format, a...)
}

// Buffered input for very large inputs: all whitespace-separated tokens of the
// stream are read up front.
type BufferedInput struct {
	buffer []string
	index  int
	err    error
}

// NewBufferedInput reads every token from standard input.
func NewBufferedInput() *BufferedInput {
	return NewBufferedInputFrom(os.Stdin)
}

// NewBufferedInputFrom reads every token from r. It splits on words, not lines,
// so a single line of any length works (a line scanner stops at 64 KiB per
// line). A token longer than 1 MiB makes the read stop; Err reports it.
func NewBufferedInputFrom(r io.Reader) *BufferedInput {
	scanner := bufio.NewScanner(r)
	scanner.Buffer(make([]byte, 0, 1<<16), 1<<20)
	scanner.Split(bufio.ScanWords)
	var tokens []string
	for scanner.Scan() {
		tokens = append(tokens, scanner.Text())
	}
	return &BufferedInput{buffer: tokens, err: scanner.Err()}
}

// Err returns the first read or parse error seen so far (nil if none).
func (bi *BufferedInput) Err() error {
	return bi.err
}

// Next returns the next token, or "" when the input is exhausted.
func (bi *BufferedInput) Next() string {
	if bi.index >= len(bi.buffer) {
		return ""
	}
	result := bi.buffer[bi.index]
	bi.index++
	return result
}

// NextInt parses the next token as an int. At the end of input, or for a
// token that is not an integer, it returns 0 and records the error in Err.
func (bi *BufferedInput) NextInt() int {
	s := bi.Next()
	val, err := strconv.Atoi(s)
	if err != nil && bi.err == nil {
		bi.err = err
	}
	return val
}

func main() {
	defer writer.Flush()

	// Example usage
	n := readInt()
	arr := readInts(n)
	sum := 0
	for _, x := range arr {
		sum += x
	}
	println(sum)
}
