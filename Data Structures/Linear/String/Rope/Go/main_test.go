package main

import "testing"

func TestCreateFromString(t *testing.T) {
	r := NewRope("Hello, World!")
	if r.ToString() != "Hello, World!" {
		t.Errorf("expected 'Hello, World!', got '%s'", r.ToString())
	}
	if r.Len() != 13 {
		t.Errorf("expected length 13, got %d", r.Len())
	}
}

func TestEmptyRope(t *testing.T) {
	r := NewRope("")
	if r.ToString() != "" {
		t.Errorf("expected empty string, got '%s'", r.ToString())
	}
	if r.Len() != 0 {
		t.Errorf("expected length 0, got %d", r.Len())
	}
}

func TestSingleChar(t *testing.T) {
	r := NewRope("A")
	if r.ToString() != "A" {
		t.Errorf("expected 'A', got '%s'", r.ToString())
	}
	ch, err := r.Index(0)
	if err != nil || ch != 'A' {
		t.Errorf("expected 'A' at index 0")
	}
}

func TestIndexAccess(t *testing.T) {
	r := NewRope("Hello, World!")
	tests := []struct {
		i    int
		want byte
	}{
		{0, 'H'}, {4, 'o'}, {7, 'W'}, {12, '!'},
	}
	for _, tt := range tests {
		ch, err := r.Index(tt.i)
		if err != nil || ch != tt.want {
			t.Errorf("Index(%d): expected '%c', got '%c' (err=%v)", tt.i, tt.want, ch, err)
		}
	}
}

func TestIndexOutOfBounds(t *testing.T) {
	r := NewRope("abc")
	_, err := r.Index(3)
	if err == nil {
		t.Errorf("expected error for index 3")
	}
	_, err = r.Index(-1)
	if err == nil {
		t.Errorf("expected error for index -1")
	}
}

func TestConcat(t *testing.T) {
	r1 := NewRope("Hello, ")
	r2 := NewRope("World!")
	r3 := r1.Concat(r2)
	if r3.ToString() != "Hello, World!" {
		t.Errorf("expected 'Hello, World!', got '%s'", r3.ToString())
	}
	if r3.Len() != 13 {
		t.Errorf("expected length 13, got %d", r3.Len())
	}
}

func TestConcatWithEmpty(t *testing.T) {
	r1 := NewRope("Hello")
	r2 := NewRope("")
	if r1.Concat(r2).ToString() != "Hello" {
		t.Errorf("concat with empty right failed")
	}
	if r2.Concat(r1).ToString() != "Hello" {
		t.Errorf("concat with empty left failed")
	}
}

func TestSplit(t *testing.T) {
	r := NewRope("Hello, World!")
	left, right := r.Split(7)
	if left.ToString() != "Hello, " {
		t.Errorf("split left: expected 'Hello, ', got '%s'", left.ToString())
	}
	if right.ToString() != "World!" {
		t.Errorf("split right: expected 'World!', got '%s'", right.ToString())
	}
}

func TestSplitAtBoundaries(t *testing.T) {
	r := NewRope("Hello")
	l1, r1 := r.Split(0)
	if l1.ToString() != "" || r1.ToString() != "Hello" {
		t.Errorf("split at 0 failed: '%s' | '%s'", l1.ToString(), r1.ToString())
	}
	l2, r2 := r.Split(5)
	if l2.ToString() != "Hello" || r2.ToString() != "" {
		t.Errorf("split at end failed: '%s' | '%s'", l2.ToString(), r2.ToString())
	}
}

func TestInsertInMiddle(t *testing.T) {
	r := NewRope("Hello World!")
	r.Insert(5, ",")
	if r.ToString() != "Hello, World!" {
		t.Errorf("expected 'Hello, World!', got '%s'", r.ToString())
	}
}

func TestInsertAtStartAndEnd(t *testing.T) {
	r := NewRope("World!")
	r.Insert(0, "Hello, ")
	if r.ToString() != "Hello, World!" {
		t.Errorf("insert at start: expected 'Hello, World!', got '%s'", r.ToString())
	}

	r2 := NewRope("Hello, ")
	r2.Insert(7, "World!")
	if r2.ToString() != "Hello, World!" {
		t.Errorf("insert at end: expected 'Hello, World!', got '%s'", r2.ToString())
	}
}

func TestDeleteSubstring(t *testing.T) {
	r := NewRope("Hello, World!")
	r.Delete(5, 2)
	if r.ToString() != "HelloWorld!" {
		t.Errorf("expected 'HelloWorld!', got '%s'", r.ToString())
	}
}

func TestDeleteFromStartAndEnd(t *testing.T) {
	r1 := NewRope("Hello, World!")
	r1.Delete(0, 7)
	if r1.ToString() != "World!" {
		t.Errorf("delete from start: expected 'World!', got '%s'", r1.ToString())
	}

	r2 := NewRope("Hello, World!")
	r2.Delete(5, 8)
	if r2.ToString() != "Hello" {
		t.Errorf("delete to end: expected 'Hello', got '%s'", r2.ToString())
	}
}

func TestLongString(t *testing.T) {
	text := ""
	for i := 0; i < 100; i++ {
		text += "abcdefghij"
	}
	r := NewRope(text)
	if r.Len() != 1000 {
		t.Errorf("expected length 1000, got %d", r.Len())
	}
	if r.ToString() != text {
		t.Errorf("long string mismatch")
	}
	ch, _ := r.Index(0)
	if ch != 'a' {
		t.Errorf("expected 'a' at 0, got '%c'", ch)
	}
	ch, _ = r.Index(999)
	if ch != 'j' {
		t.Errorf("expected 'j' at 999, got '%c'", ch)
	}
}

func TestMultipleOperations(t *testing.T) {
	r := NewRope("Hello")
	r.Insert(5, " World")
	r.Insert(11, "!")
	if r.ToString() != "Hello World!" {
		t.Errorf("expected 'Hello World!', got '%s'", r.ToString())
	}
	r.Delete(5, 6)
	if r.ToString() != "Hello!" {
		t.Errorf("expected 'Hello!', got '%s'", r.ToString())
	}
}
