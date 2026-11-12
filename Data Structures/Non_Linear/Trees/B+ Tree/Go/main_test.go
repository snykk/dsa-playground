package main

import (
	"fmt"
	"math/rand"
	"reflect"
	"sort"
	"testing"
)

// checkNode returns the leaf depth below node and appends leaves in order.
func checkNode(t *testing.T, b *BPlusTree, node *BPlusTreeNode, isRoot bool, lo, hi *int, leaves *[]*BPlusTreeNode) int {
	t.Helper()
	n := len(node.keys)
	if n > b.maxKeys || (!isRoot && n < b.minKeys) || (isRoot && !node.isLeaf && n < 1) {
		t.Fatalf("bad key count %d", n)
	}
	for i, k := range node.keys {
		if i > 0 && node.keys[i-1] >= k {
			t.Fatalf("keys not strictly increasing: %v", node.keys)
		}
		if (lo != nil && k < *lo) || (hi != nil && k >= *hi) {
			t.Fatalf("key %d outside its separators", k)
		}
	}
	if node.isLeaf {
		if len(node.values) != n || len(node.children) != 0 {
			t.Fatal("malformed leaf")
		}
		*leaves = append(*leaves, node)
		return 0
	}
	if len(node.children) != n+1 {
		t.Fatalf("%d keys but %d children", n, len(node.children))
	}
	depth := -1
	for i, child := range node.children {
		cLo, cHi := lo, hi
		if i > 0 {
			cLo = &node.keys[i-1]
		}
		if i < n {
			cHi = &node.keys[i]
		}
		d := checkNode(t, b, child, false, cLo, cHi, leaves)
		if depth == -1 {
			depth = d
		} else if depth != d {
			t.Fatal("leaves at different depths")
		}
	}
	return depth + 1
}

func checkTree(t *testing.T, b *BPlusTree) {
	t.Helper()
	var leaves []*BPlusTreeNode
	checkNode(t, b, b.root, true, nil, nil, &leaves)
	for i := 0; i+1 < len(leaves); i++ {
		if leaves[i].next != leaves[i+1] {
			t.Fatal("broken leaf chain")
		}
	}
	if leaves[len(leaves)-1].next != nil {
		t.Fatal("last leaf has a next")
	}
}

func TestInsertAndSearch(t *testing.T) {
	bptree := NewBPlusTree(3)
	bptree.Insert(10, "value10")
	bptree.Insert(20, "value20")
	if bptree.Search(10) != "value10" {
		t.Error("Search failed")
	}
}

func TestSplitsKeepEveryKey(t *testing.T) {
	for deg := 2; deg <= 4; deg++ {
		b := NewBPlusTree(deg)
		for k := 1; k <= 200; k++ {
			b.Insert(k, fmt.Sprint("v", k))
		}
		checkTree(t, b)
		for k := 1; k <= 200; k++ {
			if b.Search(k) != fmt.Sprint("v", k) {
				t.Fatalf("lost key %d", k)
			}
		}
		if len(b.Traverse()) != 200 {
			t.Fatal("traverse lost keys")
		}
	}
}

func TestDuplicateKeyOverwrites(t *testing.T) {
	b := NewBPlusTree(2)
	for i := 0; i < 10; i++ {
		b.Insert(5, fmt.Sprint("v", i))
	}
	if b.Search(5) != "v9" || len(b.Traverse()) != 1 || len(b.RangeSearch(5, 5)) != 1 {
		t.Fatal("duplicate insert should overwrite")
	}
}

func TestRandomAgainstMap(t *testing.T) {
	for deg := 2; deg <= 4; deg++ {
		rng := rand.New(rand.NewSource(int64(deg)))
		b := NewBPlusTree(deg)
		ref := map[int]string{}
		for step := 0; step < 3000; step++ {
			key := rng.Intn(400)
			v := fmt.Sprint("v", step)
			b.Insert(key, v)
			ref[key] = v
			if step%100 == 0 {
				checkTree(t, b)
			}
		}
		checkTree(t, b)
		keys := []int{}
		for k := range ref {
			keys = append(keys, k)
		}
		sort.Ints(keys)
		want := []KeyValue{}
		for _, k := range keys {
			want = append(want, KeyValue{k, ref[k]})
		}
		if !reflect.DeepEqual(b.Traverse(), want) {
			t.Fatal("traverse mismatch")
		}
		for i := 0; i < 200; i++ {
			lo := rng.Intn(420) - 10
			hi := lo + rng.Intn(100)
			wantRange := []KeyValue{}
			for _, kv := range want {
				if kv.Key >= lo && kv.Key <= hi {
					wantRange = append(wantRange, kv)
				}
			}
			if !reflect.DeepEqual(b.RangeSearch(lo, hi), wantRange) {
				t.Fatalf("range [%d, %d] mismatch", lo, hi)
			}
		}
	}
}
