// Fast I/O Techniques for Competitive Programming (Go)

package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
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

// Buffered input for very large inputs
type BufferedInput struct {
	buffer []string
	index  int
}

func NewBufferedInput() *BufferedInput {
	scanner := bufio.NewScanner(os.Stdin)
	var tokens []string
	for scanner.Scan() {
		line := scanner.Text()
		tokens = append(tokens, strings.Fields(line)...)
	}
	return &BufferedInput{buffer: tokens, index: 0}
}

func (bi *BufferedInput) Next() string {
	if bi.index >= len(bi.buffer) {
		return ""
	}
	result := bi.buffer[bi.index]
	bi.index++
	return result
}

func (bi *BufferedInput) NextInt() int {
	s := bi.Next()
	val, _ := strconv.Atoi(s)
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
